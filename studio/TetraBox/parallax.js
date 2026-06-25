/*
 * Spezielle Parallax-Variante für die Tetrabox-Seite.
 *
 * Tetrabox hat kein einzelnes "cover"-Hintergrundbild wie der Rest der Seite,
 * sondern eine vertikal kachelnde Textur (background-repeat: repeat-y, siehe
 * tetrabox.css).
 *
 * WICHTIG: Hier wird (anders als in files/parallax.js) background-position
 * animiert statt transform: translateY auf die ganze #parallax-bg-Box.
 * #parallax-bg ist fixed und exakt 100vh hoch - bei einem transform auf die
 * Box selbst wandert die komplette Box irgendwann (sobald scrollY * SPEED >
 * 100vh) aus dem Sichtbereich raus, und darunter kommt nur noch der schwarze
 * body-Hintergrund zum Vorschein. Bei einem einzelnen cover-Bild (Startseite)
 * fällt das nicht auf, weil das Bild großzügig über die Box hinausragt - bei
 * einer gekachelten Textur aber schon. background-position dagegen verschiebt
 * nur das Bild *innerhalb* der unverändert fixierten Box, und weil repeat-y
 * unendlich kachelt, kann dabei nie eine leere Stelle entstehen.
 */
(function () {
    const SPEED = -0.08; // stärker als die Standard-Variante (-0.035), da Textur statt Einzelbild

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