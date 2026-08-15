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

/* MENÚ MÓVIL — ESTADO ABIERTO */

@media (max-width: 768px) {

    .nav-links.is-open {
        position: absolute;

        top: 80px;
        left: 16px;
        right: 16px;

        display: flex;
        flex-direction: column;
        align-items: flex-start;

        gap: 0;

        padding: 25px;

        background: var(--color-black);

        border: 1px solid rgba(255, 255, 255, 0.1);

        z-index: 20;
    }

    .nav-links.is-open a {
        width: 100%;

        padding: 16px 0;

        border-bottom: 1px solid rgba(255, 255, 255, 0.08);

        font-size: 14px;
    }

    .nav-links.is-open a:last-child {
        border-bottom: none;
    }


    /* ANIMACIÓN DEL BOTÓN */

    .menu-toggle.is-open span:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
    }

    .menu-toggle.is-open span:nth-child(2) {
        opacity: 0;
    }

    .menu-toggle.is-open span:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
    }

}