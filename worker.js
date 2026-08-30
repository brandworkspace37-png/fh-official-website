const CATALOG = {
  "Catrina Mexicana LED": {
    Small: { price: 399, dimensions: "60 × 50 cm" },
    Medium: { price: 599, dimensions: "75 × 60 cm" },
    Large: { price: 829, dimensions: "90 × 75 cm" },
  },
};

const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";
const PAYPAL_SANDBOX_CLIENT_ID = "BAAtak9QgP73i1YR516K5C2Y0JXYZw5gGgufsobmVkKtOJeMNw7IEZe0OkLLmw6000fE-hg-KWgyR7qTBc";
const ADMIN_SESSION_COOKIE = "fh_admin_session";
const ORDER_STATUSES = new Set(["pending", "paid", "production", "ready", "shipped", "in_transit", "delivered", "cancelled"]);

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
function getOrigin(request) { const origin = request.headers.get("Origin"); if (!origin) return new URL(request.url).origin; return origin === new URL(request.url).origin ? origin : null; }
function normalizeProjectLead(body) {
  const name = String(body?.name || "").trim(), country = String(body?.country || "").trim().toUpperCase(), phone = String(body?.phone || "").trim(), email = String(body?.email || "").trim().toLowerCase(), zip = String(body?.zip || "").trim(), details = String(body?.details || "").trim();
  const interests = Array.isArray(body?.interests) ? body.interests.map(String).slice(0, 2) : [];
  const attachment = body?.attachment && typeof body.attachment === "object" ? { name: String(body.attachment.name || "").slice(0, 180), type: String(body.attachment.type || "").slice(0, 80), size: Number(body.attachment.size) || 0 } : null;
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/.test(name)) throw new Error("Invalid name.");
  if (!/^[^\s@,]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) throw new Error("Invalid email.");
  if (!["US", "MX", "CA"].includes(country)) throw new Error("Unsupported country.");
  if (phone.replace(/\D/g, "").length !== 10) throw new Error("Invalid phone number.");
  if (country === "US" && !/^\d{5}$/.test(zip)) throw new Error("Invalid ZIP code.");
  if (country === "MX" && !/^\d{5}$/.test(zip)) throw new Error("Invalid postal code.");
  if (country === "CA" && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zip)) throw new Error("Invalid postal code.");
  if (!details && interests.length === 0) throw new Error("Project information is required.");
  if (details.length > 5000) throw new Error("Project details are too long.");
  return { name, country, phone, email, zip, details, interests, attachment };
}

async function saveProjectLead(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const lead = normalizeProjectLead(await request.json());
  const customerId = crypto.randomUUID(), leadId = crypto.randomUUID(), now = new Date().toISOString();
  const existing = await env.DB.prepare("SELECT id FROM customers WHERE lower(email) = lower(?) LIMIT 1").bind(lead.email).first("id");
  const resolvedCustomerId = existing?.id || customerId;
  const interestsJson = JSON.stringify(lead.interests);
  const metadata = JSON.stringify({ lead_id: leadId, country: lead.country, zip: lead.zip, interests: lead.interests, details: lead.details, attachment: lead.attachment, source: "website", submitted_at: now });
  const statements = [];
  if (existing?.id) statements.push(env.DB.prepare("UPDATE customers SET first_name = ?, phone = ?, language = ?, updated_at = datetime('now') WHERE id = ?").bind(lead.name, lead.phone, lead.country === "US" ? "en" : "es", resolvedCustomerId));
  else statements.push(env.DB.prepare("INSERT INTO customers (id, first_name, last_name, email, phone, language, status) VALUES (?, ?, ?, ?, ?, ?, 'active')").bind(resolvedCustomerId, lead.name, "", lead.email, lead.phone, lead.country === "US" ? "en" : "es"));
  statements.push(env.DB.prepare("INSERT INTO leads (id, customer_id, status, source, country, zip, project_details, interests) VALUES (?, ?, 'new', 'website', ?, ?, ?, ?)").bind(leadId, resolvedCustomerId, lead.country, lead.zip, lead.details, interestsJson));
  statements.push(env.DB.prepare("INSERT INTO activity_log (id, actor_type, actor_id, action, entity_type, entity_id, metadata) VALUES (?, 'customer', ?, 'project_lead_submitted', 'lead', ?, ?)").bind(crypto.randomUUID(), resolvedCustomerId, leadId, metadata));
  await env.DB.batch(statements);
  return { success: true, leadId, customerId: resolvedCustomerId };
}

async function getAccessToken(env) {
  const clientId = env.PAYPAL_CLIENT_ID || PAYPAL_SANDBOX_CLIENT_ID;
  if (!clientId || !env.PAYPAL_CLIENT_SECRET) throw new Error("PayPal server secret is not configured.");
  const credentials = btoa(`${clientId}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: "grant_type=client_credentials" });
  const data = await response.json();
  if (!response.ok || !data.access_token) { console.error("PayPal OAuth error", response.status, data); throw new Error("Unable to authenticate with PayPal."); }
  return data.access_token;
}
function normalizeCart(cart) {
  if (!Array.isArray(cart) || cart.length < 1 || cart.length > 20) throw new Error("Invalid cart.");
  let subtotal = 0; const items = [];
  for (const item of cart) { const product = String(item?.product || ""), size = String(item?.size || ""), quantity = Number(item?.quantity), productData = CATALOG[product]?.[size]; if (!productData || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error("Invalid product selection."); subtotal += productData.price * quantity; items.push({ name: `${product} — ${size}`, sku: `CATRINA-${size.toUpperCase()}`, unit_amount: { currency_code: "USD", value: productData.price.toFixed(2) }, quantity: String(quantity), category: "PHYSICAL_GOODS" }); }
  return { subtotal, items };
}
async function createPayPalOrder(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const body = await request.json(), { subtotal, items } = normalizeCart(body.cart), customer = body.customer || {};
  const firstName = String(customer.firstName || "").trim(), lastName = String(customer.lastName || "").trim(), email = String(customer.email || "").trim().toLowerCase(), phone = String(customer.phone || "").trim(), address = String(customer.address || "").trim(), city = String(customer.city || "").trim(), state = String(customer.state || "").trim(), zip = String(customer.zip || "").trim();
  if (!firstName || !lastName || !email || !phone || !address || !city || !state || !/^\d{5}$/.test(zip)) throw new Error("Customer and shipping information is incomplete.");
  const internalNumber = `FH-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`, token = await getAccessToken(env);
  const payload = { intent: "CAPTURE", payment_source: { paypal: { experience_context: { brand_name: "FORM & HALO", user_action: "PAY_NOW", shipping_preference: "SET_PROVIDED_ADDRESS", locale: "en-US" } } }, purchase_units: [{ reference_id: internalNumber, custom_id: internalNumber, description: "FORM & HALO — Catrina Mexicana LED", amount: { currency_code: "USD", value: subtotal.toFixed(2), breakdown: { item_total: { currency_code: "USD", value: subtotal.toFixed(2) } } }, items, shipping: { name: { full_name: `${firstName} ${lastName}` }, address: { address_line_1: address, admin_area_2: city, admin_area_1: state, postal_code: zip, country_code: "US" } } }] };
  const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", Prefer: "return=representation", "PayPal-Request-Id": crypto.randomUUID() }, body: JSON.stringify(payload) });
  const data = await response.json(); if (!response.ok || !data.id) { console.error("PayPal create order error", response.status, data); throw new Error("PayPal could not create the payment order."); }
  const existingCustomer = await env.DB.prepare("SELECT id FROM customers WHERE lower(email) = lower(?) LIMIT 1").bind(email).first("id"), customerId = existingCustomer?.id || crypto.randomUUID(), addressId = crypto.randomUUID(), orderId = crypto.randomUUID(), paymentId = crypto.randomUUID(), shippingSnapshot = JSON.stringify({ firstName, lastName, address, city, state, zip, country: "US" });
  const statements = [];
  if (existingCustomer?.id) statements.push(env.DB.prepare("UPDATE customers SET first_name = ?, last_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?").bind(firstName, lastName, phone, customerId)); else statements.push(env.DB.prepare("INSERT INTO customers (id, first_name, last_name, email, phone, language, status) VALUES (?, ?, ?, ?, ?, 'en', 'active')").bind(customerId, firstName, lastName, email, phone));
  statements.push(env.DB.prepare("INSERT INTO customer_addresses (id, customer_id, address_line_1, city, state, postal_code, country, address_type, is_default) VALUES (?, ?, ?, ?, ?, ?, 'US', 'shipping', 1)").bind(addressId, customerId, address, city, state, zip));
  statements.push(env.DB.prepare("INSERT INTO orders (id, order_number, customer_id, status, subtotal, total, shipping_address_snapshot, customer_email_snapshot, customer_phone_snapshot) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)").bind(orderId, internalNumber, customerId, subtotal, subtotal, shippingSnapshot, email, phone));
  for (const cartItem of body.cart) { const product = String(cartItem?.product || ""), size = String(cartItem?.size || ""), quantity = Number(cartItem?.quantity), productData = CATALOG[product][size]; statements.push(env.DB.prepare("INSERT INTO order_items (id, order_id, product_name, variant_name, sku, size, dimensions, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), orderId, product, size, `CATRINA-${size.toUpperCase()}`, size, productData.dimensions, productData.price, quantity, productData.price * quantity)); }
  statements.push(env.DB.prepare("INSERT INTO payments (id, order_id, provider, provider_order_id, amount, currency, status, payment_method) VALUES (?, ?, 'PayPal', ?, ?, 'USD', 'created', 'paypal')").bind(paymentId, orderId, data.id, subtotal));
  statements.push(env.DB.prepare("INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by_type, note) VALUES (?, ?, NULL, 'pending', 'system', 'Order created before PayPal approval.')").bind(crypto.randomUUID(), orderId));
  await env.DB.batch(statements); return { id: data.id, number: internalNumber, amount: subtotal.toFixed(2) };
}

async function capturePayPalOrder(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const orderId = String((await request.json()).orderID || "").trim(); if (!/^[A-Z0-9]+$/.test(orderId)) throw new Error("Invalid PayPal order ID.");
  const token = await getAccessToken(env), orderResponse = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }), order = await orderResponse.json();
  if (!orderResponse.ok || order.status !== "APPROVED") throw new Error("The PayPal order is not approved for capture.");
  const customId = order.purchase_units?.[0]?.custom_id || ""; if (!customId.startsWith("FH-")) throw new Error("Unrecognized merchant order.");
  const captureResponse = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", Prefer: "return=representation", "PayPal-Request-Id": crypto.randomUUID() }, body: "{}" }), capture = await captureResponse.json();
  if (!captureResponse.ok) { console.error("PayPal capture error", captureResponse.status, capture); throw new Error("PayPal could not capture the payment."); }
  const captureStatus = capture.purchase_units?.[0]?.payments?.captures?.[0]?.status; if (capture.status !== "COMPLETED" || captureStatus !== "COMPLETED") throw new Error("Payment was not completed.");
  const captureId = capture.purchase_units[0].payments.captures[0].id, amount = capture.purchase_units[0].payments.captures[0].amount?.value || "0.00", existingOrder = await env.DB.prepare("SELECT id, status FROM orders WHERE order_number = ? LIMIT 1").bind(customId).first();
  if (!existingOrder) throw new Error("Internal order was not found.");
  await env.DB.batch([env.DB.prepare("UPDATE orders SET status = 'paid', total = ?, updated_at = datetime('now') WHERE id = ?").bind(Number(amount), existingOrder.id), env.DB.prepare("UPDATE payments SET status = 'captured', provider_payment_id = ?, amount = ?, updated_at = datetime('now') WHERE order_id = ? AND provider_order_id = ?").bind(captureId, Number(amount), existingOrder.id, orderId), env.DB.prepare("INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by_type, note) VALUES (?, ?, ?, 'paid', 'system', ?)").bind(crypto.randomUUID(), existingOrder.id, existingOrder.status, "PayPal payment captured.")]);
  return { success: true, orderNumber: customId, status: "paid", amount };
}

function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function requireOwner(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const admin = await env.DB.prepare("SELECT a.id, a.email, a.name, a.role FROM admin_sessions s JOIN admin_users a ON a.id = s.admin_user_id WHERE s.token_hash = ? AND s.revoked_at IS NULL AND a.status = 'active' AND lower(a.role) = 'owner' AND datetime(s.expires_at) > datetime('now') LIMIT 1").bind(tokenHash).first();
  if (!admin) return null;
  await env.DB.prepare("UPDATE admin_sessions SET last_used_at = datetime('now') WHERE id = ?").bind((await env.DB.prepare("SELECT id FROM admin_sessions WHERE token_hash = ? LIMIT 1").bind(tokenHash).first("id"))).run();
  return admin;
}

async function getOrder(request, env, includePrivate = false) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const number = new URL(request.url).searchParams.get("number")?.trim();
  if (!number) throw new Error("Order number is required.");
  const order = await env.DB.prepare("SELECT id, order_number, status, subtotal, total, shipping_address_snapshot, customer_email_snapshot, customer_phone_snapshot, created_at, updated_at FROM orders WHERE order_number = ? LIMIT 1").bind(number).first();
  if (!order) return null;
  const items = await env.DB.prepare("SELECT product_name, variant_name, sku, size, dimensions, unit_price, quantity, line_total FROM order_items WHERE order_id = ? ORDER BY rowid ASC").bind(order.id).all();
  if (!includePrivate) return { order_number: order.order_number, status: order.status, subtotal: order.subtotal, total: order.total, created_at: order.created_at, updated_at: order.updated_at, items: items.results || [] };
  return { ...order, items: items.results || [] };
}

async function getAdminOrders(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const number = new URL(request.url).searchParams.get("number")?.trim();
  if (number) {
    const order = await getOrder(request, env, true);
    return { success: true, orders: order ? [order] : [] };
  }
  const result = await env.DB.prepare(`SELECT o.id, o.order_number, o.status, o.subtotal, o.total, o.customer_email_snapshot, o.customer_phone_snapshot, o.created_at, o.updated_at, c.first_name, c.last_name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id ORDER BY o.created_at DESC LIMIT 50`).all();
  const orders = [];
  for (const row of result.results || []) {
    const items = await env.DB.prepare("SELECT product_name, variant_name, sku, size, dimensions, unit_price, quantity, line_total FROM order_items WHERE order_id = ? ORDER BY rowid ASC").bind(row.id).all();
    orders.push({ ...row, items: items.results || [] });
  }
  return { success: true, orders };
}

async function updateAdminOrderStatus(request, env, admin) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const body = await request.json();
  const number = String(body?.orderNumber || "").trim();
  const status = String(body?.status || "").trim().toLowerCase();
  const note = String(body?.note || "").trim().slice(0, 500);
  if (!/^FH-[A-Z0-9-]+$/i.test(number) || !ORDER_STATUSES.has(status)) throw new Error("Invalid order status request.");
  const order = await env.DB.prepare("SELECT id, status, customer_phone_snapshot FROM orders WHERE order_number = ? LIMIT 1").bind(number).first();
  if (!order) throw new Error("Order not found.");
  if (order.status === status) return { success: true, orderNumber: number, status, changed: false };
  const statusNote = note || `Owner changed order status to ${status}.`;
  await env.DB.batch([
    env.DB.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(status, order.id),
    env.DB.prepare("INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by_type, changed_by_id, note) VALUES (?, ?, ?, ?, 'admin', ?, ?)").bind(crypto.randomUUID(), order.id, order.status, status, admin.id, statusNote),
    env.DB.prepare("INSERT INTO activity_log (id, actor_type, actor_id, action, entity_type, entity_id, metadata) VALUES (?, 'admin', ?, 'order_status_changed', 'order', ?, ?)").bind(crypto.randomUUID(), admin.id, order.id, JSON.stringify({ order_number: number, previous_status: order.status, new_status: status, note: statusNote }))
  ]);
  return { success: true, orderNumber: number, previousStatus: order.status, status, changed: true, customerPhone: order.customer_phone_snapshot || null };
}

export default { async fetch(request, env) { const origin = getOrigin(request); if (request.method === "OPTIONS") return json({}, 204, origin || "*"); if (!origin) return json({ error: "Origin not allowed." }, 403, "*"); const url = new URL(request.url); try { if (url.pathname === "/api/health" && request.method === "GET") return json({ ok: true, db: Boolean(env.DB) }, 200, origin); if (url.pathname === "/api/project-leads" && request.method === "POST") return json(await saveProjectLead(request, env), 200, origin); if (url.pathname === "/api/paypal/create-order" && request.method === "POST") return json(await createPayPalOrder(request, env), 200, origin); if (url.pathname === "/api/paypal/capture-order" && request.method === "POST") return json(await capturePayPalOrder(request, env), 200, origin); if (url.pathname === "/api/admin/orders" && request.method === "GET") { const admin = await requireOwner(request, env); if (!admin) return json({ error: "Owner authentication required." }, 401, origin); return json(await getAdminOrders(request, env), 200, origin); } if (url.pathname === "/api/admin/orders/status" && request.method === "POST") { const admin = await requireOwner(request, env); if (!admin) return json({ error: "Owner authentication required." }, 401, origin); return json(await updateAdminOrderStatus(request, env, admin), 200, origin); } if (url.pathname === "/api/orders" && request.method === "GET") { const order = await getOrder(request, env, false); return order ? json(order, 200, origin) : json({ error: "Order not found." }, 404, origin); } return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 }); } catch (error) { console.error(error); return json({ error: error instanceof Error ? error.message : "Unexpected server error." }, 400, origin); } } };