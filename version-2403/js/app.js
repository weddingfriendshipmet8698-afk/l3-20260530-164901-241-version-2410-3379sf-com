document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            img.classList.add('is-missing');
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
        if (!slides.length) {
            return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === index);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var count = document.querySelector('[data-result-count]');
    var empty = document.querySelector('[data-no-results]');

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var query = normalize(filterInput ? filterInput.value : '');
        var category = normalize(categorySelect ? categorySelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cats = normalize(card.getAttribute('data-category'));
            var okText = !query || text.indexOf(query) !== -1;
            var okCategory = !category || cats.indexOf(category) !== -1;
            var ok = okText && okCategory;
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = visible ? '已找到匹配内容' : '暂无匹配';
        }
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
        }
        filterInput.addEventListener('input', applyFilter);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', applyFilter);
    }

    applyFilter();
});
