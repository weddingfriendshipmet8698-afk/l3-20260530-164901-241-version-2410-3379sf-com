(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeText(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        }
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var progress = qs('[data-hero-progress]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
      if (progress) {
        progress.style.width = ((current + 1) / slides.length * 100) + '%';
      }
    }

    function next() {
      show(current + 1);
    }

    function start() {
      timer = window.setInterval(next, 5000);
    }

    function reset() {
      window.clearInterval(timer);
      start();
    }

    var prev = qs('[data-hero-prev]', hero);
    var nextButton = qs('[data-hero-next]', hero);
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        reset();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        reset();
      });
    });
    show(0);
    start();
  }

  function initTabs() {
    var root = qs('[data-tabs]');
    if (!root) {
      return;
    }
    qsa('[data-tab-target]', root).forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.getAttribute('data-tab-target');
        qsa('[data-tab-target]', root).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        qsa('[data-tab-panel]').forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-tab-panel') === target);
        });
      });
    });
  }

  function initFilters() {
    qsa('[data-list-filter]').forEach(function (input) {
      var list = qs('[data-filter-list]');
      if (!list) {
        return;
      }
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        qsa('[data-search]', list).forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
        });
      });
    });
  }

  function cardTemplate(item) {
    return '<a class="movie-card" href="' + escapeText(item.url) + '" data-search="' + escapeText(item.search) + '">' +
      '<span class="poster">' +
      '<img src="' + escapeText(item.image) + '" alt="' + escapeText(item.title) + '" loading="lazy">' +
      '<span class="card-year">' + escapeText(item.year) + '</span>' +
      '<span class="play-badge">▶</span>' +
      '</span>' +
      '<span class="card-body">' +
      '<strong>' + escapeText(item.title) + '</strong>' +
      '<span class="line-clamp">' + escapeText(item.oneLine) + '</span>' +
      '<span class="meta-row"><em>' + escapeText(item.region) + '</em><em>' + escapeText(item.type) + '</em></span>' +
      '</span>' +
      '</a>';
  }

  function initSearchPage() {
    var results = qs('[data-search-results]');
    if (!results || typeof MOVIE_INDEX === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    qsa('input[name="q"]').forEach(function (input) {
      input.value = query;
    });
    if (!query) {
      return;
    }
    var lowered = query.toLowerCase();
    var matched = MOVIE_INDEX.filter(function (item) {
      return item.search.toLowerCase().indexOf(lowered) !== -1;
    });
    var title = qs('[data-search-title]');
    var subtitle = qs('[data-search-subtitle]');
    if (title) {
      title.textContent = '搜索结果';
    }
    if (subtitle) {
      subtitle.textContent = '关键词：' + query;
    }
    results.innerHTML = matched.length ? matched.map(cardTemplate).join('') : '<div class="detail-panel"><h2>没有找到匹配影片</h2><p>换个关键词试试，或进入分类页继续浏览。</p></div>';
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function attachStream(player, video, source, done) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      done();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      done();
      return;
    }
    video.src = source;
    done();
  }

  function initPlayer() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var source = player.getAttribute('data-stream');
      if (!video || !button || !source) {
        return;
      }

      function startPlayback() {
        function playNow() {
          player.classList.add('is-playing');
          video.controls = true;
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        }

        if (player.getAttribute('data-ready') === '1') {
          playNow();
          return;
        }

        loadHlsLibrary(function () {
          attachStream(player, video, source, function () {
            player.setAttribute('data-ready', '1');
            playNow();
          });
        });
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (player.getAttribute('data-ready') !== '1') {
          startPlayback();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initTabs();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
