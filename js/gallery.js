/* =========================================
   FORM & HALO — PROJECT GALLERY
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const hero = document.querySelector(".hero");
    const gallery = document.querySelector(".project-gallery");
    const track = document.querySelector(".gallery-track");

    if (!hero || !gallery || !track) return;

    hero.querySelector(".hero-intro")?.remove();
    hero.querySelector(".hero-question")?.remove();

    Object.assign(hero.style, {
        minHeight: "auto",
        display: "block",
        paddingTop: "0",
        paddingBottom: "0"
    });

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

    /* CTA PRINCIPAL — FIJO DENTRO DEL ÁLBUM */

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
        padding: "14px 14px 10px 14px",
        margin: "0 0 -10px -14px",
        borderRadius: "2px",
        background: "linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.42) 48%, rgba(0, 0, 0, 0) 100%)",
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
        width: "44%",
        padding: "16px 23px",
        border: "1px solid #F1EEE7",
        background: "#F1EEE7",
        color: "#111111",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "15.6px",
        fontWeight: "600",
        letterSpacing: "0.06em",
        textAlign: "center",
        whiteSpace: "nowrap",
        transition: "none"
    });

    const ctaRows = document.createElement("div");
    ctaRows.className = "gallery-cta-rows";
    ctaRows.style.width = "100%";

    const ctaRowTexts = [
        "Cuéntanos qué quieres crear y qué quieres transmitir con tu proyecto.",
        "Recibe una propuesta pensada para tu espacio, tu identidad y lo que quieres conseguir."
    ];

    ctaRowTexts.forEach((text) => {
        const row = document.createElement("span");
        row.textContent = text;

        Object.assign(row.style, {
            display: "block",
            width: "100%",
            marginTop: "6px",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "15px",
            fontWeight: "400",
            lineHeight: "1.2",
            letterSpacing: "normal",
            color: "var(--color-white)",
            textShadow: "0 2px 7px rgba(0, 0, 0, 0.85)"
        });

        ctaRows.appendChild(row);
    });

    galleryCtaGroup.appendChild(galleryCta);
    galleryCtaGroup.appendChild(ctaRows);
    gallery.appendChild(galleryCtaGroup);

    /* PUENTE DESPUÉS DE LA GALERÍA */

    const galleryBridge = document.createElement("div");
    galleryBridge.className = "hero-question";

    galleryBridge.innerHTML = `
        <div class="gallery-cta-content">
            <span class="gallery-cta-eyebrow">FORM & HALO</span>
            <h2>Hay ideas que cambian por completo la percepción de un espacio.</h2>
            <div class="gallery-cta-copy">
                <p>Una entrada puede transmitir confianza. Una fachada puede hacer que un negocio destaque. Un espacio puede sentirse completamente diferente cuando cada elemento está pensado para trabajar en conjunto.</p>
                <p>En FORM & HALO tomamos esa idea y la desarrollamos contigo, cuidando el diseño, los materiales y cada detalle necesario para convertirla en una solución que realmente represente lo que quieres crear.</p>
            </div>
        </div>
    `;

    gallery.after(galleryBridge);

    Object.assign(galleryBridge.style, {
        display: "block",
        marginTop: "70px",
        paddingTop: "45px",
        paddingBottom: "20px",
        borderTop: "none"
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

    /* GALERÍA — SIN NOMBRES NI ENLACES INDIVIDUALES */

    const originalSlides = Array.from(track.querySelectorAll(".gallery-slide"));

    if (originalSlides.length !== 7) return;

    originalSlides.forEach((slide) => {
        slide.style.position = "relative";
        slide.querySelectorAll(".gallery-project-button").forEach((button) => button.remove());
    });

    /* RESPONSIVE — GALERÍA 16:9 EN DESKTOP */

    function adaptGallerySize() {
        if (window.innerWidth <= 768) {
            /* Móvil: mantiene el ancho completo y una composición vertical */
            gallery.style.width = "calc(100% + 32px)";
            gallery.style.marginLeft = "-16px";
            gallery.style.marginRight = "0";
            gallery.style.height = "auto";
            gallery.style.aspectRatio = "3 / 4";
            gallery.style.overflow = "hidden";

            galleryCtaGroup.style.left = "16px";
            galleryCtaGroup.style.bottom = "16px";
            galleryCtaGroup.style.width = "65%";
            galleryCtaGroup.style.maxWidth = "65%";
            galleryCtaGroup.style.padding = "12px 12px 8px 12px";
            galleryCtaGroup.style.margin = "0 0 -8px -12px";

            galleryCta.style.width = "fit-content";
            galleryCta.style.maxWidth = "100%";
            galleryCta.style.boxSizing = "border-box";
            galleryCta.style.padding = "10px 16px";
            galleryCta.style.fontSize = "12px";
            galleryCta.style.textAlign = "center";
            galleryCta.style.alignSelf = "flex-start";

            galleryBridge.style.marginTop = "40px";
            galleryBridge.style.paddingTop = "32px";
            galleryBridge.style.borderTop = "none";

            ctaTitle.style.fontSize = "26px";
            ctaTitle.style.marginBottom = "22px";

            ctaParagraphs.forEach((paragraph) => {
                paragraph.style.fontSize = "12px";
                paragraph.style.lineHeight = "1.65";
            });

            ctaRows.querySelectorAll("span").forEach((row) => {
                row.style.fontSize = "12.5px";
                row.style.marginTop = "4px";
                row.style.lineHeight = "1.15";
            });

            if (headerLogo) headerLogo.style.fontSize = "15px";
            if (headerNav) headerNav.style.minHeight = "64px";
        } else {
            /* Desktop: proporción real 1920 × 1080 = 16:9 */
            gallery.style.width = "100%";
            gallery.style.marginLeft = "0";
            gallery.style.marginRight = "0";
            gallery.style.height = "auto";
            gallery.style.aspectRatio = "16 / 9";

            galleryCtaGroup.style.left = "24px";
            galleryCtaGroup.style.bottom = "24px";
            galleryCtaGroup.style.width = "40%";
            galleryCtaGroup.style.maxWidth = "40%";
            galleryCtaGroup.style.padding = "14px 14px 10px 14px";
            galleryCtaGroup.style.margin = "0 0 -10px -14px";

            galleryCta.style.width = "44%";
            galleryCta.style.padding = "16px 23px";
            galleryCta.style.fontSize = "15.6px";
            galleryCta.style.textAlign = "center";

            galleryBridge.style.marginTop = "70px";
            galleryBridge.style.paddingTop = "45px";
            galleryBridge.style.borderTop = "none";

            ctaTitle.style.fontSize = "clamp(26px, 3vw, 42px)";
            ctaTitle.style.marginBottom = "28px";

            ctaParagraphs.forEach((paragraph) => {
                paragraph.style.fontSize = "13px";
                paragraph.style.lineHeight = "1.7";
            });

            ctaRows.querySelectorAll("span").forEach((row) => {
                row.style.fontSize = "15px";
                row.style.marginTop = "6px";
                row.style.lineHeight = "1.2";
            });

            if (headerLogo) headerLogo.style.fontSize = "18px";
            if (headerNav) headerNav.style.minHeight = "64px";
        }
    }

    adaptGallerySize();
    window.addEventListener("resize", adaptGallerySize);

    /* CINTA INFINITA */

    const firstClone = originalSlides[0].cloneNode(true);
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
