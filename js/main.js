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

    /* =========================================
       STORE — 2 / 2 / 2 PRODUCT GRID
       ========================================= */
    const storeStyle = document.createElement("style");
    storeStyle.textContent = `
        .fh-shop-grid{
            grid-template-columns:repeat(2,minmax(0,1fr)) !important;
            gap:34px 22px !important;
        }
        .fh-product-card{
            min-width:0 !important;
            background:transparent !important;
        }
        .fh-product-image{
            aspect-ratio:1/1 !important;
            background:transparent !important;
            border:0 !important;
            box-shadow:none !important;
            overflow:hidden !important;
        }
        .fh-product-image img{
            width:100% !important;
            height:100% !important;
            object-fit:contain !important;
            mix-blend-mode:multiply !important;
            display:block !important;
        }
        .fh-product-info{
            padding:14px 0 0 !important;
        }
        .fh-product-info h3{
            margin:8px 0 5px !important;
            font-size:18px !important;
        }
        .fh-product-info p{
            font-size:11px !important;
            max-width:420px !important;
        }
        .fh-product-action{
            margin-top:12px !important;
        }
        @media(max-width:640px){
            .fh-shop-grid{
                grid-template-columns:repeat(2,minmax(0,1fr)) !important;
                gap:28px 12px !important;
            }
            .fh-product-info h3{
                font-size:15px !important;
                line-height:1.15 !important;
            }
            .fh-product-info p{
                font-size:10px !important;
                line-height:1.4 !important;
            }
            .fh-product-action{
                font-size:8px !important;
                margin-top:10px !important;
            }
            .fh-product-meta{
                font-size:6.5px !important;
                letter-spacing:.11em !important;
            }
        }
    `;
    document.head.appendChild(storeStyle);

    const catrinaImage = "assets/oficial%20principal.png";
    const catrinaProduct = "html/catrina-led.html";
    document.querySelectorAll(".fh-product-card").forEach((card) => {
        const image = card.querySelector(".fh-product-image img");
        const title = card.querySelector(".fh-product-info h3");
        const description = card.querySelector(".fh-product-info p");
        const action = card.querySelector(".fh-product-action");
        const link = card.querySelector("a");
        const meta = card.querySelector(".fh-product-meta");

        if (image) {
            image.src = catrinaImage;
            image.alt = "Catrina Mexicana LED — Form & Halo";
        }
        if (title) title.textContent = "Catrina Mexicana LED";
        if (description) description.textContent = "Pieza luminosa para espacios con identidad.";
        if (action) action.textContent = "Ver producto →";
        if (meta) meta.innerHTML = "<span>COLECCIÓN MEXICANA</span><span>$599</span>";
        if (link) link.href = catrinaProduct;
    });

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