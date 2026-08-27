import currentWorker from "./worker.js";

const ALLOWED_TYPES = new Set(["image/png", "application/pdf"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function getOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return new URL(request.url).origin;
  return origin === new URL(request.url).origin ? origin : null;
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
