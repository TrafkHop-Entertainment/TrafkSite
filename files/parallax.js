/*
 * Einfacher, deterministischer Parallax-Effekt fuer #parallax-bg.
 * Bewegt das Hintergrundbild beim Scrollen langsamer als den Content
 * (Faktor < 1 = langsamer). Kein animation-timeline, kein position:fixed-
 * Konflikt - nur ein transform: translateY() pro Frame, an scrollY gekoppelt.
 */
(function () {
    const SPEED = -0.035; // 0 = Bild steht fest, 1 = scrollt genauso schnell wie der Content

    const bg = document.getElementById('parallax-bg');
    if (!bg) return;

    let ticking = false;

    function update() {
        const offset = window.scrollY * SPEED;
        bg.style.transform = `translateY(${offset}px)`;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
})();
