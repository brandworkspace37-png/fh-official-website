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

    /* =========================================
       STORE — 6 PRODUCT ECOMMERCE GRID
       ========================================= */
    const store = document.querySelector(".fh-shop-grid");
    if (store) {
        const products = [
            { category:"COLECCIÓN MEXICANA", name:"Catrina Mexicana LED", price:"Desde $599", image:"assets/oficial principal.png", href:"html/catrina-led.html" },
            { category:"RESTAURANTES", name:"Kebabé LED Sign", price:"Desde $799", image:"assets/acrylic led sign fh.png", href:"html/formulario.html?producto=Kebabe" },
            { category:"SALONES DE BELLEZA", name:"Nails by Yaneth", price:"Desde $499", image:"assets/metal blacklit sing fh.png", href:"html/formulario.html?producto=Nails" },
            { category:"CAFETERÍAS", name:"Paris Baguette", price:"Desde $899", image:"assets/metal frontlit sign fh.png", href:"html/formulario.html?producto=Paris" },
            { category:"FARMACIAS", name:"Cruz LED", price:"Desde $399", image:"assets/neon ledsing fh.png", href:"html/formulario.html?producto=Cruz" },
            { category:"BARES & LOUNGE", name:"Bar Lounge", price:"Desde $699", image:"assets/light box fh.png", href:"html/formulario.html?producto=Bar" }
        ];

        store.innerHTML = products.map(product => `
            <article class="fh-product-card">
                <a class="fh-product-image" href="${product.href}" aria-label="Ver ${product.name}">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </a>
                <div class="fh-product-info">
                    <div class="fh-product-meta"><span>${product.category}</span><span>01</span></div>
                    <h3>${product.name}</h3>
                    <p>${product.price}</p>
                    <a class="fh-product-action" href="${product.href}">Ver producto <span>→</span></a>
                </div>
            </article>
        `).join("");

        const style = document.createElement("style");
        style.textContent = `
            .fh-shop-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:34px 18px!important;align-items:start}
            .fh-product-card{background:transparent!important;min-width:0}
            .fh-product-image{aspect-ratio:1/1!important;background:#f0eee8;border:1px solid rgba(245,243,237,.09);overflow:hidden}
            .fh-product-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease,filter .45s ease}
            .fh-product-card:hover .fh-product-image img{transform:scale(1.025);filter:saturate(1.04)}
            .fh-product-info{padding:14px 1px 0!important}
            .fh-product-meta{font-size:7px!important;letter-spacing:.14em!important}
            .fh-product-info h3{font-size:18px!important;line-height:1.15!important;margin:9px 0 5px!important}
            .fh-product-info p{font-size:11px!important;color:var(--fh-muted)!important;margin:0!important}
            .fh-product-action{margin-top:13px!important;font-size:8px!important;letter-spacing:.14em!important}
            @media(max-width:640px){
                .fh-section{padding:68px 0!important}
                .fh-section-head{margin-bottom:28px!important;gap:12px!important}
                .fh-section-head h2{font-size:36px!important;line-height:.95!important;letter-spacing:-.045em!important}
                .fh-section-head p{font-size:12px!important;line-height:1.5!important}
                .fh-shop-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:30px 8px!important}
                .fh-product-info{padding-top:10px!important}
                .fh-product-meta{font-size:5.5px!important;letter-spacing:.09em!important;white-space:nowrap;overflow:hidden}
                .fh-product-info h3{font-size:12px!important;line-height:1.15!important;margin:6px 0 4px!important}
                .fh-product-info p{font-size:9px!important}
                .fh-product-action{margin-top:8px!important;font-size:6.5px!important;letter-spacing:.09em!important}
            }
        `;
        document.head.appendChild(style);
    }
});