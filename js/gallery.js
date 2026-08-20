/* =========================================
   FORM & HALO — PROJECT GALLERY
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const hero = document.querySelector(".hero");
    const gallery = document.querySelector(".project-gallery");
    const track = document.querySelector(".gallery-track");

    if (!hero || !gallery || !track) return;

    /* =========================================
       HERO — SOLO PRESENTACIÓN VISUAL
       ========================================= */

    hero.querySelector(".hero-intro")?.remove();
    hero.querySelector(".hero-question")?.remove();

    Object.assign(hero.style, {
        minHeight: "auto",
        display: "block",
        paddingTop: "0",
        paddingBottom: "0"
    });

    /* =========================================
       HEADER — LOGO CENTRADO
       ========================================= */

    const headerNav = document.querySelector("header nav");
    const headerLogo = document.querySelector("header .logo");

    if (headerNav && headerLogo) {
        headerNav.style.position = "relative";

        Object.assign(headerLogo.style, {
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            zIndex: "2"
        });
    }

    /* =========================================
       CTA PRINCIPAL — FIJO DENTRO DEL ÁLBUM
       ========================================= */

    const galleryCtaGroup = document.createElement("div");
    galleryCtaGroup.className = "gallery-main-cta-group";

    Object.assign(galleryCtaGroup.style, {
        position: "absolute",
        left: "24px",
        bottom: "24px",
        zIndex: "10",
        width: "40%",
        maxWidth: "40%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        fontFamily: "Arial, Helvetica, sans-serif"
    });

    const galleryCta = document.createElement("a");
    galleryCta.className = "gallery-main-cta";
    galleryCta.href = "html/formulario.html";
    galleryCta.target = "_blank";
    galleryCta.rel = "noopener";
    galleryCta.textContent = "Iniciar mi proyecto";

    Object.assign(galleryCta.style, {
        display: "block",
        width: "100%",
        padding: "16px 23px",
        border: "1px solid rgba(241, 238, 231, 0.55)",
        background: "rgba(17, 17, 17, 0.45)",
        backdropFilter: "blur(4px)",
        color: "var(--color-white)",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "23.4px",
        fontWeight: "600",
        letterSpacing: "normal",
        textAlign: "left",
        whiteSpace: "nowrap",
        transition: "background 0.25s ease, color 0.25s ease, border-color 0.25s ease"
    });

    const ctaRows = document.createElement("div");
    ctaRows.className = "gallery-cta-rows";
    ctaRows.style.width = "100%";

    const ctaRowTexts = [
        "Cuéntanos qué quieres crear",
        "Recibe una propuesta para tu proyecto",
        "Comienza cuando estés listo"
    ];

    ctaRowTexts.forEach((text) => {
        const row = document.createElement("span");
        row.textContent = text;
        Object.assign(row.style, {
            display: "block",
            width: "100%",
            marginTop: "10px",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "15px",
            fontWeight: "400",
            lineHeight: "1.35",
            letterSpacing: "normal",
            color: "var(--color-white)",
            textShadow: "0 2px 7px rgba(0, 0, 0, 0.85)"
        });
        ctaRows.appendChild(row);
    });

    galleryCtaGroup.appendChild(galleryCta);
    galleryCtaGroup.appendChild(ctaRows);
    gallery.appendChild(galleryCtaGroup);

    galleryCta.addEventListener("mouseenter", () => {
        galleryCta.style.background = "var(--color-white)";
        galleryCta.style.color = "var(--color-black)";
        galleryCta.style.borderColor = "var(--color-white)";
    });

    galleryCta.addEventListener("mouseleave", () => {
        galleryCta.style.background = "rgba(17, 17, 17, 0.45)";
        galleryCta.style.color = "var(--color-white)";
        galleryCta.style.borderColor = "rgba(241, 238, 231, 0.55)";
    });

    /* =========================================
       CTA / PUENTE DESPUÉS DE LA GALERÍA
       ========================================= */

    const galleryBridge = document.createElement("div");
    galleryBridge.className = "hero-question";

    galleryBridge.innerHTML = `
        <div class="gallery-cta-content">
            <span class="gallery-cta-eyebrow">FORM & HALO</span>

            <h2>
                Hay ideas que cambian por completo la percepción de un espacio.
            </h2>

            <div class="gallery-cta-copy">
                <p>
                    Una entrada puede transmitir confianza. Una fachada puede hacer que un negocio destaque. Un espacio puede sentirse completamente diferente cuando cada elemento está pensado para trabajar en conjunto.
                </p>

                <p>
                    En FORM & HALO tomamos esa idea y la desarrollamos contigo, cuidando el diseño, los materiales y cada detalle necesario para convertirla en una solución que realmente represente lo que quieres crear.
                </p>
            </div>
        </div>
    `;

    gallery.after(galleryBridge);

    /* =========================================
       CTA — ESCALA VISUAL
       ========================================= */

    Object.assign(galleryBridge.style, {
        display: "block",
        marginTop: "70px",
        paddingTop: "45px",
        paddingBottom: "20px",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
    });

    const ctaContent = galleryBridge.querySelector(".gallery-cta-content");
    const ctaEyebrow = galleryBridge.querySelector(".gallery-cta-eyebrow");
    const ctaTitle = galleryBridge.querySelector("h2");
    const ctaCopy = galleryBridge.querySelector(".gallery-cta-copy");
    const ctaParagraphs = galleryBridge.querySelectorAll(".gallery-cta-copy p");

    Object.assign(ctaContent.style, { maxWidth: "850px" });

    Object.assign(ctaEyebrow.style, {
        display: "block",
        marginBottom: "18px",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.22em",
        color: "var(--color-gray)"
    });

    Object.assign(ctaTitle.style, {
        margin: "0 0 28px 0",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "clamp(26px, 3vw, 42px)",
        lineHeight: "1.08",
        letterSpacing: "normal",
        fontWeight: "500",
        maxWidth: "760px"
    });

    Object.assign(ctaCopy.style, { maxWidth: "720px" });

    ctaParagraphs.forEach((paragraph) => {
        Object.assign(paragraph.style, {
            margin: "0 0 15px 0",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "13px",
            lineHeight: "1.7",
            color: "var(--color-gray)"
        });
    });

    /* =========================================
       PROYECTOS
       ========================================= */

    const projectNames = [
        "Metal Frontlit Sign",
        "Metal Sign",
        "Acrylic LED Sign",
        "Light Box",
        "Metal Blacklit Sign",
        "Metal Double Sided Sign",
        "Neon LED Sign"
    ];

    const originalSlides = Array.from(track.querySelectorAll(".gallery-slide"));

    if (originalSlides.length !== projectNames.length) return;

    /* =========================================
       BOTÓN ACTIVO SOBRE CADA IMAGEN
       ========================================= */

    originalSlides.forEach((slide, index) => {

        slide.style.position = "relative";

        const button = document.createElement("a");
        button.className = "gallery-project-button";
        button.href = "html/formulario.html";
        button.target = "_blank";
        button.rel = "noopener";
        button.textContent = projectNames[index];

        Object.assign(button.style, {
            position: "absolute",
            left: "50%",
            bottom: "24px",
            transform: "translateX(-50%)",
            zIndex: "5",
            paddingBottom: "7px",
            borderBottom: "1px solid rgba(241, 238, 231, 0.9)",
            color: "var(--color-white)",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
            transition: "opacity 0.25s ease, border-color 0.25s ease"
        });

        button.addEventListener("mouseenter", () => {
            button.style.opacity = "0.75";
            button.style.borderColor = "var(--color-bronze)";
        });

        button.addEventListener("mouseleave", () => {
            button.style.opacity = "1";
            button.style.borderColor = "rgba(241, 238, 231, 0.9)";
        });

        slide.appendChild(button);

    });

    /* =========================================
       RESPONSIVE — PRESENTACIÓN HORIZONTAL
       ========================================= */

    function adaptGallerySize() {

        if (window.innerWidth <= 768) {

            gallery.style.width = "100%";
            gallery.style.height = "auto";
            gallery.style.aspectRatio = "16 / 9";

            galleryCtaGroup.style.left = "16px";
            galleryCtaGroup.style.bottom = "16px";
            galleryCtaGroup.style.width = "40%";
            galleryCtaGroup.style.maxWidth = "40%";

            galleryCta.style.width = "100%";
            galleryCta.style.padding = "14px 20px";
            galleryCta.style.fontSize = "19.5px";

            galleryBridge.style.marginTop = "40px";
            galleryBridge.style.paddingTop = "32px";

            ctaTitle.style.fontSize = "26px";
            ctaTitle.style.marginBottom = "22px";

            ctaParagraphs.forEach((paragraph) => {
                paragraph.style.fontSize = "12px";
                paragraph.style.lineHeight = "1.65";
            });

            ctaRows.querySelectorAll("span").forEach((row) => {
                row.style.fontSize = "13.5px";
                row.style.marginTop = "8px";
            });

            if (headerLogo) headerLogo.style.fontSize = "15px";
            if (headerNav) headerNav.style.minHeight = "80px";

            document.querySelectorAll(".gallery-project-button").forEach((button) => {
                button.style.bottom = "16px";
                button.style.fontSize = "10px";
                button.style.letterSpacing = "0.1em";
            });

        } else {

            gallery.style.width = "100%";
            gallery.style.height = "500px";
            gallery.style.aspectRatio = "auto";

            galleryCtaGroup.style.left = "24px";
            galleryCtaGroup.style.bottom = "24px";
            galleryCtaGroup.style.width = "40%";
            galleryCtaGroup.style.maxWidth = "40%";

            galleryCta.style.width = "100%";
            galleryCta.style.padding = "16px 23px";
            galleryCta.style.fontSize = "23.4px";

            galleryBridge.style.marginTop = "70px";
            galleryBridge.style.paddingTop = "45px";

            ctaTitle.style.fontSize = "clamp(26px, 3vw, 42px)";
            ctaTitle.style.marginBottom = "28px";

            ctaParagraphs.forEach((paragraph) => {
                paragraph.style.fontSize = "13px";
                paragraph.style.lineHeight = "1.7";
            });

            ctaRows.querySelectorAll("span").forEach((row) => {
                row.style.fontSize = "15px";
                row.style.marginTop = "10px";
            });

            if (headerLogo) headerLogo.style.fontSize = "18px";
            if (headerNav) headerNav.style.minHeight = "80px";

            document.querySelectorAll(".gallery-project-button").forEach((button) => {
                button.style.bottom = "24px";
                button.style.fontSize = "12px";
                button.style.letterSpacing = "0.14em";
            });

        }

    }

    adaptGallerySize();
    window.addEventListener("resize", adaptGallerySize);

    /* =========================================
       CINTA INFINITA
       ========================================= */

    const firstClone = originalSlides[0].cloneNode(true);
    const clonedButton = firstClone.querySelector(".gallery-project-button");

    if (clonedButton) {
        clonedButton.href = "html/formulario.html";
        clonedButton.target = "_blank";
        clonedButton.rel = "noopener";
    }

    track.appendChild(firstClone);

    let currentSlide = 0;
    const totalSlides = originalSlides.length;
    const visibleTime = 2000;
    const transitionTime = 1500;
    const intervalTime = visibleTime + transitionTime;

    track.style.transition =
        `transform ${transitionTime}ms cubic-bezier(0.65, 0, 0.35, 1)`;

    function showNextSlide() {
        currentSlide++;

        track.style.transform =
            `translateX(-${currentSlide * 100}%)`;

        if (currentSlide === totalSlides) {
            setTimeout(() => {
                track.style.transition = "none";
                currentSlide = 0;
                track.style.transform = "translateX(0)";
                track.offsetHeight;

                track.style.transition =
                    `transform ${transitionTime}ms cubic-bezier(0.65, 0, 0.35, 1)`;
            }, transitionTime);
        }
    }

    setInterval(showNextSlide, intervalTime);

});
