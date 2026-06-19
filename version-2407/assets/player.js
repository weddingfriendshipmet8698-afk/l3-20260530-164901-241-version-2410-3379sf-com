import { H as Hls } from './hls-dru42stk.js';

(function () {
  var video = document.querySelector('[data-stream]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-button]');
  if (!video) {
    return;
  }

  var streamUrl = video.getAttribute('data-stream');
  var ready = false;
  var player = null;

  var attachStream = function () {
    if (ready || !streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }
    if (Hls && Hls.isSupported()) {
      player = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      player.loadSource(streamUrl);
      player.attachMedia(video);
      ready = true;
      return;
    }
    video.src = streamUrl;
    ready = true;
  };

  var start = function () {
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener('click', start);
  }
  if (button) {
    button.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });
  window.addEventListener('pagehide', function () {
    if (player && typeof player.destroy === 'function') {
      player.destroy();
    }
  });
})();
