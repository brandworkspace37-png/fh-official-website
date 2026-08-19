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

    function showNextSlide() {

        currentSlide =
            (currentSlide + 1) % slides.length;

        track.style.transform =
            `translateX(-${currentSlide * 100}%)`;

    }

    setInterval(showNextSlide, 2000);

});
