const BUBBLE_VIDEO = "SourceHop-Notes/assets/SourceHop-Images/ModelsJourney/TrafkBubbleNEWEST-animation30.webm";

function makeBubbleVideo() {
    const v = document.createElement('video');
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.className = 'nav-bubble-video';
    const s = document.createElement('source');
    s.src = BUBBLE_VIDEO;
    s.type = 'video/webm';
    v.appendChild(s);
    return v;
}

function injectNavVideos(root = document) {
    root.querySelectorAll('.nav').forEach(el => {
        if (!el.querySelector('video.nav-bubble-video')) {
            el.insertBefore(makeBubbleVideo(), el.firstChild);
        }
    });
}

function injectSectionVideos(root = document) {
    root.querySelectorAll('section').forEach(el => {
        if (!el.querySelector('video.bubble-video-left')) {
            const left = makeBubbleVideo();
            left.className = 'bubble-video-left';
            const right = makeBubbleVideo();
            right.className = 'bubble-video-right';
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
