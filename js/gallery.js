/* =========================================
   FORM & HALO — PROJECT GALLERY
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const gallery = document.querySelector(".project-gallery");
    const track = document.querySelector(".gallery-track");

    if (!gallery || !track) return;


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

       El 1 clonado entra desde la derecha.
       Cuando termina su transición, volvemos
       silenciosamente al 1 original.
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

                /* Fuerza el reflow antes de reactivar la transición. */
                track.offsetHeight;

                track.style.transition =
                    `transform ${transitionTime}ms cubic-bezier(0.65, 0, 0.35, 1)`;

            }, transitionTime);

        }

    }


    /*
     * 2 segundos visible
     * + 1.5 segundos de desplazamiento
     * = 3.5 segundos por proyecto.
     */

    setInterval(showNextSlide, intervalTime);

});
