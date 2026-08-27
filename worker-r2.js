import currentWorker from "./worker.js";

const ALLOWED_TYPES = new Set(["image/png", "application/pdf"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const SESSION_TTL_DAYS = 7;

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

function getOrigin(request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  if (!origin) return requestOrigin;
  return origin === requestOrigin ? origin : null;
}

function text(form, key) {
  return String(form.get(key) || "").trim();
}

function normalizeLead(form) {
  const name = text(form, "name");
  const country = text(form, "country").toUpperCase();
  const phone = text(form, "phone");
  const email = text(form, "email").toLowerCase();
  const zip = text(form, "zip");
  const details = text(form, "details");
  let interests = [];
  try {
    const parsed = JSON.parse(String(form.get("interests") || "[]"));
    interests = Array.isArray(parsed) ? parsed.map(String).slice(0, 2) : [];
  } catch {
    interests = [];
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/.test(name)) throw new Error("Invalid name.");
  if (!/^[^\s@,]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) throw new Error("Invalid email.");
  if (!["US", "MX", "CA"].includes(country)) throw new Error("Unsupported country.");
  if (phone.replace(/\D/g, "").length !== 10) throw new Error("Invalid phone number.");
  if (country === "US" && !/^\d{5}$/.test(zip)) throw new Error("Invalid ZIP code.");
  if (country === "MX" && !/^\d{5}$/.test(zip)) throw new Error("Invalid postal code.");
  if (country === "CA" && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zip)) throw new Error("Invalid postal code.");
  if (!details && interests.length === 0) throw new Error("Project information is required.");
  if (details.length > 5000) throw new Error("Project details are too long.");
  if (interests.length > 2) throw new Error("Select up to two interests.");

  const file = form.get("attachment");
  if (file && typeof file === "object" && "size" in file) {
    if (!ALLOWED_TYPES.has(file.type)) throw new Error("Only PNG or PDF files are allowed.");
    if (file.size > MAX_FILE_SIZE) throw new Error("The file cannot exceed 10 MB.");
  }

  return { name, country, phone, email, zip, details, interests, file: file instanceof File ? file : null };
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomOtp() {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function sessionCookie(token, maxAge = SESSION_TTL_DAYS * 86400) {
  return `fh_admin_session=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function clearSessionCookie() {
  return "fh_admin_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax";
}

async function sendAdminOtp(env, email, code) {
  if (!env.RESEND_API_KEY) throw new Error("Email service is not configured.");

  const from = env.RESEND_FROM_EMAIL || "FORM & HALO <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your FORM & HALO admin access code",
      text: `Your FORM & HALO verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes. If you did not request this code, you can ignore this email.`,
    }),
  });

  if (!response.ok) {
    console.error("Resend error", response.status, await response.text());
    throw new Error("We could not send the access code.");
  }
}

async function requestAdminOtp(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  if (!/^[^\s@,]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) throw new Error("Enter a valid email address.");

  const admin = await env.DB.prepare("SELECT id, email, name, role, status FROM admin_users WHERE lower(email) = lower(?) LIMIT 1").bind(email).first();

  // Do not reveal whether an email belongs to an administrator.
  if (!admin || admin.status !== "active") {
    return { success: true, message: "If that email is authorized, a verification code has been sent." };
  }

  const recent = await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_login_codes WHERE admin_user_id = ? AND created_at >= datetime('now','-15 minutes')").bind(admin.id).first("count");
  if (Number(recent || 0) >= 5) throw new Error("Too many code requests. Please wait a few minutes and try again.");

  await env.DB.prepare("UPDATE admin_login_codes SET consumed_at = COALESCE(consumed_at, datetime('now')) WHERE admin_user_id = ? AND consumed_at IS NULL").bind(admin.id).run();

  const code = randomOtp();
  const codeHash = await sha256Hex(code);
  const id = crypto.randomUUID();

  await env.DB.prepare("INSERT INTO admin_login_codes (id, admin_user_id, code_hash, expires_at) VALUES (?, ?, ?, datetime('now', ?))").bind(id, admin.id, codeHash, `+${OTP_TTL_MINUTES} minutes`).run();
  await sendAdminOtp(env, admin.email, code);

  return { success: true, message: "If that email is authorized, a verification code has been sent." };
}

async function verifyAdminOtp(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const code = String(body?.code || "").trim();

  if (!/^[^\s@,]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) || !/^\d{6}$/.test(code)) {
    throw new Error("Invalid verification code.");
  }

  const admin = await env.DB.prepare("SELECT id, email, name, role, status FROM admin_users WHERE lower(email) = lower(?) LIMIT 1").bind(email).first();
  if (!admin || admin.status !== "active") throw new Error("Invalid verification code.");

  const challenge = await env.DB.prepare("SELECT id, code_hash, attempts, expires_at FROM admin_login_codes WHERE admin_user_id = ? AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1").bind(admin.id).first();
  if (!challenge || Number(challenge.attempts) >= OTP_MAX_ATTEMPTS || new Date(challenge.expires_at + "Z") <= new Date()) throw new Error("The code is invalid or expired.");

  const hash = await sha256Hex(code);
  if (hash !== challenge.code_hash) {
    await env.DB.prepare("UPDATE admin_login_codes SET attempts = attempts + 1 WHERE id = ?").bind(challenge.id).run();
    throw new Error("The code is invalid or expired.");
  }

  await env.DB.prepare("UPDATE admin_login_codes SET consumed_at = datetime('now') WHERE id = ?").bind(challenge.id).run();

  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const sessionId = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO admin_sessions (id, admin_user_id, token_hash, expires_at, last_used_at) VALUES (?, ?, ?, datetime('now', ?), datetime('now'))").bind(sessionId, admin.id, tokenHash, `+${SESSION_TTL_DAYS} days`).run();
  await env.DB.prepare("UPDATE admin_users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").bind(admin.id).run();

  return new Response(JSON.stringify({ success: true, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": new URL(request.url).origin,
      "Access-Control-Allow-Credentials": "true",
      "Set-Cookie": sessionCookie(token),
    },
  });
}

async function getAdminSession(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const token = getCookie(request, "fh_admin_session");
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const admin = await env.DB.prepare("SELECT a.id, a.email, a.name, a.role, a.status, s.id AS session_id FROM admin_sessions s JOIN admin_users a ON a.id = s.admin_user_id WHERE s.token_hash = ? AND s.revoked_at IS NULL AND a.status = 'active' AND datetime(s.expires_at) > datetime('now') LIMIT 1").bind(tokenHash).first();
  if (!admin) return null;
  await env.DB.prepare("UPDATE admin_sessions SET last_used_at = datetime('now') WHERE id = ?").bind(admin.session_id).run();
  return admin;
}

async function requireAdmin(request, env) {
  const admin = await getAdminSession(request, env);
  if (!admin) return null;
  return admin;
}

async function logoutAdmin(request, env) {
  const token = getCookie(request, "fh_admin_session");
  if (token && env.DB) {
    const tokenHash = await sha256Hex(token);
    await env.DB.prepare("UPDATE admin_sessions SET revoked_at = datetime('now') WHERE token_hash = ? AND revoked_at IS NULL").bind(tokenHash).run();
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": new URL(request.url).origin,
      "Access-Control-Allow-Credentials": "true",
      "Set-Cookie": clearSessionCookie(),
    },
  });
}

async function saveProjectLeadWithAttachment(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  if (!env.fh_lead_attachments) throw new Error("R2 attachment storage is not configured.");

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) throw new Error("Invalid project submission format.");

  const form = await request.formData();
  const lead = normalizeLead(form);
  const customerId = crypto.randomUUID();
  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();
  const existing = await env.DB.prepare("SELECT id FROM customers WHERE lower(email) = lower(?) LIMIT 1").bind(lead.email).first("id");
  const resolvedCustomerId = existing?.id || customerId;
  const interestsJson = JSON.stringify(lead.interests);
  let objectKey = null;

  try {
    if (lead.file) {
      const safeName = lead.file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-160);
      const extension = lead.file.type === "application/pdf" ? "pdf" : "png";
      objectKey = `leads/${leadId}/${crypto.randomUUID()}-${safeName || `attachment.${extension}`}`;
      await env.fh_lead_attachments.put(objectKey, lead.file.stream(), {
        httpMetadata: { contentType: lead.file.type },
        customMetadata: {
          leadId,
          customerId: resolvedCustomerId,
          originalName: lead.file.name.slice(0, 180),
        },
      });
    }

    const attachmentMetadata = lead.file ? {
      name: lead.file.name.slice(0, 180),
      type: lead.file.type,
      size: lead.file.size,
      object_key: objectKey,
    } : null;

    const metadata = JSON.stringify({
      lead_id: leadId,
      country: lead.country,
      zip: lead.zip,
      interests: lead.interests,
      details: lead.details,
      attachment: attachmentMetadata,
      source: "website",
      submitted_at: now,
    });

    const statements = [];
    if (existing?.id) {
      statements.push(env.DB.prepare("UPDATE customers SET first_name = ?, phone = ?, language = ?, updated_at = datetime('now') WHERE id = ?").bind(lead.name, lead.phone, lead.country === "US" ? "en" : "es", resolvedCustomerId));
    } else {
      statements.push(env.DB.prepare("INSERT INTO customers (id, first_name, last_name, email, phone, language, status) VALUES (?, ?, ?, ?, ?, ?, 'active')").bind(resolvedCustomerId, lead.name, "", lead.email, lead.phone, lead.country === "US" ? "en" : "es"));
    }

    statements.push(env.DB.prepare("INSERT INTO leads (id, customer_id, status, source, country, zip, project_details, interests) VALUES (?, ?, 'new', 'website', ?, ?, ?, ?)").bind(leadId, resolvedCustomerId, lead.country, lead.zip, lead.details, interestsJson));

    if (lead.file && objectKey) {
      statements.push(env.DB.prepare("INSERT INTO documents (id, customer_id, lead_id, type, file_url, file_name, version) VALUES (?, ?, ?, 'project_attachment', ?, ?, '1')").bind(crypto.randomUUID(), resolvedCustomerId, leadId, objectKey, lead.file.name.slice(0, 180)));
    }

    statements.push(env.DB.prepare("INSERT INTO activity_log (id, actor_type, actor_id, action, entity_type, entity_id, metadata) VALUES (?, 'customer', ?, 'project_lead_submitted', 'lead', ?, ?)").bind(crypto.randomUUID(), resolvedCustomerId, leadId, metadata));
    await env.DB.batch(statements);

    return { success: true, leadId, customerId: resolvedCustomerId, attachment: lead.file ? { name: lead.file.name, type: lead.file.type, size: lead.file.size } : null };
  } catch (error) {
    if (objectKey) {
      try { await env.fh_lead_attachments.delete(objectKey); } catch (cleanupError) { console.error("R2 cleanup failed", cleanupError); }
    }
    throw error;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = getOrigin(request);
    if (request.method === "OPTIONS") return json({}, 204, origin || "*");
    if (!origin) return json({ error: "Origin not allowed." }, 403, "*");

    if (url.pathname === "/api/admin/request-otp" && request.method === "POST") {
      try {
        return json(await requestAdminOtp(request, env), 200, origin);
      } catch (error) {
        console.error("Admin OTP request error", error);
        return json({ error: error instanceof Error ? error.message : "Could not request an access code." }, 400, origin);
      }
    }

    if (url.pathname === "/api/admin/verify-otp" && request.method === "POST") {
      try {
        return await verifyAdminOtp(request, env);
      } catch (error) {
        console.error("Admin OTP verification error", error);
        return json({ error: error instanceof Error ? error.message : "Could not verify the access code." }, 400, origin);
      }
    }

    if (url.pathname === "/api/admin/me" && request.method === "GET") {
      try {
        const admin = await getAdminSession(request, env);
        return json({ authenticated: Boolean(admin), admin: admin ? { id: admin.id, name: admin.name, email: admin.email, role: admin.role } : null }, 200, origin);
      } catch (error) {
        console.error("Admin session lookup error", error);
        return json({ error: "Could not verify the session." }, 500, origin);
      }
    }

    if (url.pathname === "/api/admin/logout" && request.method === "POST") {
      try {
        return await logoutAdmin(request, env);
      } catch (error) {
        console.error("Admin logout error", error);
        return json({ error: "Could not close the session." }, 500, origin);
      }
    }

    if (url.pathname === "/admin/login.html" || url.pathname === "/admin/login" || url.pathname === "/admin/login.js" || url.pathname === "/admin/admin.css") { return env.ASSETS.fetch(request); }

    if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login.html" && url.pathname !== "/admin/login") {
      const admin = await requireAdmin(request, env);
      if (!admin) {
        if (url.pathname.startsWith("/api/")) return json({ error: "Authentication required." }, 401, origin);
        return Response.redirect(`${url.origin}/admin/login.html`, 302);
      }
    }

    if (url.pathname === "/api/project-leads" && request.method === "POST") {
      try {
        return json(await saveProjectLeadWithAttachment(request, env), 200, origin);
      } catch (error) {
        console.error("Project lead submission error", error);
        return json({ error: error instanceof Error ? error.message : "No pudimos enviar el formulario." }, 400, origin);
      }
    }

    return currentWorker.fetch(request, env, ctx);
  },
};
