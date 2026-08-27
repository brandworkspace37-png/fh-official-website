const emailForm = document.getElementById("email-form");
const codeForm = document.getElementById("code-form");
const emailInput = document.getElementById("email");
const codeInput = document.getElementById("code");
const backButton = document.getElementById("back-button");
const message = document.getElementById("message");

function showMessage(text, error = false) {
  message.textContent = text;
  message.className = `message${error ? " error" : ""}`;
}

async function api(path, body) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

async function checkExistingSession() {
  const response = await fetch("/api/admin/me", { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) return;
  const data = await response.json();
  if (data.authenticated) window.location.replace("/admin/dashboard.html");
}

emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  if (!email) return showMessage("Enter your email.", true);

  emailForm.querySelector("button[type=submit]").disabled = true;
  showMessage("Sending your code…");
  try {
    await api("/api/admin/request-otp", { email });
    emailForm.classList.add("hidden");
    codeForm.classList.remove("hidden");
    codeInput.focus();
    showMessage("If your email is authorized, a verification code has been sent.");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    emailForm.querySelector("button[type=submit]").disabled = false;
  }
});

codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = codeInput.value.trim();
  if (!/^\d{6}$/.test(code)) return showMessage("Enter the 6-digit code.", true);

  codeForm.querySelector("button[type=submit]").disabled = true;
  showMessage("Verifying…");
  try {
    await api("/api/admin/verify-otp", { email: emailInput.value.trim().toLowerCase(), code });
    window.location.replace("/admin/dashboard.html");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    codeForm.querySelector("button[type=submit]").disabled = false;
  }
});

backButton.addEventListener("click", () => {
  codeForm.classList.add("hidden");
  emailForm.classList.remove("hidden");
  codeInput.value = "";
  showMessage("");
  emailInput.focus();
});

checkExistingSession();
