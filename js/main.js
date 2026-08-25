/* =========================================
   FORM & HALO — GLOBAL UI
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (!menuToggle || !navLinks) return;

    const closeMenu = () => {
        navLinks.classList.remove("is-open");
        navLinks.style.removeProperty("display");
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = !navLinks.classList.contains("is-open");
        navLinks.classList.toggle("is-open", isOpen);
        if (window.matchMedia("(max-width: 640px)").matches) {
            navLinks.style.display = isOpen ? "flex" : "none";
            if (isOpen) {
                Object.assign(navLinks.style, {
                    position: "absolute", top: "76px", left: "14px", right: "14px",
                    flexDirection: "column", alignItems: "stretch", gap: "0",
                    padding: "8px", background: "rgba(16,16,15,.97)",
                    border: "1px solid rgba(243,239,230,.14)", zIndex: "20"
                });
                navLinks.querySelectorAll("a").forEach(link => {
                    Object.assign(link.style, { padding: "14px", borderBottom: "1px solid rgba(243,239,230,.08)" });
                });
            }
        }
        menuToggle.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => { if (!window.matchMedia("(max-width: 640px)").matches) closeMenu(); });
});