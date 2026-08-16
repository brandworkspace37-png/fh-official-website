/* =========================================
   FORM & HALO — FORMULARIO
   STEP 1 + STEP 2
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#project-form");

    if (!form) return;


    /* =========================================
       ELEMENTOS GENERALES
       ========================================= */

    const stepOne = document.querySelector('[data-step="1"]');
    const stepTwo = document.querySelector('[data-step="2"]');
    const formTrack =
    document.querySelector(".form-track");

    const nextStep = document.querySelector("#next-step");
    const previousStep = document.querySelector("#previous-step");

    const progressStepOne =
        document.querySelector('[data-progress-step="1"]');

    const progressStepTwo =
        document.querySelector('[data-progress-step="2"]');


    /* =========================================
       STEP 1
       ========================================= */

    const country = document.querySelector("#country");
    const phone = document.querySelector("#phone");
    const phoneCode = document.querySelector("#phone-code");

    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const zip = document.querySelector("#zip");

    const stepOneMessage =
        document.querySelector("#step-one-message");


    const countryCodes = {
        US: "+1",
        MX: "+52",
        CA: "+1"
    };


    country.addEventListener("change", () => {

        phoneCode.textContent =
            countryCodes[country.value] || "+";

        phone.value = "";

    });


    function validateName(value) {

        const namePattern =
            /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;

        return namePattern.test(value.trim());

    }


    function validateEmail(value) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        return emailPattern.test(value.trim());

    }


    function validatePhone(value, selectedCountry) {

        const digits = value.replace(/\D/g, "");

        if (!selectedCountry) return false;

        if (
            selectedCountry === "US" ||
            selectedCountry === "CA"
        ) {
            return digits.length === 10;
        }

        if (selectedCountry === "MX") {
            return digits.length === 10;
        }

        return false;

    }


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


    function showStepOneError() {

        stepOneMessage.textContent = "😥";
        stepOneMessage.classList.add("has-error");

    }


    function showStepOneSuccess() {

        stepOneMessage.textContent = "✓";
        stepOneMessage.classList.remove("has-error");
        stepOneMessage.classList.add("is-success");

    }


    function clearStepOneMessage() {

        stepOneMessage.textContent = "";

        stepOneMessage.classList.remove(
            "has-error",
            "is-success"
        );

    }


    /* =========================================
       PASAR A STEP 2
       ========================================= */

    nextStep.addEventListener("click", () => {

        clearStepOneMessage();


        const nameValue = name.value.trim();
        const emailValue = email.value.trim();
        const phoneValue = phone.value.trim();
        const zipValue = zip.value.trim();
        const countryValue = country.value;


        if (
            !nameValue ||
            !validateName(nameValue)
        ) {

            showStepOneError();
            name.focus();

            return;

        }


        if (!countryValue) {

            showStepOneError();
            country.focus();

            return;

        }


        if (
            !validatePhone(
                phoneValue,
                countryValue
            )
        ) {

            showStepOneError();
            phone.focus();

            return;

        }


        if (
            !emailValue ||
            !validateEmail(emailValue)
        ) {

            showStepOneError();
            email.focus();

            return;

        }


        if (
            !validateZip(
                zipValue,
                countryValue
            )
        ) {

            showStepOneError();
            zip.focus();

            return;

        }


        showStepOneSuccess();


        setTimeout(() => {

            stepOne.classList.remove("is-active");
     stepTwo.classList.add("is-active");

     formTrack.classList.add("show-step-2");
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


    /* =========================================
       VOLVER A STEP 1
       ========================================= */

    previousStep.addEventListener("click", () => {

        stepTwo.hidden = true;
        stepTwo.classList.remove("is-active");

        stepOne.hidden = false;
        stepOne.classList.add("is-active");

        progressStepTwo.classList.remove("is-active");
        progressStepOne.classList.remove("is-complete");

        stepOne
            .querySelector("h1")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    });


    /* =========================================
       STEP 2 — ELEMENTOS
       ========================================= */

    const interestOptions =
        document.querySelectorAll(
            'input[name="interest"]'
        );

    const selectionMode =
        document.querySelector("#selection-mode");

    const customResponseTrigger =
        document.querySelector(
            "#custom-response-trigger"
        );

    const customResponseMode =
        document.querySelector(
            "#custom-response-mode"
        );

    const backToSelection =
        document.querySelector(
            "#back-to-selection"
        );

    const projectDetails =
        document.querySelector(
            "#project-details"
        );

    const projectFile =
        document.querySelector(
            "#project-file"
        );

    const attachment =
        document.querySelector(
            "#project-attachment"
        );

    const skipFile =
        document.querySelector("#skip-file");

    const stepTwoMessage =
        document.querySelector(
            "#step-two-message"
        );


    let customMode = false;


    /* =========================================
       MÁXIMO 2 OPCIONES
       ========================================= */

    interestOptions.forEach((option) => {

        option.addEventListener("change", () => {

            const selected =
                document.querySelectorAll(
                    'input[name="interest"]:checked'
                );

            if (selected.length >= 2) {

                interestOptions.forEach((item) => {

                    if (!item.checked) {
                        item.disabled = true;
                    }

                });

            } else {

                interestOptions.forEach((item) => {
                    item.disabled = false;
                });

            }

        });

    });


    /* =========================================
       PERSONALIZAR MI RESPUESTA
       ========================================= */

    customResponseTrigger.addEventListener(
        "click",
        () => {

            customMode = true;


            interestOptions.forEach((option) => {

                option.checked = false;
                option.disabled = false;

            });


            selectionMode.hidden = true;

            customResponseMode.hidden = false;

            projectFile.hidden = true;

            stepTwoMessage.textContent = "";

            projectDetails.focus();

        }
    );


    /* =========================================
       VOLVER A OPCIONES
       ========================================= */

    backToSelection.addEventListener(
        "click",
        () => {

            customMode = false;

            customResponseMode.hidden = true;

            selectionMode.hidden = false;

            projectFile.hidden = true;

            stepTwoMessage.textContent = "";

        }
    );


    /* =========================================
       CONTADOR DE CARACTERES
       ========================================= */

    const characterCounter =
        document.querySelector(
            ".character-counter"
        );


    projectDetails.addEventListener(
        "input",
        () => {

            const length =
                projectDetails.value.trim().length;

            characterCounter.textContent =
                `${length} / 50 caracteres mínimos`;

        }
    );


    /* =========================================
       ARCHIVO
       ========================================= */

    interestOptions.forEach((option) => {

        option.addEventListener("change", () => {

            const selected =
                document.querySelectorAll(
                    'input[name="interest"]:checked'
                );

            if (
                selected.length > 0 &&
                !customMode
            ) {

                projectFile.hidden = false;

            }

        });

    });


    /* =========================================
       OMITIR ARCHIVO
       ========================================= */

    skipFile.addEventListener(
        "click",
        () => {

            attachment.value = "";

            projectFile.dataset.skipped = "true";

        }
    );


    /* =========================================
       VALIDAR ARCHIVO
       ========================================= */

    attachment.addEventListener(
        "change",
        () => {

            const file = attachment.files[0];

            if (!file) return;


            const allowedTypes = [
                "image/png",
                "application/pdf"
            ];


            if (!allowedTypes.includes(file.type)) {

                attachment.value = "";

                alert(
                    "Solo puedes subir archivos PNG o PDF."
                );

                return;

            }


            /*
             * Límite inicial de 10 MB.
             * Posteriormente podremos cambiarlo
             * desde el backend.
             */

            const maxSize =
                10 * 1024 * 1024;


            if (file.size > maxSize) {

                attachment.value = "";

                alert(
                    "El archivo no puede superar los 10 MB."
                );

            }

        }
    );


    /* =========================================
       MENSAJE DE ERROR STEP 2
       ========================================= */

    function showStepTwoError() {

        stepTwoMessage.textContent = "😥";
        stepTwoMessage.classList.add("has-error");

    }


    function clearStepTwoMessage() {

        stepTwoMessage.textContent = "";

        stepTwoMessage.classList.remove(
            "has-error"
        );

    }


    /* =========================================
   ENVÍO DEL FORMULARIO
   ========================================= */

form.addEventListener("submit", (event) => {

    event.preventDefault();

    clearStepTwoMessage();


    /* =========================================
       CAMINO 1 — PERSONALIZAR
       ========================================= */

    if (customMode) {

        const text = projectDetails.value.trim();

        if (text.length < 50) {

            showStepTwoError();

            projectDetails.focus();

            return;
        }

    }


    /* =========================================
       CAMINO 2 — SELECCIÓN
       ========================================= */

    else {

        const selected =
            document.querySelectorAll(
                'input[name="interest"]:checked'
            );


        if (selected.length !== 2) {

            showStepTwoError();

            return;
        }

    }


    /* =========================================
       VALIDACIÓN CORRECTA
       ========================================= */

    stepTwoMessage.textContent = "✓";

    stepTwoMessage.classList.remove("has-error");
    stepTwoMessage.classList.add("is-success");


    /*
     * TODAVÍA NO ENVIAMOS LOS DATOS.
     *
     * Aquí posteriormente conectaremos:
     *
     * formulario
     * ↓
     * backend
     * ↓
     * almacenamiento
     * ↓
     * base de datos
     * ↓
     * CRM
     */

    console.log("Formulario válido y listo para enviar.");

});
