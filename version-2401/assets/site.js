(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('.hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var gridSelector = panel.getAttribute('data-target');
    var grid = document.querySelector(gridSelector);
    if (!grid) {
      return;
    }

    var fields = Array.prototype.slice.call(panel.querySelectorAll('input, select'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = '';
      var type = '';
      var year = '';
      var region = '';

      fields.forEach(function (field) {
        var role = field.getAttribute('data-filter');
        var value = (field.value || '').trim().toLowerCase();
        if (role === 'keyword') {
          keyword = value;
        }
        if (role === 'type') {
          type = value;
        }
        if (role === 'year') {
          year = value;
        }
        if (role === 'region') {
          region = value;
        }
      });

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var visible = true;

        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (type && cardType !== type) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }
        if (region && cardRegion !== region) {
          visible = false;
        }

        card.style.display = visible ? '' : 'none';
      });
    }

    fields.forEach(function (field) {
      field.addEventListener('input', applyFilter);
      field.addEventListener('change', applyFilter);
    });
  });

  var searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var label = document.querySelector('[data-search-label]');
    var input = document.querySelector('.search-page-input');

    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var results = window.SITE_MOVIES.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      return movie.text.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 160);

    if (label) {
      label.textContent = query ? '搜索：' + query : '精选片库';
    }

    if (!results.length) {
      searchRoot.innerHTML = '<div class="empty-state"><p>没有找到匹配内容</p><a class="empty-link" href="./categories.html">浏览分类</a></div>';
      return;
    }

    searchRoot.innerHTML = results.map(function (movie) {
      return '<a class="movie-card" href="./' + movie.file + '" data-filter-text="' + escapeHtml(movie.text) + '">' +
        '<span class="poster"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><em class="badge">' + escapeHtml(movie.category) + '</em><i class="duration">' + escapeHtml(movie.duration) + '</i><span class="play-dot">▶</span></span>' +
        '<span class="card-body"><strong>' + escapeHtml(movie.title) + '</strong><small>' + escapeHtml(movie.meta) + '</small><span class="desc">' + escapeHtml(movie.desc) + '</span><span class="meta-row"><b>' + escapeHtml(movie.rating) + '</b><span>' + movie.heat + ' 热度</span></span></span>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
