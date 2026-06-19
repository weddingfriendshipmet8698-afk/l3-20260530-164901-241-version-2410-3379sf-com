(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = $('[data-menu-toggle]');
        var panel = $('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    function setupScrollRails() {
        $all('[data-scroll-left]').forEach(function (button) {
            button.addEventListener('click', function () {
                var target = document.getElementById(button.getAttribute('data-scroll-left'));
                if (target) {
                    target.scrollBy({ left: -420, behavior: 'smooth' });
                }
            });
        });
        $all('[data-scroll-right]').forEach(function (button) {
            button.addEventListener('click', function () {
                var target = document.getElementById(button.getAttribute('data-scroll-right'));
                if (target) {
                    target.scrollBy({ left: 420, behavior: 'smooth' });
                }
            });
        });
    }

    function setupCategoryFilter() {
        var list = $('[data-filter-list]');
        if (!list) {
            return;
        }
        var input = $('[data-filter-input]');
        var select = $('[data-sort-select]');
        var cards = $all('.movie-card', list);
        var original = cards.slice();
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var filtered = original.filter(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                return !keyword || haystack.indexOf(keyword) !== -1;
            });
            var mode = select ? select.value : 'default';
            if (mode === 'newest') {
                filtered.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            }
            if (mode === 'title') {
                filtered.sort(function (a, b) {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
                });
            }
            list.innerHTML = '';
            filtered.forEach(function (card) {
                list.appendChild(card);
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        if (select) {
            select.addEventListener('change', apply);
        }
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderSearchCard(item) {
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(item.url) + '">',
            '<div class="card-cover"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></div>',
            '<div class="card-body">',
            '<div class="card-badges"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '<h3>' + escapeHtml(item.title) + '</h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function setupSearchPage() {
        var resultsBox = $('[data-search-results]');
        var summary = $('[data-search-summary]');
        if (!resultsBox || !summary || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var pageInput = $('.page-search input[name="q"]');
        if (pageInput) {
            pageInput.value = query;
        }
        if (!query) {
            summary.textContent = '请输入关键词开始搜索。';
            return;
        }
        var lower = query.toLowerCase();
        var results = window.SEARCH_INDEX.filter(function (item) {
            return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
                .join(' ')
                .toLowerCase()
                .indexOf(lower) !== -1;
        });
        summary.textContent = '搜索“' + query + '”找到 ' + results.length + ' 个相关影片';
        resultsBox.innerHTML = results.slice(0, 120).map(renderSearchCard).join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupScrollRails();
        setupCategoryFilter();
        setupSearchPage();
    });
})();
