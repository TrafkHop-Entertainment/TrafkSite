(function () {
    const SPEED = -0.08;

    const bg = document.getElementById('parallax-bg');
    if (!bg) return;

    let ticking = false;

    function update() {
        const offset = window.scrollY * SPEED;
        bg.style.backgroundPosition = `center ${offset}px`;
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