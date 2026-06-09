const BUBBLE_VIDEO         = "SourceHop-Notes/assets/SourceHop-Images/ModelsJourney/TrafkBubbleNEWEST-animation60.webm";
const BUBBLE_VIDEO_LIGHTER = "SourceHop-Notes/assets/SourceHop-Images/ModelsJourney/TrafkBubbleLighterNEWEST-animation60.webm";

// ─── Versteckte Master-Videos (werden nur einmal dekodiert) ──────────────────

const _masterNormal = document.createElement('video');
_masterNormal.src       = BUBBLE_VIDEO;
_masterNormal.autoplay  = true;
_masterNormal.loop      = true;
_masterNormal.muted     = true;
_masterNormal.playsInline = true;
_masterNormal.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px';
document.body.appendChild(_masterNormal);

const _masterHover = document.createElement('video');
_masterHover.src        = BUBBLE_VIDEO_LIGHTER;
_masterHover.autoplay   = true;
_masterHover.loop       = true;
_masterHover.muted      = true;
_masterHover.playsInline = true;
_masterHover.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px';
document.body.appendChild(_masterHover);

// ─── Canvas-Registry ─────────────────────────────────────────────────────────
// Jeder Eintrag: { canvas, ctx, useHover }
// useHover: false = normales Video, true = Hover-Video

const _canvases = [];

function _drawLoop() {
    const normalReady = _masterNormal.readyState >= 2;
    const hoverReady  = _masterHover.readyState  >= 2;

    for (const entry of _canvases) {
        const src = entry.useHover ? _masterHover : _masterNormal;
        const ready = entry.useHover ? hoverReady : normalReady;
        if (!ready) continue;

        // Nur zeichnen wenn Canvas noch im DOM ist
        if (!entry.canvas.isConnected) continue;

        const { ctx, canvas } = entry;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(_drawLoop);
}
_drawLoop();

// ─── Hilfsfunktion: Canvas erstellen ─────────────────────────────────────────

function makeBubbleCanvas(className = 'nav-bubble-video', size = 80) {
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    canvas.className = className;
    const ctx = canvas.getContext('2d');
    const entry = { canvas, ctx, useHover: false };
    _canvases.push(entry);
    return { canvas, entry };
}

// Rückwärtskompatibilität: makeBubbleVideo gibt jetzt einen Canvas zurück
// (damit nav.js, das makeBubbleVideo() aufruft, weiter funktioniert)
function makeBubbleVideo(src = BUBBLE_VIDEO, className = 'nav-bubble-video') {
    const isHover = (src === BUBBLE_VIDEO_LIGHTER);
    const { canvas, entry } = makeBubbleCanvas(className, 80);
    if (isHover) entry.useHover = true;
    return canvas;
}

// ─── Nav-Bubbles ──────────────────────────────────────────────────────────────

function injectNavVideos(root = document) {
    root.querySelectorAll('.nav').forEach(el => {
        // Schon initialisiert?
        if (el._bubbleInited) return;
        el._bubbleInited = true;

        const { canvas: defCanvas, entry: defEntry } = makeBubbleCanvas('nav-bubble-video', 80);
        const { canvas: hovCanvas, entry: hovEntry } = makeBubbleCanvas('nav-bubble-video-hover', 80);
        hovEntry.useHover = true;
        hovCanvas.style.display = 'none';

        el.insertBefore(hovCanvas, el.firstChild);
        el.insertBefore(defCanvas, el.firstChild);

        el.addEventListener('mouseenter', () => {
            defCanvas.style.display = 'none';
            hovCanvas.style.display = '';
        });
        el.addEventListener('mouseleave', () => {
            defCanvas.style.display = '';
            hovCanvas.style.display = 'none';
        });
    });
}

// ─── Section-Deko ─────────────────────────────────────────────────────────────

function injectSectionVideos(root = document) {
    root.querySelectorAll('section').forEach(el => {
        if (el.querySelector('canvas.bubble-video-left')) return;

        const { canvas: left }  = makeBubbleCanvas('bubble-video-left',  320);
        const { canvas: right } = makeBubbleCanvas('bubble-video-right', 320);

        el.insertBefore(right, el.firstChild);
        el.insertBefore(left,  el.firstChild);
    });
}

// ─── Komponenten laden ────────────────────────────────────────────────────────

function loadComponent(elementId, filePath, callback) {
    fetch(filePath)
    .then(response => {
        if (!response.ok) throw new Error('Komponente nicht gefunden');
        return response.text();
    })
    .then(data => {
        document.getElementById(elementId).innerHTML = data;
        injectNavVideos(document.getElementById(elementId));
        if (callback) callback();
    })
    .catch(error => console.error('Fehler beim Laden von ' + filePath, error));
}

loadComponent('header-placeholder', 'files/header.html', () => {
    if (typeof initNav === 'function') {
        initNav();
    }
});

loadComponent('footer-placeholder', 'files/footer.html');

document.addEventListener('DOMContentLoaded', () => {
    injectSectionVideos();
});

/*Made with AI*/
