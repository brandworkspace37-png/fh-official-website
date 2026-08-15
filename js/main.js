/* =========================================
   FORM & HALO — MAIN JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       MENÚ MÓVIL
       ========================================= */

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navCta = document.querySelector(".nav-cta");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("is-open");

            menuToggle.classList.toggle("is-open", isOpen);

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Cerrar menú" : "Abrir menú"
            );

        });


        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("is-open");
                menuToggle.classList.remove("is-open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Abrir menú"
                );

            });

        });


        if (navCta) {

            navCta.addEventListener("click", () => {

                navLinks.classList.remove("is-open");
                menuToggle.classList.remove("is-open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Abrir menú"
                );

            });

        }

    }


    /* =========================================
       FORMULARIO
       ========================================= */

    const projectForm = document.querySelector("#project-form");

    if (!projectForm) {
        return;
    }


    /* ELEMENTOS */

    const stepOne = document.querySelector('[data-step="1"]');
    const stepTwo = document.querySelector('[data-step="2"]');

    const nextStep = document.querySelector("#next-step");
    const previousStep = document.querySelector("#previous-step");

    const selectionMode = document.querySelector("#selection-mode");
    const customResponseTrigger = document.querySelector(
        "#custom-response-trigger"
    );

    const customResponseMode = document.querySelector(
        "#custom-response-mode"
    );

    const backToSelection = document.querySelector(
        "#back-to-selection"
    );

    const projectFile = document.querySelector("#project-file");

    const skipFile = document.querySelector("#skip-file");

    const attachment = document.querySelector(
        "#project-attachment"
    );

    const interestOptions = document.querySelectorAll(
        'input[name="interest"]'
    );


    /* =========================================
       CAMBIO DE PASOS
       ========================================= */

    function showStep(step) {

        if (step === 1) {

            stepOne.classList.add("is-active");
            stepTwo.classList.remove("is-active");

        }

        if (step === 2) {

            stepOne.classList.remove("is-active");
            stepTwo.classList.add("is-active");

        }

    }


    /* =========================================
       PASO 1 → PASO 2
       ========================================= */

    if (nextStep) {

        nextStep.addEventListener("click", () => {

            if (!stepOne.checkValidity()) {

                stepOne
                    .querySelector(":invalid")
                    ?.focus();

                return;
            }

            showStep(2);

            stepTwo
                .querySelector("h3")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        });

    }


    /* =========================================
       PASO 2 → PASO 1
       ========================================= */

    if (previousStep) {

        previousStep.addEventListener("click", () => {

            showStep(1);

            stepOne
                .querySelector("h3")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        });

    }


    /* =========================================
       MÁXIMO 2 INTERESES
       ========================================= */

    interestOptions.forEach((option) => {

        option.addEventListener("change", () => {

            const selectedOptions = document.querySelectorAll(
                'input[name="interest"]:checked'
            );

            if (selectedOptions.length >= 2) {

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
       PERSONALIZAR RESPUESTA
       ========================================= */

    if (customResponseTrigger) {

        customResponseTrigger.addEventListener("click", () => {

            interestOptions.forEach((option) => {

                option.checked = false;
                option.disabled = false;

            });

            selectionMode.hidden = true;

            customResponseMode.hidden = false;

            projectFile.hidden = true;

            customResponseMode
                .querySelector("textarea")
                ?.focus();

        });

    }


    /* =========================================
       VOLVER A OPCIONES
       ========================================= */

    if (backToSelection) {

        backToSelection.addEventListener("click", () => {

            customResponseMode.hidden = true;

            selectionMode.hidden = false;

            projectFile.hidden = false;

        });

    }


    /* =========================================
       OMITIR ARCHIVO
       ========================================= */

    if (skipFile) {

        skipFile.addEventListener("click", () => {

            if (attachment) {
                attachment.value = "";
            }

            projectFile.dataset.skipped = "true";

        });

    }


    /* =========================================
       VALIDACIÓN Y ENVÍO
       ========================================= */

    projectForm.addEventListener("submit", (event) => {

        event.preventDefault();


        /* VALIDAR PASO 1 */

        if (!stepOne.checkValidity()) {

            showStep(1);

            stepOne
                .querySelector(":invalid")
                ?.focus();

            return;

        }


        /* SI ESTÁ EN MODO PERSONALIZADO */

        if (!customResponseMode.hidden) {

            const customText =
                document
                    .querySelector("#project-details")
                    ?.value
                    .trim();

            if (!customText) {

                document
                    .querySelector("#project-details")
                    ?.focus();

                return;

            }

        }


        /* SI ESTÁ EN MODO SELECCIÓN */

        if (!selectionMode.hidden) {

            const selectedOptions =
                document.querySelectorAll(
                    'input[name="interest"]:checked'
                );

            if (selectedOptions.length === 0) {

                alert(
                    "Selecciona al menos una opción para continuar."
                );

                return;

            }

        }


        /*
         * TODAVÍA NO ENVIAMOS LOS DATOS.
         *
         * En esta etapa solamente comprobamos
         * que el formulario sea válido.
         */

        console.log("Formulario válido.");

    });

});