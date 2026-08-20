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

            <a
                href="html/formulario.html"
                target="_blank"
                rel="noopener"
                class="hero-button"
            >
                HABLEMOS DE TU PROYECTO →
            </a>
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
    const ctaButton = galleryBridge.querySelector(".hero-button");

    Object.assign(ctaContent.style, {
        maxWidth: "850px"
    });

    Object.assign(ctaEyebrow.style, {
        display: "block",
        marginBottom: "18px",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.22em",
        color: "var(--color-gray)"
    });

    Object.assign(ctaTitle.style, {
        margin: "0 0 28px 0",
        fontSize: "clamp(26px, 3vw, 42px)",
        lineHeight: "1.08",
        letterSpacing: "-0.025em",
        fontWeight: "500",
        maxWidth: "760px"
    });

    Object.assign(ctaCopy.style, {
        maxWidth: "720px"
    });

    ctaParagraphs.forEach((paragraph) => {
        Object.assign(paragraph.style, {
            margin: "0 0 15px 0",
            fontSize: "13px",
            lineHeight: "1.7",
            color: "var(--color-gray)"
        });
    });

    Object.assign(ctaButton.style, {
        display: "inline-block",
        marginTop: "20px",
        padding: "13px 20px",
        fontSize: "11px",
        letterSpacing: "0.08em"
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

    const originalSlides = Array.from(
        track.querySelectorAll(".gallery-slide")
    );

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

            galleryBridge.style.marginTop = "40px";
            galleryBridge.style.paddingTop = "32px";

            ctaTitle.style.fontSize = "26px";
            ctaTitle.style.marginBottom = "22px";

            ctaParagraphs.forEach((paragraph) => {
                paragraph.style.fontSize = "12px";
                paragraph.style.lineHeight = "1.65";
            });

            ctaButton.style.fontSize = "10px";
            ctaButton.style.padding = "12px 16px";

            document
                .querySelectorAll(".gallery-project-button")
                .forEach((button) => {
                    button.style.bottom = "16px";
                    button.style.fontSize = "10px";
                    button.style.letterSpacing = "0.1em";
                });

        } else {

            gallery.style.width = "100%";
            gallery.style.height = "500px";
            gallery.style.aspectRatio = "auto";

            galleryBridge.style.marginTop = "70px";
            galleryBridge.style.paddingTop = "45px";

            ctaTitle.style.fontSize = "clamp(26px, 3vw, 42px)";
            ctaTitle.style.marginBottom = "28px";

            ctaParagraphs.forEach((paragraph) => {
                paragraph.style.fontSize = "13px";
                paragraph.style.lineHeight = "1.7";
            });

            ctaButton.style.fontSize = "11px";
            ctaButton.style.padding = "13px 20px";

            document
                .querySelectorAll(".gallery-project-button")
                .forEach((button) => {
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

       1 → 2 → 3 → 4 → 5 → 6 → 7 → 1...
       ========================================= */

    const firstClone = originalSlides[0].cloneNode(true);

    const clonedButton = firstClone.querySelector(
        ".gallery-project-button"
    );

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
