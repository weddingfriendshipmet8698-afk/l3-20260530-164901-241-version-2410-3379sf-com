(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5000);
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  if (searchForm && searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      searchInput.value = initial;
    }

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var filterCards = function () {
      var keyword = normalize(searchInput.value);
      var typeValue = typeSelect ? normalize(typeSelect.value) : '';
      var yearValue = yearSelect ? normalize(yearSelect.value) : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = !typeValue || normalize(card.dataset.type) === typeValue;
        var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
        card.classList.toggle('is-filtered-out', !(matchKeyword && matchType && matchYear));
      });
    };

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });
    searchInput.addEventListener('input', filterCards);
    if (typeSelect) {
      typeSelect.addEventListener('change', filterCards);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }
    filterCards();
  }
})();
