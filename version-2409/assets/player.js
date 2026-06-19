(function () {
    window.initMoviePlayer = function (source, videoId) {
        var video = document.getElementById(videoId);
        var overlay = document.querySelector('[data-player-toggle="' + videoId + '"]');
        var hls = null;
        var attached = false;
        if (!video) {
            return;
        }
        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }
        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            attachSource();
            hideOverlay();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('play', hideOverlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
})();
