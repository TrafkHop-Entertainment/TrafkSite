const BUBBLE_VIDEO         = "SourceHop-Notes/assets/SourceHop-Images/ModelsJourney/TrafkBubbleNEWEST-animation60.webm";
const BUBBLE_VIDEO_LIGHTER = "SourceHop-Notes/assets/SourceHop-Images/ModelsJourney/TrafkBubbleLighterNEWEST-animation60.webm";

// ─── Versteckte Master-Videos (nur 1× dekodiert) ─────────────────────────────

function _makeMaster(src) {
    const v = document.createElement('video');
    v.src        = src;
    v.autoplay   = true;
    v.loop       = true;
    v.muted      = true;
    v.playsInline = true;
    v.preload    = 'auto';
    v.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;left:-9999px';
    document.body.appendChild(v);
    // Sicherheits-Play für Firefox
    v.play().catch(() => {
        document.addEventListener('click', () => v.play(), { once: true });
    });
    return v;
}

const _masterNormal = _makeMaster(BUBBLE_VIDEO);
const _masterHover  = _makeMaster(BUBBLE_VIDEO_LIGHTER);

// ─── Canvas-Registry ─────────────────────────────────────────────────────────
// entry: { canvas, ctx, useHover: bool }

const _canvases = [];

// Nur alle 2 Frames zeichnen (spart ~50% GPU auf Firefox)
let _frameCount = 0;

function _drawLoop() {
    requestAnimationFrame(_drawLoop);

    // Tab nicht sichtbar → nichts tun
    if (document.hidden) return;

    _frameCount++;
    // Jeden 2. Frame überspringen (30fps statt 60fps – für nav-bubbles völlig ausreichend)
    if (_frameCount % 2 !== 0) return;

    const normalReady = _masterNormal.readyState >= 2;
    const hoverReady  = _masterHover.readyState  >= 2;

    for (const entry of _canvases) {
        if (!entry.canvas.isConnected) continue;
        const src   = entry.useHover ? _masterHover : _masterNormal;
        const ready = entry.useHover ? hoverReady   : normalReady;
        if (!ready) continue;
        entry.ctx.drawImage(src, 0, 0, entry.canvas.width, entry.canvas.height);
    }
}
_drawLoop();

// ─── Canvas erstellen ─────────────────────────────────────────────────────────

function _makeCanvas(className, w, h, isHover) {
    const canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    canvas.className = className;
    // Muss absolut positioniert sein wie früher die <video>-Tags
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
    const ctx   = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    const entry = { canvas, ctx, useHover: !!isHover };
    _canvases.push(entry);
    return { canvas, entry };
}

// Rückwärtskompatibilität: nav.js ruft makeBubbleVideo() auf
function makeBubbleVideo(src = BUBBLE_VIDEO, className = 'nav-bubble-video') {
    const isHover = (src === BUBBLE_VIDEO_LIGHTER);
    const { canvas } = _makeCanvas(className, 80, 80, isHover);
    return canvas;
}

// ─── Nav-Bubbles ──────────────────────────────────────────────────────────────

function injectNavVideos(root = document) {
    root.querySelectorAll('.nav').forEach(el => {
        if (el._bubbleInited) return;
        el._bubbleInited = true;

        const { canvas: defCanvas, entry: defEntry } = _makeCanvas('nav-bubble-video', 80, 80, false);
        const { canvas: hovCanvas, entry: hovEntry } = _makeCanvas('nav-bubble-video-hover', 80, 80, true);
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

        // Section-Canvas braucht andere Positionierung als nav-Canvas
        function makeSectionCanvas(cls) {
            const canvas = document.createElement('canvas');
            canvas.width  = 320;
            canvas.height = 320;
            canvas.className = cls;
            // Position kommt aus standard.css (.bubble-video-left / -right)
            canvas.style.cssText = 'pointer-events:none;z-index:-1';
            const ctx   = canvas.getContext('2d', { alpha: true });
            _canvases.push({ canvas, ctx, useHover: false });
            return canvas;
        }

        const left  = makeSectionCanvas('bubble-video-left');
        const right = makeSectionCanvas('bubble-video-right');
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
