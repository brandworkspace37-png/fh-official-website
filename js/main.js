/* =========================================
   FORM & HALO — MAIN JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navCta = document.querySelector(".nav-cta");

    if (!menuToggle || !navLinks) {
        return;
    }

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


    /* CERRAR MENÚ AL SELECCIONAR UNA SECCIÓN */

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


    /* CERRAR MENÚ AL HACER CLICK EN EL CTA */

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

});
/* =========================================
   FORMULARIO — MÁXIMO 2 INTERESES
   ========================================= */

const interestOptions = document.querySelectorAll(
    'input[name="interest"]'
);

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