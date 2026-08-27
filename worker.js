const CATALOG = {
  "Catrina Mexicana LED": {
    Small: { price: 399, dimensions: "60 × 50 cm" },
    Medium: { price: 599, dimensions: "75 × 60 cm" },
    Large: { price: 829, dimensions: "90 × 75 cm" },
  },
};

const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";
const PAYPAL_SANDBOX_CLIENT_ID = "BAAtak9QgP73i1YR516K5C2Y0JXYZw5gGgufsobmVkKtOJeMNw7IEZe0OkLLmw6000fE-hg-KWgyR7qTBc";

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

function normalizeProjectLead(body) {
  const name = String(body?.name || "").trim();
  const country = String(body?.country || "").trim().toUpperCase();
  const phone = String(body?.phone || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const zip = String(body?.zip || "").trim();
  const details = String(body?.details || "").trim();
  const interests = Array.isArray(body?.interests) ? body.interests.map(String).slice(0, 2) : [];
  const attachment = body?.attachment && typeof body.attachment === "object"
    ? { name: String(body.attachment.name || "").slice(0, 180), type: String(body.attachment.type || "").slice(0, 80), size: Number(body.attachment.size) || 0 }
    : null;

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

  const customerId = crypto.randomUUID();
  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();

  const existing = await env.DB
    .prepare("SELECT id FROM customers WHERE lower(email) = lower(?) LIMIT 1")
    .bind(lead.email)
    .first("id");

  const resolvedCustomerId = existing?.id || customerId;

  const interestsJson = JSON.stringify(lead.interests);

  const metadata = JSON.stringify({
    lead_id: leadId,
    country: lead.country,
    zip: lead.zip,
    interests: lead.interests,
    details: lead.details,
    attachment: lead.attachment,
    source: "website",
    submitted_at: now,
  });

  const statements = [];

  // 1. Crear o actualizar cliente
  if (existing?.id) {
    statements.push(
      env.DB
        .prepare(
          "UPDATE customers SET first_name = ?, phone = ?, language = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(
          lead.name,
          lead.phone,
          lead.country === "US" ? "en" : "es",
          resolvedCustomerId
        )
    );
  } else {
    statements.push(
      env.DB
        .prepare(
          "INSERT INTO customers (id, first_name, last_name, email, phone, language, status) VALUES (?, ?, ?, ?, ?, ?, 'active')"
        )
        .bind(
          resolvedCustomerId,
          lead.name,
          "",
          lead.email,
          lead.phone,
          lead.country === "US" ? "en" : "es"
        )
    );
  }

  // 2. Crear el Lead real
  statements.push(
    env.DB
      .prepare(
        "INSERT INTO leads (id, customer_id, status, source, project_details, interests) VALUES (?, ?, 'new', 'website', ?, ?)"
      )
      .bind(
        leadId,
        resolvedCustomerId,
        lead.details,
        interestsJson
      )
  );

  // 3. Registrar actividad / historial
  statements.push(
    env.DB
      .prepare(
        "INSERT INTO activity_log (id, actor_type, actor_id, action, entity_type, entity_id, metadata) VALUES (?, 'customer', ?, 'project_lead_submitted', 'lead', ?, ?)"
      )
      .bind(
        crypto.randomUUID(),
        resolvedCustomerId,
        leadId,
        metadata
      )
  );

  await env.DB.batch(statements);

  return {
    success: true,
    leadId,
    customerId: resolvedCustomerId,
  };
}

async function getAccessToken(env) {
  const clientId = env.PAYPAL_CLIENT_ID || PAYPAL_SANDBOX_CLIENT_ID;
  if (!clientId || !env.PAYPAL_CLIENT_SECRET) throw new Error("PayPal server secret is not configured.");
  const credentials = btoa(`${clientId}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    console.error("PayPal OAuth error", response.status, data);
    throw new Error("Unable to authenticate with PayPal.");
  }
  return data.access_token;
}

function normalizeCart(cart) {
  if (!Array.isArray(cart) || cart.length < 1 || cart.length > 20) throw new Error("Invalid cart.");
  let subtotal = 0;
  const items = [];
  for (const item of cart) {
    const product = String(item?.product || "");
    const size = String(item?.size || "");
    const quantity = Number(item?.quantity);
    const productData = CATALOG[product]?.[size];
    if (!productData || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error("Invalid product selection.");
    subtotal += productData.price * quantity;
    items.push({ name: `${product} — ${size}`, sku: `CATRINA-${size.toUpperCase()}`, unit_amount: { currency_code: "USD", value: productData.price.toFixed(2) }, quantity: String(quantity), category: "PHYSICAL_GOODS" });
  }
  return { subtotal, items };
}

async function createPayPalOrder(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const body = await request.json();
  const { subtotal, items } = normalizeCart(body.cart);
  const customer = body.customer || {};
  const firstName = String(customer.firstName || "").trim();
  const lastName = String(customer.lastName || "").trim();
  const email = String(customer.email || "").trim().toLowerCase();
  const phone = String(customer.phone || "").trim();
  const address = String(customer.address || "").trim();
  const city = String(customer.city || "").trim();
  const state = String(customer.state || "").trim();
  const zip = String(customer.zip || "").trim();
  if (!firstName || !lastName || !email || !phone || !address || !city || !state || !/^\d{5}$/.test(zip)) throw new Error("Customer and shipping information is incomplete.");

  const internalNumber = `FH-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const token = await getAccessToken(env);
  const payload = {
    intent: "CAPTURE",
    payment_source: { paypal: { experience_context: { brand_name: "FORM & HALO", user_action: "PAY_NOW", shipping_preference: "SET_PROVIDED_ADDRESS", locale: "en-US" } } },
    purchase_units: [{
      reference_id: internalNumber,
      custom_id: internalNumber,
      description: "FORM & HALO — Catrina Mexicana LED",
      amount: { currency_code: "USD", value: subtotal.toFixed(2), breakdown: { item_total: { currency_code: "USD", value: subtotal.toFixed(2) } } },
      items,
      shipping: { name: { full_name: `${firstName} ${lastName}` }, address: { address_line_1: address, admin_area_2: city, admin_area_1: state, postal_code: zip, country_code: "US" } },
    }],
  };
  const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", Prefer: "return=representation", "PayPal-Request-Id": crypto.randomUUID() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.id) {
    console.error("PayPal create order error", response.status, data);
    throw new Error("PayPal could not create the payment order.");
  }

  const now = new Date().toISOString();
  const existingCustomer = await env.DB.prepare("SELECT id FROM customers WHERE lower(email) = lower(?) LIMIT 1").bind(email).first("id");
  const customerId = existingCustomer?.id || crypto.randomUUID();
  const addressId = crypto.randomUUID();
  const orderId = crypto.randomUUID();
  const paymentId = crypto.randomUUID();
  const shippingSnapshot = JSON.stringify({ firstName, lastName, address, city, state, zip, country: "US" });

  const statements = [];
  if (existingCustomer?.id) {
    statements.push(env.DB.prepare("UPDATE customers SET first_name = ?, last_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?").bind(firstName, lastName, phone, customerId));
  } else {
    statements.push(env.DB.prepare("INSERT INTO customers (id, first_name, last_name, email, phone, language, status) VALUES (?, ?, ?, ?, ?, 'en', 'active')").bind(customerId, firstName, lastName, email, phone));
  }
  statements.push(env.DB.prepare("INSERT INTO customer_addresses (id, customer_id, address_line_1, city, state, postal_code, country, address_type, is_default) VALUES (?, ?, ?, ?, ?, ?, 'US', 'shipping', 1)").bind(addressId, customerId, address, city, state, zip));
  statements.push(env.DB.prepare("INSERT INTO orders (id, order_number, customer_id, status, subtotal, total, shipping_address_snapshot, customer_email_snapshot, customer_phone_snapshot) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)").bind(orderId, internalNumber, customerId, subtotal, subtotal, shippingSnapshot, email, phone));
  for (const cartItem of body.cart) {
    const product = String(cartItem?.product || "");
    const size = String(cartItem?.size || "");
    const quantity = Number(cartItem?.quantity);
    const productData = CATALOG[product][size];
    const itemId = crypto.randomUUID();
    statements.push(env.DB.prepare("INSERT INTO order_items (id, order_id, product_name, variant_name, sku, size, dimensions, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(itemId, orderId, product, size, `CATRINA-${size.toUpperCase()}`, size, productData.dimensions, productData.price, quantity, productData.price * quantity));
  }
  statements.push(env.DB.prepare("INSERT INTO payments (id, order_id, provider, provider_order_id, amount, currency, status, payment_method) VALUES (?, ?, 'PayPal', ?, ?, 'USD', 'created', 'paypal')").bind(paymentId, orderId, data.id, subtotal));
  statements.push(env.DB.prepare("INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by_type, note) VALUES (?, ?, NULL, 'pending', 'system', 'Order created before PayPal approval.')").bind(crypto.randomUUID(), orderId));
  await env.DB.batch(statements);

  return { id: data.id, number: internalNumber, amount: subtotal.toFixed(2) };
}

async function capturePayPalOrder(request, env) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const orderId = String((await request.json()).orderID || "").trim();
  if (!/^[A-Z0-9]+$/.test(orderId)) throw new Error("Invalid PayPal order ID.");
  const token = await getAccessToken(env);
  const orderResponse = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
  const order = await orderResponse.json();
  if (!orderResponse.ok || order.status !== "APPROVED") throw new Error("The PayPal order is not approved for capture.");
  const customId = order.purchase_units?.[0]?.custom_id || "";
  if (!customId.startsWith("FH-")) throw new Error("Unrecognized merchant order.");

  const captureResponse = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", Prefer: "return=representation", "PayPal-Request-Id": crypto.randomUUID() },
    body: "{}",
  });
  const capture = await captureResponse.json();
  if (!captureResponse.ok) {
    console.error("PayPal capture error", captureResponse.status, capture);
    throw new Error("PayPal could not capture the payment.");
  }
  const captureStatus = capture.purchase_units?.[0]?.payments?.captures?.[0]?.status;
  if (capture.status !== "COMPLETED" || captureStatus !== "COMPLETED") throw new Error("Payment was not completed.");

  const captureId = capture.purchase_units[0].payments.captures[0].id;
  const amount = capture.purchase_units[0].payments.captures[0].amount?.value || "0.00";
  const existingOrder = await env.DB.prepare("SELECT id, status FROM orders WHERE order_number = ? LIMIT 1").bind(customId).first();
  if (!existingOrder) throw new Error("Internal order was not found.");

  await env.DB.batch([
    env.DB.prepare("UPDATE orders SET status = 'paid', total = ?, updated_at = datetime('now') WHERE id = ?").bind(Number(amount), existingOrder.id),
    env.DB.prepare("UPDATE payments SET status = 'captured', provider_payment_id = ?, amount = ?, updated_at = datetime('now') WHERE order_id = ? AND provider_order_id = ?").bind(captureId, Number(amount), existingOrder.id, orderId),
    env.DB.prepare("INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by_type, note) VALUES (?, ?, ?, 'paid', 'system', 'PayPal payment captured successfully.')").bind(crypto.randomUUID(), existingOrder.id, existingOrder.status),
  ]);

  return { status: "COMPLETED", orderID: order.id, internalNumber: customId, captureID: captureId, amount };
}

async function getOrder(request, env, orderNumber) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  const order = await env.DB.prepare("SELECT id, order_number, status, currency, total, customer_email_snapshot, created_at FROM orders WHERE order_number = ? LIMIT 1").bind(orderNumber).first();
  if (!order || order.status !== "paid") throw new Error("Order not found or payment not confirmed.");
  const items = await env.DB.prepare("SELECT product_name AS product, variant_name AS size, dimensions, quantity, unit_price AS price, line_total FROM order_items WHERE order_id = ? ORDER BY created_at").bind(order.id).all();
  const payment = await env.DB.prepare("SELECT provider, provider_order_id, provider_payment_id, amount, status FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1").bind(order.id).first();
  return { number: order.order_number, status: order.status, currency: order.currency, total: order.total, items: items.results || [], payment: payment ? { provider: payment.provider, paypalOrderId: payment.provider_order_id, captureId: payment.provider_payment_id, amount: payment.amount, status: payment.status } : null, createdAt: order.created_at };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = getOrigin(request);

    if (url.pathname === "/checkout.html" && request.method === "GET") {
      const asset = await env.ASSETS.fetch(request);
      if (!asset.ok) return asset;
      const html = await asset.text();
      const headers = new Headers(asset.headers);
      headers.set("Cache-Control", "no-store");
      return new Response(html.replace("</body>", '<script src="/js/paypal.js"></script></body>'), { status: asset.status, headers });
    }

    if (url.pathname.startsWith("/api/")) {
      if (!origin) return json({ error: "Origin not allowed." }, 403, "null");
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
      try {
        if (url.pathname === "/api/health" && request.method === "GET") {
          if (!env.DB) return json({ ok: false, db: false }, 503, origin);
          await env.DB.prepare("SELECT 1 AS ok").first();
          return json({ ok: true, db: true }, 200, origin);
        }
        if (url.pathname === "/api/project-leads" && request.method === "POST") return json(await saveProjectLead(request, env), 201, origin);
        if (url.pathname === "/api/paypal/create-order" && request.method === "POST") return json(await createPayPalOrder(request, env), 200, origin);
        if (url.pathname === "/api/paypal/capture-order" && request.method === "POST") return json(await capturePayPalOrder(request, env), 200, origin);
        if (url.pathname.startsWith("/api/orders/") && request.method === "GET") {
          const orderNumber = decodeURIComponent(url.pathname.slice("/api/orders/".length)).trim();
          if (!/^FH-\d{8}-[A-Z0-9]{6}$/.test(orderNumber)) return json({ error: "Invalid order number." }, 400, origin);
          return json(await getOrder(request, env, orderNumber), 200, origin);
        }
        return json({ error: "Not found." }, 404, origin);
      } catch (error) {
        console.error("API error", error);
        return json({ error: error instanceof Error ? error.message : "Server error." }, 400, origin);
      }
    }

    return env.ASSETS.fetch(request);
  },
};