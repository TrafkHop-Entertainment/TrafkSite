const BUBBLE_VIDEO         = "Projects/SourceHop/Images/TrafkSite/TrafkBubbleNEWEST-animation60.webm";
const BUBBLE_VIDEO_LIGHTER = "Projects/SourceHop/Images/TrafkSite/TrafkBubbleLighterNEWEST-animation60.webm";

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
// entry: { canvas, ctx, useHover: bool, visible: bool }
//
// visible wird vom _visibilityObserver (IntersectionObserver) gepflegt, nicht
// pro Frame per getBoundingClientRect berechnet - das wäre bei 100+ Canvas
// selbst teurer als das eigentliche Zeichnen.

const _canvases = [];

const _visibilityObserver = new IntersectionObserver((entries) => {
    for (const obsEntry of entries) {
        const reg = _canvases.find(e => e.canvas === obsEntry.target);
        if (reg) reg.visible = obsEntry.isIntersecting;
    }
}, {
    root: null,
    rootMargin: '200px 0px', // etwas Vorlauf, damit nichts beim Scrollen "aufpoppt"
    threshold: 0
});

function _drawLoop() {
    requestAnimationFrame(_drawLoop);

    // Tab nicht sichtbar → nichts tun
    if (document.hidden) return;

    const normalReady = _masterNormal.readyState >= 2;
    const hoverReady  = _masterHover.readyState  >= 2;

    let needsCleanup = false;

    for (const entry of _canvases) {
        if (!entry.canvas.isConnected) { needsCleanup = true; continue; }
        if (!entry.visible) continue;
        const src   = entry.useHover ? _masterHover : _masterNormal;
        const ready = entry.useHover ? hoverReady   : normalReady;
        if (!ready) continue;
        // Canvas hat alpha:true (transparenter Hintergrund). Ohne clearRect
        // zeichnet drawImage jeden Frame über den vorherigen - bei einem Video
        // mit teiltransparenten Pixeln akkumuliert sich das über die Zeit zu
        // einem immer dunkleren "Schatten", auch während das Canvas unsichtbar
        // (display:none) ist, weil _drawLoop trotzdem weiterzeichnet.
        entry.ctx.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
        entry.ctx.drawImage(src, 0, 0, entry.canvas.width, entry.canvas.height);
    }

    // Verwaiste Canvas (z.B. nach einem Re-Render) aus der Registry entfernen,
    // damit die Liste nicht unbegrenzt wächst.
    if (needsCleanup) {
        for (let i = _canvases.length - 1; i >= 0; i--) {
            if (!_canvases[i].canvas.isConnected) {
                _visibilityObserver.unobserve(_canvases[i].canvas);
                _canvases.splice(i, 1);
            }
        }
    }
}
_drawLoop();

// ─── Canvas erstellen ─────────────────────────────────────────────────────────
// w/h sind CSS-Pixel (Zielgröße der .nav-Bubble), die interne Canvas-Auflösung
// wird mit devicePixelRatio multipliziert, damit das Bild auf der tatsächlichen
// .nav-Größe (2.5rem/3rem etc.) scharf bleibt statt grob auf 80x80 gestreckt zu werden.

function _makeCanvas(className, w, h, isHover) {
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.className = className;
    // Muss absolut positioniert sein wie früher die <video>-Tags
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
    const ctx   = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    // visible startet als true, damit ein Canvas, das schon beim Erzeugen im
    // Viewport sitzt, sofort gezeichnet wird, bevor der Observer feuert.
    const entry = { canvas, ctx, useHover: !!isHover, visible: true };
    _canvases.push(entry);
    _visibilityObserver.observe(canvas);
    return { canvas, entry };
}

// Rückwärtskompatibilität: Nav.js ruft makeBubbleVideo() auf.
// Liefert jetzt (wie injectNavVideos) ein Paar aus normal + hover Canvas in
// einem Fragment, statt nur einem einzelnen Canvas - sonst gibt es bei
// dynamisch erzeugten Bubbles (Sitemap-Baum) nie ein Hover-Bild zum Anzeigen.
function makeBubbleVideo(w = 40, h = 40) {
    const frag = document.createDocumentFragment();

    const { canvas: defCanvas } = _makeCanvas('nav-bubble-video', w, h, false);
    const { canvas: hovCanvas } = _makeCanvas('nav-bubble-video-hover', w, h, true);
    hovCanvas.style.display = 'none';

    frag.appendChild(hovCanvas);
    frag.appendChild(defCanvas);

    return frag;
}

// ─── Nav-Bubbles ──────────────────────────────────────────────────────────────

function injectNavVideos(root = document) {
    root.querySelectorAll('.nav').forEach(el => {
        if (el._bubbleInited) return;
        el._bubbleInited = true;

        const { canvas: defCanvas } = _makeCanvas('nav-bubble-video', 40, 40, false);
        const { canvas: hovCanvas } = _makeCanvas('nav-bubble-video-hover', 40, 40, true);
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
        if (el.querySelector('canvas.TrafkSectionBubble')) return;

        // Section-Canvas braucht andere Positionierung als nav-Canvas
        function makeSectionCanvas(cls) {
            const canvas = document.createElement('canvas');
            canvas.width  = 320;
            canvas.height = 320;
            canvas.className = cls;
            // Position kommt aus Standard.css (.TrafkSectionBubble / -right)
            canvas.style.cssText = 'pointer-events:none;z-index:-1';
            const ctx   = canvas.getContext('2d', { alpha: true });
            _canvases.push({ canvas, ctx, useHover: false, visible: true });
            _visibilityObserver.observe(canvas);
            return canvas;
        }

        const left  = makeSectionCanvas('TrafkSectionBubble');

        if (el.offsetHeight > window.innerHeight * 0.35) {
            left.classList.add('taller-container');
        }
        if (el.offsetHeight > window.innerHeight * 0.2) {
            left.classList.add('tall-container');
        }

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

loadComponent('header-placeholder', 'Files/Header.html', () => {
    if (typeof initNav === 'function') {
        initNav();
    }
});

loadComponent('footer-placeholder', 'Files/Footer.html');

document.addEventListener('DOMContentLoaded', () => {
    injectSectionVideos();
});

/*Made with AI*/