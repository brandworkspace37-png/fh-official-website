(() => {
  const CLIENT_ID = "BAAtak9QgP73i1YR516K5C2Y0JXYZw5gGgufsobmVkKtOJeMNw7IEZe0OkLLmw6000fE-hg-KWgyR7qTBc";

  const getCart = () => JSON.parse(localStorage.getItem("fhCart") || "[]");
  const get = (id) => document.getElementById(id);
  const status = get("paymentStatus");
  const button = document.querySelector("paypal-button");

  const setStatus = (message, type = "") => {
    if (!status) return;
    status.textContent = message;
    status.className = `payment-status${type ? ` ${type}` : ""}`;
  };

  const validCheckout = () => {
    const cart = getCart();
    const zip = get("zip")?.value.trim() || "";
    return Boolean(
      cart.length &&
      get("firstName")?.value.trim() &&
      get("lastName")?.value.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(get("email")?.value.trim() || "") &&
      get("phone")?.value.trim() &&
      get("address")?.value.trim() &&
      get("city")?.value.trim() &&
      get("state")?.value.trim() &&
      /^\d{5}$/.test(zip)
    );
  };

  async function createOrder() {
    if (!validCheckout()) {
      setStatus("Completa los datos de contacto y envío antes de pagar.", "error");
      throw new Error("Checkout incompleto");
    }

    const customer = {
      firstName: get("firstName").value.trim(),
      lastName: get("lastName").value.trim(),
      email: get("email").value.trim(),
      phone: get("phone").value.trim(),
      address: get("address").value.trim(),
      city: get("city").value.trim(),
      state: get("state").value.trim(),
      zip: get("zip").value.trim(),
    };

    setStatus("Preparando el pago…");
    const response = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: getCart(), customer }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) throw new Error(data.error || "No pudimos crear el pedido de PayPal.");
    return { orderId: data.id };
  }

  async function captureOrder({ orderId }) {
    setStatus("Confirmando el pago…");
    const response = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: orderId }),
    });
    const capture = await response.json().catch(() => ({}));
    if (!response.ok || capture.status !== "COMPLETED") {
      throw new Error(capture.error || "PayPal no pudo confirmar el pago.");
    }

    const order = {
      number: capture.internalNumber,
      items: getCart(),
      customer: {
        firstName: get("firstName").value.trim(),
        lastName: get("lastName").value.trim(),
        email: get("email").value.trim(),
        phone: get("phone").value.trim(),
        address: get("address").value.trim(),
        city: get("city").value.trim(),
        state: get("state").value.trim(),
        zip: get("zip").value.trim(),
        country: "United States",
      },
      status: "Pagado",
      payment: {
        provider: "PayPal",
        environment: "sandbox",
        paypalOrderId: capture.orderID,
        captureId: capture.captureID,
        status: capture.status,
        amount: capture.amount,
      },
      createdAt: new Date().toISOString(),
      total: Number(capture.amount || 0),
    };

    localStorage.setItem("fhLastOrder", JSON.stringify(order));
    localStorage.setItem("fhOrders", JSON.stringify([order, ...JSON.parse(localStorage.getItem("fhOrders") || "[]")]));
    localStorage.removeItem("fhCart");
    window.location.href = "pedido-confirmado.html";
    return capture;
  }

  async function init() {
    if (!button || !window.paypal?.createInstance) {
      setStatus("No pudimos cargar PayPal. Recarga la página e inténtalo nuevamente.", "error");
      return;
    }

    try {
      const sdk = await window.paypal.createInstance({
        clientId: CLIENT_ID,
        components: ["paypal-payments"],
        pageType: "checkout",
        locale: "en-US",
      });

      const methods = await sdk.findEligibleMethods({ currencyCode: "USD" });
      if (!methods.isEligible("paypal")) {
        setStatus("PayPal no está disponible para este dispositivo o cuenta.", "error");
        return;
      }

      const session = sdk.createPayPalOneTimePaymentSession({
        onApprove: captureOrder,
        onCancel: () => setStatus("Pago cancelado. Puedes intentarlo nuevamente."),
        onError: (error) => {
          console.error("PayPal session error", error);
          setStatus("No pudimos completar el pago. Inténtalo nuevamente.", "error");
        },
      });

      button.hidden = false;
      setStatus("PayPal está listo. Completa tus datos y continúa con el pago.");

      button.addEventListener("click", async () => {
        try {
          const orderPromise = createOrder();
          await session.start({ presentationMode: "auto" }, orderPromise);
        } catch (error) {
          console.error("PayPal start error", error);
          setStatus(error instanceof Error ? error.message : "No pudimos iniciar el pago.", "error");
        }
      });
    } catch (error) {
      console.error("PayPal SDK initialization error", error);
      setStatus("No pudimos inicializar PayPal. Revisa la configuración de Sandbox.", "error");
    }
  }

  init();
})();
