import { H as Hls } from './hls.js';

const query = (selector, scope = document) => scope.querySelector(selector);
const queryAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileMenu() {
  const toggle = query('[data-menu-toggle]');
  const menu = query('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {
    menu.classList.toggle('is-open');
    const isOpen = menu.classList.contains('is-open');
    toggle.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');
  });
}

function initSearchForms() {
  queryAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = query('input[name="search"]', form);
      const value = input ? input.value.trim() : '';

      if (!value) {
        event.preventDefault();
        return;
      }
    });
  });
}

function initHero() {
  const hero = query('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = queryAll('[data-hero-slide]', hero);
  const dots = queryAll('[data-hero-dot]', hero);
  const prev = query('[data-hero-prev]', hero);
  const next = query('[data-hero-next]', hero);
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5500);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(current + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function getUrlSearchValue() {
  const params = new URLSearchParams(window.location.search);
  return params.get('search') || '';
}

function initFilters() {
  const panel = query('[data-filter-panel]');
  const list = query('[data-movie-list]');

  if (!panel || !list) {
    return;
  }

  const keywordInput = query('[data-filter-keyword]', panel);
  const categorySelect = query('[data-filter-category]', panel);
  const yearSelect = query('[data-filter-year]', panel);
  const regionSelect = query('[data-filter-region]', panel);
  const typeSelect = query('[data-filter-type]', panel);
  const result = query('[data-filter-result]', panel);
  const cards = queryAll('.movie-card', list);
  const urlKeyword = getUrlSearchValue();

  if (keywordInput && urlKeyword) {
    keywordInput.value = urlKeyword;
  }

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  const apply = () => {
    const keyword = normalize(keywordInput ? keywordInput.value : '');
    const category = normalize(categorySelect ? categorySelect.value : '');
    const year = normalize(yearSelect ? yearSelect.value : '');
    const region = normalize(regionSelect ? regionSelect.value : '');
    const type = normalize(typeSelect ? typeSelect.value : '');
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.category,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.tags,
        card.textContent,
      ].join(' '));

      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesCategory = !category || normalize(card.dataset.category).includes(category);
      const matchesYear = !year || normalize(card.dataset.year) === year;
      const matchesRegion = !region || normalize(card.dataset.region).includes(region);
      const matchesType = !type || normalize(card.dataset.type).includes(type);
      const isVisible = matchesKeyword && matchesCategory && matchesYear && matchesRegion && matchesType;

      card.hidden = !isVisible;
      if (isVisible) {
        visible += 1;
      }
    });

    if (result) {
      result.textContent = `当前显示 ${visible} / ${cards.length} 部影片`;
    }
  };

  [keywordInput, categorySelect, yearSelect, regionSelect, typeSelect].forEach((control) => {
    if (!control) {
      return;
    }

    control.addEventListener('input', apply);
    control.addEventListener('change', apply);
  });

  apply();
}

function initImageFallbacks() {
  queryAll('.poster-frame img').forEach((image) => {
    image.addEventListener('error', () => {
      const frame = image.closest('.poster-frame');
      image.style.opacity = '0';
      if (frame) {
        frame.classList.add('is-missing-image');
      }
    });
  });
}

function initPlayers() {
  queryAll('[data-player]').forEach((player) => {
    const video = query('video', player);
    const button = query('[data-play-button]', player);
    const message = query('[data-player-message]', player);
    const src = player.dataset.src;
    let initialized = false;

    if (!video || !button || !src) {
      return;
    }

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    const initSource = () => {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setMessage('正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return Promise.resolve();
      }

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage('播放源加载完成');
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            setMessage('播放源暂时无法加载，请稍后重试。');
          }
        });

        return Promise.resolve();
      }

      setMessage('当前浏览器不支持 HLS 播放。');
      return Promise.reject(new Error('HLS is not supported'));
    };

    button.addEventListener('click', () => {
      initSource()
        .then(() => {
          button.classList.add('is-hidden');
          return video.play();
        })
        .then(() => {
          setMessage('');
        })
        .catch(() => {
          button.classList.remove('is-hidden');
        });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearchForms();
  initHero();
  initFilters();
  initImageFallbacks();
  initPlayers();
});
