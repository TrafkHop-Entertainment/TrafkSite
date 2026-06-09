const BUBBLE_VIDEO        = "SourceHop-Notes/assets/SourceHop-Images/ModelsJourney/TrafkBubbleNEWEST-animation60.webm";
const BUBBLE_VIDEO_LIGHTER = "SourceHop-Notes/assets/SourceHop-Images/ModelsJourney/TrafkBubbleLighterNEWEST-animation60.webm";

function makeBubbleVideo(src = BUBBLE_VIDEO, className = 'nav-bubble-video') {
    const v = document.createElement('video');
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.className = className;
    const s = document.createElement('source');
    s.src = src;
    s.type = 'video/webm';
    v.appendChild(s);
    return v;
}

function injectNavVideos(root = document) {
    root.querySelectorAll('.nav').forEach(el => {
        if (!el.querySelector('video.nav-bubble-video')) {
            el.insertBefore(makeBubbleVideo(), el.firstChild);
        }
        if (!el.querySelector('video.nav-bubble-video-hover')) {
            const hoverVid = makeBubbleVideo(BUBBLE_VIDEO_LIGHTER, 'nav-bubble-video-hover');
            hoverVid.style.display = 'none';
            el.insertBefore(hoverVid, el.firstChild);
        }
        el.addEventListener('mouseenter', () => {
            const def   = el.querySelector('video.nav-bubble-video');
            const hover = el.querySelector('video.nav-bubble-video-hover');
            if (def)   def.style.display   = 'none';
            if (hover) hover.style.display = '';
        });
        el.addEventListener('mouseleave', () => {
            const def   = el.querySelector('video.nav-bubble-video');
            const hover = el.querySelector('video.nav-bubble-video-hover');
            if (def)   def.style.display   = '';
            if (hover) hover.style.display = 'none';
        });
    });
}

function injectSectionVideos(root = document) {
    root.querySelectorAll('section').forEach(el => {
        if (!el.querySelector('video.bubble-video-left')) {
            const left = makeBubbleVideo(BUBBLE_VIDEO, 'bubble-video-left');
            const right = makeBubbleVideo(BUBBLE_VIDEO, 'bubble-video-right');
            el.insertBefore(right, el.firstChild);
            el.insertBefore(left, el.firstChild);
        }
    });
}

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

// Für sections im statischen HTML (z.B. index.html)
document.addEventListener('DOMContentLoaded', () => {
    injectSectionVideos();
});

/*Made with AI*/
