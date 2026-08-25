/* =========================================
   FORM & HALO — GLOBAL UI
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
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
                        position:"absolute", top:"76px", left:"14px", right:"14px", flexDirection:"column",
                        alignItems:"stretch", gap:"0", padding:"8px", background:"rgba(16,16,15,.97)",
                        border:"1px solid rgba(243,239,230,.14)", zIndex:"20"
                    });
                    navLinks.querySelectorAll("a").forEach(link => Object.assign(link.style, {padding:"14px", borderBottom:"1px solid rgba(243,239,230,.08)"}));
                }
            }
            menuToggle.classList.toggle("is-open", isOpen);
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
        });
        navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
        window.addEventListener("resize", () => { if (!window.matchMedia("(max-width: 640px)").matches) closeMenu(); });
    }

    const socialIcon = (type) => type === "Instagram"
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.9v8H14Z" fill="currentColor"/></svg>';
    document.querySelectorAll(".fh-footer-social a[aria-label]").forEach(link => {
        link.innerHTML = socialIcon(link.getAttribute("aria-label"));
        link.style.fontSize = "0";
        const svg = link.querySelector("svg");
        if (svg) { svg.style.width = "15px"; svg.style.height = "15px"; }
    });
});