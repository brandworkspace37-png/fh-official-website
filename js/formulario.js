document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#project-form");
  if (!form) return;

  const stepOne = document.querySelector('[data-step="1"]');
  const stepTwo = document.querySelector('[data-step="2"]');
  const track = document.querySelector(".form-track");
  const progressOne = document.querySelector('[data-progress-step="1"]');
  const progressTwo = document.querySelector('[data-progress-step="2"]');
  const nextStep = document.querySelector("#next-step");
  const previousStep = document.querySelector("#previous-step");
  const stepOneMessage = document.querySelector("#step-one-message");
  const stepTwoMessage = document.querySelector("#step-two-message");
  const name = document.querySelector("#name");
  const country = document.querySelector("#country");
  const phone = document.querySelector("#phone");
  const phoneCountry = document.querySelector("#phone-country");
  const phoneCode = document.querySelector("#phone-code");
  const email = document.querySelector("#email");
  const zip = document.querySelector("#zip");
  const interestOptions = [...document.querySelectorAll('input[name="interest"]')];
  const selectionMode = document.querySelector("#selection-mode");
  const customTrigger = document.querySelector("#custom-response-trigger");
  const customModeElement = document.querySelector("#custom-response-mode");
  const backToSelection = document.querySelector("#back-to-selection");
  const projectDetails = document.querySelector("#project-details");
  const projectFile = document.querySelector("#project-file");
  const attachment = document.querySelector("#project-attachment");
  const skipFile = document.querySelector("#skip-file");
  const counter = document.querySelector(".character-counter");
  let customMode = false;

  const countryCodes = { US: "+1", MX: "+52", CA: "+1" };
  const showMessage = (element, text, type = "error") => {
    if (!element) return;
    element.textContent = text;
    element.classList.toggle("is-success", type === "success" && Boolean(text));
    element.classList.toggle("has-error", type !== "success" && Boolean(text));
  };
  const syncPhoneCountry = (source) => {
    if (source === country && phoneCountry) phoneCountry.value = country.value;
    if (source === phoneCountry && country) country.value = phoneCountry.value;
    if (phoneCode) phoneCode.textContent = countryCodes[country?.value] || "+";
  };
  country?.addEventListener("change", () => { syncPhoneCountry(country); if (phone) phone.value = ""; });
  phoneCountry?.addEventListener("change", () => { syncPhoneCountry(phoneCountry); if (phone) phone.value = ""; });
  syncPhoneCountry(country);

  const validateStepOne = () => {
    const nameValue = name.value.trim();
    const phoneDigits = phone.value.replace(/\D/g, "");
    const zipValue = zip.value.trim();
    if (!nameValue || !/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '\-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/.test(nameValue)) { showMessage(stepOneMessage, "Revisa tu nombre."); name.focus(); return false; }
    if (!(country.value in countryCodes)) { showMessage(stepOneMessage, "Selecciona tu país."); country.focus(); return false; }
    if (phoneDigits.length !== 10) { showMessage(stepOneMessage, "Introduce un teléfono válido de 10 dígitos."); phone.focus(); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { showMessage(stepOneMessage, "Introduce un email válido."); email.focus(); return false; }
    const validZip = country.value === "CA" ? /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zipValue) : /^\d{5}$/.test(zipValue);
    if (!validZip) { showMessage(stepOneMessage, "Revisa tu código postal."); zip.focus(); return false; }
    showMessage(stepOneMessage, "Datos correctos ✓", "success");
    return true;
  };

  const showStep = (step) => {
    const second = step === 2;
    stepOne.classList.toggle("is-active", !second);
    stepTwo.classList.toggle("is-active", second);
    stepOne.setAttribute("aria-hidden", second ? "true" : "false");
    stepTwo.setAttribute("aria-hidden", second ? "false" : "true");
    track?.classList.toggle("show-step-2", second);
    progressOne?.classList.toggle("is-complete", second);
    progressOne?.classList.toggle("is-active", !second);
    progressTwo?.classList.toggle("is-active", second);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  nextStep?.addEventListener("click", () => { if (validateStepOne()) showStep(2); });
  previousStep?.addEventListener("click", () => showStep(1));

  const updateInterestLimit = () => {
    const selected = interestOptions.filter(item => item.checked);
    interestOptions.forEach(item => { item.disabled = selected.length >= 2 && !item.checked; });
    if (selected.length && !customMode && projectFile) projectFile.hidden = false;
  };
  interestOptions.forEach(option => option.addEventListener("change", updateInterestLimit));

  customTrigger?.addEventListener("click", () => {
    customMode = true;
    interestOptions.forEach(option => { option.checked = false; option.disabled = false; });
    selectionMode.hidden = true; customModeElement.hidden = false; if (projectFile) projectFile.hidden = true;
    showMessage(stepTwoMessage, ""); projectDetails?.focus();
  });
  backToSelection?.addEventListener("click", () => {
    customMode = false; customModeElement.hidden = true; selectionMode.hidden = false; if (projectFile) projectFile.hidden = true; showMessage(stepTwoMessage, "");
  });
  projectDetails?.addEventListener("input", () => { if (counter) counter.textContent = `${projectDetails.value.trim().length} / 50 caracteres mínimos`; });
  skipFile?.addEventListener("click", () => { if (attachment) attachment.value = ""; if (projectFile) projectFile.dataset.skipped = "true"; });
  attachment?.addEventListener("change", () => {
    const file = attachment.files?.[0]; if (!file) return;
    if (!["image/png", "application/pdf"].includes(file.type)) { attachment.value = ""; showMessage(stepTwoMessage, "Solo puedes subir archivos PNG o PDF."); return; }
    if (file.size > 10 * 1024 * 1024) { attachment.value = ""; showMessage(stepTwoMessage, "El archivo no puede superar los 10 MB."); return; }
    if (projectFile) projectFile.dataset.skipped = "false";
    showMessage(stepTwoMessage, "Archivo listo ✓", "success");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!validateStepOne()) { showStep(1); return; }
    const interests = interestOptions.filter(item => item.checked).map(item => item.value);
    const details = projectDetails?.value.trim() || "";
    if (customMode && details.length < 50) { showMessage(stepTwoMessage, "Cuéntanos un poco más sobre tu proyecto (mínimo 50 caracteres)."); projectDetails?.focus(); return; }
    if (!customMode && (interests.length < 1 || interests.length > 2)) { showMessage(stepTwoMessage, "Selecciona 1 o 2 opciones para continuar."); return; }

    const file = attachment?.files?.[0] || null;
    if (file && (!["image/png", "application/pdf"].includes(file.type) || file.size > 10 * 1024 * 1024)) {
      showMessage(stepTwoMessage, "Revisa el archivo. Solo PNG o PDF de máximo 10 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.value.trim());
    formData.append("country", country.value);
    formData.append("phone", phone.value.trim());
    formData.append("email", email.value.trim());
    formData.append("zip", zip.value.trim());
    formData.append("interests", JSON.stringify(interests));
    formData.append("details", details);
    if (file) formData.append("attachment", file, file.name);

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Enviando…"; }
    showMessage(stepTwoMessage, file ? "Subiendo tu proyecto…" : "Guardando tu proyecto…");
    try {
      const response = await fetch("/api/project-leads", { method:"POST", body:formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "No pudimos enviar el formulario.");
      showMessage(stepTwoMessage, file ? "Proyecto enviado con archivo ✓" : "Proyecto recibido ✓", "success");
      form.querySelectorAll("input, select, textarea").forEach(element => element.disabled = true);
      if (submitButton) { submitButton.textContent = "Proyecto enviado ✓"; submitButton.disabled = true; }
    } catch (error) {
      showMessage(stepTwoMessage, error instanceof Error ? error.message : "No pudimos enviar el formulario. Inténtalo nuevamente.");
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Enviar proyecto ↗"; }
    }
  });
});
