(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');
  var headerSearch = document.querySelector('.header-search');

  if (navToggle && mainNav && headerSearch) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
      headerSearch.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  var scrollRow = document.querySelector('[data-scroll-row]');
  var leftButton = document.querySelector('[data-scroll-left]');
  var rightButton = document.querySelector('[data-scroll-right]');

  if (scrollRow && leftButton && rightButton) {
    leftButton.addEventListener('click', function () {
      scrollRow.scrollBy({ left: -420, behavior: 'smooth' });
    });
    rightButton.addEventListener('click', function () {
      scrollRow.scrollBy({ left: 420, behavior: 'smooth' });
    });
  }

  var results = document.querySelector('[data-search-results]');
  if (results && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.querySelector('.page-search-form input[name="q"]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');

    if (input) {
      input.value = keyword;
    }

    var unique = function (field) {
      return Array.from(new Set(window.MOVIE_SEARCH_DATA.map(function (item) {
        return String(item[field] || '');
      }).filter(Boolean))).sort(function (a, b) {
        return b.localeCompare(a, 'zh-Hans-CN');
      });
    };

    var fillSelect = function (select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    fillSelect(regionSelect, unique('region'));
    fillSelect(typeSelect, unique('type'));
    fillSelect(yearSelect, unique('year'));

    var createCard = function (item) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a class="poster-wrap" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy" onerror="this.style.display=\'none\'">',
        '<span class="year-badge">' + item.year + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-row"><a href="' + item.categoryUrl + '">' + item.category + '</a><span>' + item.region + '</span><span>' + item.type + '</span></div>',
        '<h2><a href="' + item.url + '">' + item.title + '</a></h2>',
        '<p>' + item.oneLine + '</p>',
        '<div class="tag-row"><span>' + item.genre + '</span></div>',
        '</div>'
      ].join('');
      return article;
    };

    var render = function () {
      var q = (input ? input.value : keyword).trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      var filtered = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.category, item.oneLine].join(' ').toLowerCase();
        return (!q || haystack.indexOf(q) >= 0) &&
          (!region || item.region === region) &&
          (!type || item.type === type) &&
          (!year || String(item.year) === year);
      }).slice(0, 120);

      results.innerHTML = '';
      filtered.forEach(function (item) {
        results.appendChild(createCard(item));
      });
    };

    [input, regionSelect, typeSelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', render);
        node.addEventListener('change', render);
      }
    });

    render();
  }
})();
