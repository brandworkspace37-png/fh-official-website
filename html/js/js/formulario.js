/* =========================================
   FORM & HALO — FORMULARIO
   STEP 1
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#project-form");

    if (!form) {
        return;
    }


    /* =========================================
       ELEMENTOS
       ========================================= */

    const stepOne = document.querySelector('[data-step="1"]');
    const stepTwo = document.querySelector('[data-step="2"]');

    const nextStep = document.querySelector("#next-step");

    const country = document.querySelector("#country");
    const phone = document.querySelector("#phone");
    const phoneCode = document.querySelector("#phone-code");

    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const zip = document.querySelector("#zip");

    const message = document.querySelector("#step-one-message");

    const progressStepOne =
        document.querySelector('[data-progress-step="1"]');

    const progressStepTwo =
        document.querySelector('[data-progress-step="2"]');


    /* =========================================
       CÓDIGOS DE PAÍS
       ========================================= */

    const countryCodes = {
        US: "+1",
        MX: "+52",
        CA: "+1"
    };


    /* =========================================
       CAMBIAR CÓDIGO SEGÚN PAÍS
       ========================================= */

    country.addEventListener("change", () => {

        const selectedCountry = country.value;

        phoneCode.textContent =
            countryCodes[selectedCountry] || "+";

        phone.value = "";

        phone.focus();

    });


    /* =========================================
       VALIDACIÓN DEL NOMBRE
       ========================================= */

    function validateName(value) {

        /*
         * Permitimos:
         * letras
         * espacios
         * tildes
         * ñ
         */

        const namePattern =
            /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;

        return namePattern.test(value.trim());

    }


    /* =========================================
       VALIDACIÓN DEL EMAIL
       ========================================= */

    function validateEmail(value) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        return emailPattern.test(value.trim());

    }


    /* =========================================
       VALIDACIÓN DEL TELÉFONO
       ========================================= */

    function validatePhone(value, selectedCountry) {

        const digits = value.replace(/\D/g, "");

        if (!selectedCountry) {
            return false;
        }


        /*
         * Estados Unidos / Canadá
         * 10 dígitos nacionales
         */

        if (
            selectedCountry === "US" ||
            selectedCountry === "CA"
        ) {

            return digits.length === 10;

        }


        /*
         * México
         * 10 dígitos nacionales
         */

        if (selectedCountry === "MX") {

            return digits.length === 10;

        }


        return false;

    }


    /* =========================================
       VALIDACIÓN DEL CÓDIGO POSTAL
       ========================================= */

    function validateZip(value, selectedCountry) {

        const cleanZip = value.trim();


        if (selectedCountry === "US") {

            return /^\d{5}(-\d{4})?$/.test(cleanZip);

        }


        if (selectedCountry === "CA") {

            return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
                .test(cleanZip);

        }


        if (selectedCountry === "MX") {

            return /^\d{5}$/.test(cleanZip);

        }


        return false;

    }


    /* =========================================
       MENSAJE DE ERROR
       ========================================= */

    function showError() {

        message.textContent = "😥";
        message.classList.add("has-error");

    }


    /* =========================================
       VERIFICACIÓN CORRECTA
       ========================================= */

    function showSuccess() {

        message.textContent = "✓";
        message.classList.remove("has-error");
        message.classList.add("is-success");

    }


    /* =========================================
       LIMPIAR MENSAJE
       ========================================= */

    function clearMessage() {

        message.textContent = "";

        message.classList.remove(
            "has-error",
            "is-success"
        );

    }


    /* =========================================
       CONTINUAR AL STEP 2
       ========================================= */

    nextStep.addEventListener("click", () => {

        clearMessage();


        const nameValue = name.value.trim();
        const emailValue = email.value.trim();
        const phoneValue = phone.value.trim();
        const zipValue = zip.value.trim();
        const countryValue = country.value;


        /* NOMBRE */

        if (!nameValue || !validateName(nameValue)) {

            showError();

            name.focus();

            return;

        }


        /* PAÍS */

        if (!countryValue) {

            showError();

            country.focus();

            return;

        }


        /* TELÉFONO */

        if (!validatePhone(
            phoneValue,
            countryValue
        )) {

            showError();

            phone.focus();

            return;

        }


        /* EMAIL */

        if (!emailValue || !validateEmail(emailValue)) {

            showError();

            email.focus();

            return;

        }


        /* CÓDIGO POSTAL */

        if (!validateZip(
            zipValue,
            countryValue
        )) {

            showError();

            zip.focus();

            return;

        }


        /* TODO CORRECTO */

        showSuccess();


        setTimeout(() => {

            stepOne.hidden = true;

            stepOne.classList.remove("is-active");

            stepTwo.hidden = false;

            stepTwo.classList.add("is-active");


            progressStepOne.classList.add("is-complete");

            progressStepTwo.classList.add("is-active");


            stepTwo
                .querySelector("h1")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }, 500);

    });

});