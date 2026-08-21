const CATALOG = {
  "Catrina Mexicana LED": {
    Small: { price: 399, dimensions: "60 × 50 cm" },
    Medium: { price: 599, dimensions: "75 × 60 cm" },
    Large: { price: 829, dimensions: "90 × 75 cm" },
  },
};

const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";

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

async function getAccessToken(env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal server credentials are not configured.");
  }
  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error("Unable to authenticate with PayPal.");
  }
  return data.access_token;
}

function normalizeCart(cart) {
  if (!Array.isArray(cart) || cart.length < 1 || cart.length > 20) {
    throw new Error("Invalid cart.");
  }

  let subtotal = 0;
  const items = [];

  for (const item of cart) {
    const product = String(item?.product || "");
    const size = String(item?.size || "");
    const quantity = Number(item?.quantity);
    const productData = CATALOG[product]?.[size];

    if (!productData || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("Invalid product selection.");
    }

    const lineTotal = productData.price * quantity;
    subtotal += lineTotal;
    items.push({
      name: `${product} — ${size}`,
      sku: `CATRINA-${size.toUpperCase()}`,
      unit_amount: { currency_code: "USD", value: productData.price.toFixed(2) },
      quantity: String(quantity),
      category: "PHYSICAL_GOODS",
    });
  }

  return { subtotal, items };
}

async function createPayPalOrder(request, env) {
  const body = await request.json();
  const { subtotal, items } = normalizeCart(body.cart);
  const customer = body.customer || {};

  const firstName = String(customer.firstName || "").trim();
  const lastName = String(customer.lastName || "").trim();
  const address = String(customer.address || "").trim();
  const city = String(customer.city || "").trim();
  const state = String(customer.state || "").trim();
  const zip = String(customer.zip || "").trim();

  if (!firstName || !lastName || !address || !city || !state || !/^\d{5}$/.test(zip)) {
    throw new Error("Customer and shipping information is incomplete.");
  }

  const internalNumber = `FH-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const token = await getAccessToken(env);

  const payload = {
    intent: "CAPTURE",
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "FORM & HALO",
          user_action: "PAY_NOW",
          shipping_preference: "SET_PROVIDED_ADDRESS",
          locale: "en-US",
        },
      },
    },
    purchase_units: [
      {
        reference_id: internalNumber,
        custom_id: internalNumber,
        description: "FORM & HALO — Catrina Mexicana LED",
        amount: {
          currency_code: "USD",
          value: subtotal.toFixed(2),
          breakdown: {
            item_total: { currency_code: "USD", value: subtotal.toFixed(2) },
          },
        },
        items,
        shipping: {
          name: { full_name: `${firstName} ${lastName}` },
          address: {
            address_line_1: address,
            admin_area_2: city,
            admin_area_1: state,
            postal_code: zip,
            country_code: "US",
          },
        },
      },
    ],
  };

  const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.id) {
    console.error("PayPal create order error", response.status, data);
    throw new Error("PayPal could not create the payment order.");
  }

  return { id: data.id, number: internalNumber, amount: subtotal.toFixed(2) };
}

async function capturePayPalOrder(request, env) {
  const body = await request.json();
  const orderId = String(body.orderID || "").trim();
  if (!/^[A-Z0-9]+$/.test(orderId)) throw new Error("Invalid PayPal order ID.");

  const token = await getAccessToken(env);
  const orderResponse = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const order = await orderResponse.json();

  if (!orderResponse.ok || order.status !== "APPROVED") {
    throw new Error("The PayPal order is not approved for capture.");
  }

  const customId = order.purchase_units?.[0]?.custom_id || "";
  if (!customId.startsWith("FH-")) throw new Error("Unrecognized merchant order.");

  const captureResponse = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
    body: "{}",
  });

  const capture = await captureResponse.json();
  if (!captureResponse.ok) {
    console.error("PayPal capture error", captureResponse.status, capture);
    throw new Error("PayPal could not capture the payment.");
  }

  const captureStatus = capture.purchase_units?.[0]?.payments?.captures?.[0]?.status;
  if (capture.status !== "COMPLETED" || captureStatus !== "COMPLETED") {
    throw new Error("Payment was not completed.");
  }

  return {
    status: "COMPLETED",
    orderID: order.id,
    internalNumber: customId,
    captureID: capture.purchase_units[0].payments.captures[0].id,
    amount: capture.purchase_units[0].payments.captures[0].amount?.value || "0.00",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = getOrigin(request);

    if (url.pathname.startsWith("/api/")) {
      if (!origin) return json({ error: "Origin not allowed." }, 403, "null");
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });

      try {
        if (url.pathname === "/api/paypal/create-order" && request.method === "POST") {
          return json(await createPayPalOrder(request, env), 200, origin);
        }
        if (url.pathname === "/api/paypal/capture-order" && request.method === "POST") {
          return json(await capturePayPalOrder(request, env), 200, origin);
        }
        return json({ error: "Not found." }, 404, origin);
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "Payment service error." }, 400, origin);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
