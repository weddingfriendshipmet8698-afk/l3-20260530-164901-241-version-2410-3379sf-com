(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    setupNavigation();
    setupSearchForms();
    setupHero();
    setupScrollers();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        input.value = input.value.trim();
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      });
    });

    show(0);
    start();
  }

  function setupScrollers() {
    document.querySelectorAll("[data-scroll]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.querySelector(button.getAttribute("data-scroll"));
        if (!target) {
          return;
        }
        var direction = button.getAttribute("data-dir") === "left" ? -1 : 1;
        target.scrollBy({
          left: direction * 430,
          behavior: "smooth"
        });
      });
    });
  }

  function setupFilters() {
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var localInputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var scope = document.querySelector(button.getAttribute("data-scope"));
        if (!scope) {
          return;
        }
        var value = button.getAttribute("data-filter");
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-scope="' + button.getAttribute("data-scope") + '"]'));
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        scope.querySelectorAll("[data-card]").forEach(function (card) {
          var topic = card.getAttribute("data-topic");
          card.style.display = value === "all" || topic === value ? "" : "none";
        });
      });
    });

    localInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var scope = document.querySelector(input.getAttribute("data-local-filter"));
        var empty = document.querySelector(input.getAttribute("data-empty"));
        if (!scope) {
          return;
        }
        var value = input.value.trim().toLowerCase();
        var shown = 0;
        scope.querySelectorAll("[data-card]").forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var visible = !value || text.indexOf(value) !== -1;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!form || !input || !results || typeof searchItems === "undefined") {
      return;
    }

    function render(query) {
      var q = query.trim().toLowerCase();
      results.innerHTML = "";
      if (!q) {
        if (empty) {
          empty.classList.add("is-visible");
          empty.textContent = "请输入片名、类型、年份或地区进行搜索。";
        }
        return;
      }
      var matched = searchItems.filter(function (item) {
        return [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          item.oneLine
        ].join(" ").toLowerCase().indexOf(q) !== -1;
      }).slice(0, 80);

      matched.forEach(function (item) {
        var card = document.createElement("article");
        card.className = "movie-card";
        card.innerHTML = [
          '<a class="poster-link" href="./' + escapeHtml(item.url) + '">',
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
          '<span class="card-badge">' + escapeHtml(item.region) + '</span>',
          '</a>',
          '<div class="card-body">',
          '<div class="meta-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
          '<h3><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '<div class="genre-line">' + escapeHtml(item.genre) + '</div>',
          '</div>'
        ].join("");
        results.appendChild(card);
      });

      if (empty) {
        empty.classList.toggle("is-visible", matched.length === 0);
        empty.textContent = matched.length === 0 ? "没有找到匹配内容。" : "";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render(input.value);
      var url = new URL(window.location.href);
      url.searchParams.set("q", input.value.trim());
      window.history.replaceState({}, "", url.toString());
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    render(initial);
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var status = box.querySelector(".player-status");
      if (!video || !overlay) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function loadStream() {
        if (loaded) {
          return;
        }
        loaded = true;
        setStatus("正在加载...");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playNow();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频暂时无法播放");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          playNow();
        } else {
          setStatus("视频暂时无法播放");
        }
      }

      function playNow() {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            setStatus("请再次点击播放");
          });
        }
      }

      function start() {
        loadStream();
        if (loaded && video.src) {
          playNow();
        }
      }

      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
        setStatus("");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }
})();
