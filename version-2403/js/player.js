document.addEventListener('DOMContentLoaded', function () {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-cover]');
    var play = shell.querySelector('[data-play]');
    var stream = shell.getAttribute('data-stream');
    var ready = false;

    function bindStream() {
        if (ready || !video || !stream) {
            return;
        }
        ready = true;

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }
    }

    function startPlayer() {
        bindStream();
        shell.classList.add('playing');
        if (video) {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }
    }

    if (play) {
        play.addEventListener('click', startPlayer);
    }
    if (cover) {
        cover.addEventListener('click', startPlayer);
    }
    if (video) {
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
    }
});
