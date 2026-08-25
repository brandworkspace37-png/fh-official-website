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
  const country = document.querySelector('.contact-fields select#country');
  const phone = document.querySelector("#phone");
  const phoneCountry = document.querySelector('.phone-field select#country');
  const phoneCode = document.querySelector("#phone-code");
  const email = document.querySelector("#email");
  const zip = document.querySelector("#zip");

  // The original markup contained two elements with id="country".
  // Normalize the second one immediately so the form has unique IDs at runtime.
  if (phoneCountry && phoneCountry !== country) {
    phoneCountry.id = "phone-country";
    phoneCountry.name = "phone-country";
  }

  const countryCodes = { US: "+1", MX: "+52", CA: "+1" };
  const updatePhoneCode = () => {
    const value = country?.value || "";
    if (phoneCode) phoneCode.textContent = countryCodes[value] || "+";
    if (phoneCountry && phoneCountry.value !== value) phoneCountry.value = value;
  };

  country?.addEventListener("change", () => {
    if (phoneCountry) phoneCountry.value = country.value;
    if (phone) phone.value = "";
    updatePhoneCode();
  });

  phoneCountry?.addEventListener("change", () => {
    if (country) country.value = phoneCountry.value;
    updatePhoneCode();
    if (phone) phone.value = "";
  });
  updatePhoneCode();

  const nameRule = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;
  const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const showMessage = (element, text, type = "error") => {
    if (!element) return;
    element.textContent = text;
    element.classList.remove("has-error", "is-success");
    if (text) element.classList.add(type === "success" ? "is-success" : "has-error");
  };

  const validateStepOne = () => {
    const nameValue = name.value.trim();
    const emailValue = email.value.trim();
    const phoneDigits = phone.value.replace(/\D/g, "");
    const countryValue = country.value;
    const zipValue = zip.value.trim();

    if (!nameValue || !nameRule.test(nameValue)) {
      showMessage(stepOneMessage, "Revisa tu nombre.");
      name.focus();
      return false;
    }
    if (!["US", "MX", "CA"].includes(countryValue)) {
      showMessage(stepOneMessage, "Selecciona tu país.");
      country.focus();
      return false;
    }
    if (phoneDigits.length !== 10) {
      showMessage(stepOneMessage, "Introduce un teléfono válido de 10 dígitos.");
      phone.focus();
      return false;
    }
    if (!emailRule.test(emailValue)) {
      showMessage(stepOneMessage, "Introduce un email válido.");
      email.focus();
      return false;
    }
    const validZip = countryValue === "CA"
      ? /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zipValue)
      : /^\d{5}$/.test(zipValue);
    if (!validZip) {
      showMessage(stepOneMessage, "Revisa tu código postal.");
      zip.focus();
      return false;
    }

    showMessage(stepOneMessage, "✓", "success");
    return true;
  };

  nextStep?.addEventListener("click", () => {
    if (!validateStepOne()) return;
    setTimeout(() => {
      stepOne.classList.remove("is-active");
      stepTwo.classList.add("is-active");
      stepOne.setAttribute("aria-hidden", "true");
      stepTwo.setAttribute("aria-hidden", "false");
      track.classList.add("show-step-2");
      progressOne.classList.add("is-complete");
      progressTwo.classList.add("is-active");
    }, 250);
  });

  previousStep?.addEventListener("click", () => {
    stepTwo.classList.remove("is-active");
    stepOne.classList.add("is-active");
    stepTwo.setAttribute("aria-hidden", "true");
    stepOne.setAttribute("aria-hidden", "false");
    track.classList.remove("show-step-2");
    progressTwo.classList.remove("is-active");
    progressOne.classList.remove("is-complete");
  });

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

  const updateInterestLimit = () => {
    const selected = interestOptions.filter((item) => item.checked);
    interestOptions.forEach((item) => {
      item.disabled = selected.length >= 2 && !item.checked;
    });
    if (selected.length && !customMode) projectFile.hidden = false;
  };

  interestOptions.forEach((option) => option.addEventListener("change", updateInterestLimit));

  customTrigger?.addEventListener("click", () => {
    customMode = true;
    interestOptions.forEach((option) => { option.checked = false; option.disabled = false; });
    selectionMode.hidden = true;
    customModeElement.hidden = false;
    projectFile.hidden = true;
    showMessage(stepTwoMessage, "");
    projectDetails.focus();
  });

  backToSelection?.addEventListener("click", () => {
    customMode = false;
    customModeElement.hidden = true;
    selectionMode.hidden = false;
    projectFile.hidden = true;
    showMessage(stepTwoMessage, "");
  });

  projectDetails?.addEventListener("input", () => {
    if (counter) counter.textContent = `${projectDetails.value.trim().length} / 50 caracteres mínimos`;
  });

  skipFile?.addEventListener("click", () => {
    attachment.value = "";
    projectFile.dataset.skipped = "true";
  });

  attachment?.addEventListener("change", () => {
    const file = attachment.files?.[0];
    if (!file) return;
    const allowed = ["image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      attachment.value = "";
      showMessage(stepTwoMessage, "Solo puedes subir archivos PNG o PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      attachment.value = "";
      showMessage(stepTwoMessage, "El archivo no puede superar los 10 MB.");
    }
  });

  const submitProject = async () => {
    if (!validateStepOne()) {
      stepOne.classList.add("is-active");
      stepTwo.classList.remove("is-active");
      track.classList.remove("show-step-2");
      return;
    }

    const interests = interestOptions.filter((item) => item.checked).map((item) => item.value);
    const details = projectDetails?.value.trim() || "";
    if (customMode && details.length < 50) {
      showMessage(stepTwoMessage, "Cuéntanos un poco más sobre tu proyecto (mínimo 50 caracteres).");
      projectDetails.focus();
      return;
    }
    if (!customMode && (interests.length < 1 || interests.length > 2)) {
      showMessage(stepTwoMessage, "Selecciona 1 o 2 opciones para continuar.");
      return;
    }

    const file = attachment?.files?.[0];
    const payload = {
      name: name.value.trim(),
      country: country.value,
      phone: phone.value.trim(),
      email: email.value.trim(),
      zip: zip.value.trim(),
      interests,
      details,
      attachment: file ? { name: file.name, type: file.type, size: file.size } : null,
    };

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando…";
    }
    showMessage(stepTwoMessage, "Enviando tu proyecto…");

    try {
      const response = await fetch("/api/project-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "No pudimos enviar el formulario.");

      showMessage(stepTwoMessage, "✓ Recibimos tu proyecto. Te contactaremos pronto.", "success");
      form.querySelectorAll("input, select, textarea, button").forEach((element) => {
        if (element !== submitButton) element.disabled = true;
      });
      if (submitButton) submitButton.textContent = "Proyecto enviado";
    } catch (error) {
      showMessage(stepTwoMessage, error instanceof Error ? error.message : "No pudimos enviar el formulario. Inténtalo nuevamente.");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar mi proyecto";
      }
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitProject();
  });
});
