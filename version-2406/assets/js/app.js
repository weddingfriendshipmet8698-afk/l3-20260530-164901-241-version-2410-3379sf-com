(function () {
  var root = document.body ? (document.body.getAttribute("data-root") || "") : "";

  function joinRoot(url) {
    if (!url || /^https?:\/\//i.test(url) || url.charAt(0) === "#") {
      return url;
    }
    return root + url;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", mobileMenu.classList.contains("is-open"));
    });
  }

  var sliders = document.querySelectorAll("[data-hero-slider]");
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  });

  var globalInputs = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
  globalInputs.forEach(function (input) {
    var holder = input.parentElement ? input.parentElement.querySelector("[data-global-results]") : null;
    if (!holder) {
      return;
    }

    input.addEventListener("input", function () {
      var keyword = normalize(input.value);
      if (!keyword) {
        holder.classList.remove("is-open");
        holder.innerHTML = "";
        return;
      }

      var data = Array.isArray(window.SEARCH_DATA) ? window.SEARCH_DATA : [];
      var results = data.filter(function (item) {
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.category).indexOf(keyword) >= 0;
      }).slice(0, 12);

      holder.innerHTML = results.map(function (item) {
        return "<a href=\"" + joinRoot(item.url) + "\"><strong>" + item.title + "</strong><span>" + item.category + " · " + item.year + " · " + item.region + "</span></a>";
      }).join("");
      holder.classList.toggle("is-open", results.length > 0);
    });

    document.addEventListener("click", function (event) {
      if (!input.parentElement || !input.parentElement.contains(event.target)) {
        holder.classList.remove("is-open");
      }
    });
  });

  var pageSearch = document.querySelector("[data-page-search]");
  var filterRow = document.querySelector("[data-filter-row]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var activeFilter = "all";

  function applyPageFilter() {
    var keyword = pageSearch ? normalize(pageSearch.value) : "";
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search-text"));
      var tags = normalize(card.getAttribute("data-filter-tags"));
      var matchesKeyword = !keyword || text.indexOf(keyword) >= 0 || tags.indexOf(keyword) >= 0;
      var matchesFilter = activeFilter === "all" || tags.indexOf(normalize(activeFilter)) >= 0 || text.indexOf(normalize(activeFilter)) >= 0;
      card.classList.toggle("is-hidden", !(matchesKeyword && matchesFilter));
    });
  }

  if (pageSearch) {
    pageSearch.addEventListener("input", applyPageFilter);
  }

  if (filterRow) {
    filterRow.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter-value]");
      if (!button) {
        return;
      }
      activeFilter = button.getAttribute("data-filter-value") || "all";
      filterRow.querySelectorAll("[data-filter-value]").forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyPageFilter();
    });
  }

  document.querySelectorAll(".movie-player").forEach(function (player) {
    var video = player.querySelector("video");
    var stream = player.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (!video || !stream || loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function playMovie() {
      loadStream();
      if (!video) {
        return;
      }
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    player.querySelectorAll("[data-play]").forEach(function (button) {
      button.addEventListener("click", playMovie);
    });

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playMovie();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
