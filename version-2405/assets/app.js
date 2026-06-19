(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var next = hero.querySelector('.hero-arrow.next');
        var prev = hero.querySelector('.hero-arrow.prev');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initSearchForms() {
        document.querySelectorAll('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function initLocalFilters() {
        var grid = document.querySelector('.catalog-grid');
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
        var search = document.querySelector('.local-search');
        var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
        var empty = document.querySelector('.empty-state');
        if (!cards.length || (!search && !selects.length)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && search) {
            search.value = q;
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
        }

        function apply() {
            var keyword = normalize(search ? search.value : '');
            var activeFilters = selects.map(function (select) {
                return {
                    field: select.getAttribute('data-filter-field'),
                    value: normalize(select.value)
                };
            }).filter(function (item) {
                return item.value;
            });
            var visible = 0;

            cards.forEach(function (card) {
                var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
                var matchesFilter = activeFilters.every(function (item) {
                    return normalize(card.getAttribute('data-' + item.field)) === item.value;
                });
                var show = matchesKeyword && matchesFilter;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (search) {
            search.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchForms();
        initLocalFilters();
    });
})();

function initMoviePlayer(videoId, streamUrl, buttonSelector) {
    var video = document.getElementById(videoId);
    var button = document.querySelector(buttonSelector);
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        attached = true;
    }

    function play() {
        attach();
        if (button) {
            button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (!video.currentTime && button) {
            button.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
