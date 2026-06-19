(function () {
  function bootPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var source = player.getAttribute('data-video-src') || (video && video.getAttribute('data-src'));
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        player._hls = hls;
      } else {
        video.src = source;
      }

      attached = true;
    }

    function start() {
      attach();
      video.controls = true;
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });
  }

  document.querySelectorAll('.player-shell').forEach(bootPlayer);
})();
