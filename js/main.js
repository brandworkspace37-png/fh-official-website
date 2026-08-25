/* =========================================
   FORM & HALO — GLOBAL UI
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        menuToggle.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("is-open");
            menuToggle.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");
        });
    });
});