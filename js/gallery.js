/* =========================================
   FORM & HALO — PROJECT GALLERY
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const gallery = document.querySelector(".project-gallery");
    const track = document.querySelector(".gallery-track");

    if (!gallery || !track) return;

    const slides = track.querySelectorAll(".gallery-slide");

    if (slides.length < 2) return;

    let currentSlide = 0;


    /* =========================================
       TRANSICIÓN — EFECTO PÁGINA
       ========================================= */

    track.style.transition =
        "transform 1500ms cubic-bezier(0.65, 0, 0.35, 1)";


    /* =========================================
       CAMBIAR PROYECTO
       ========================================= */

    function showNextSlide() {

        currentSlide =
            (currentSlide + 1) % slides.length;

        track.style.transform =
            `translateX(-${currentSlide * 100}%)`;

    }


    /*
     * 2 segundos visible
     * + 1.5 segundos de transición
     * = 3.5 segundos por proyecto
     */

    setInterval(showNextSlide, 3500);

});
