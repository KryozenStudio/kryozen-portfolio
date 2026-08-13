/**
 * =============================================================================
 * WORK / PORTFOLIO SYSTEM
 * Self-contained loader + behavior for the Work section, following the
 * same "each section owns its own file" pattern as content-loader.js /
 * navbar.js / hero-intro.js (see PROJECT_RULES.md §2).
 *
 * Responsibilities:
 *   1. Sync the section's static copy (eyebrow/title/subtitle/search
 *      placeholder) from config.work — same progressive-enhancement
 *      pattern as the hero: index.html ships real fallback text, this
 *      just re-syncs it from config.
 *   2. Sort config.projects by date (newest first) once, and expose that
 *      sorted list + a getLatestProject() helper on window.Kryozen for a
 *      future homepage "latest project" highlight (not built yet).
 *   3. Generate the category filter chips from config.categories.
 *   4. Generate one project card per project — nothing is hardcoded in
 *      index.html.
 *   5. Wire category filtering + live search against the in-memory
 *      project list (no reload, no backend — everything client-side).
 * =============================================================================
 */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.warn("[Kryozen] SITE_CONFIG not found — check that config/site.config.js loaded before js/work.js.");
    return;
  }

  var grid = document.getElementById("work-grid");
  if (!grid) return; // Work section markup isn't on this page — nothing to do.

  var filtersContainer = document.getElementById("work-filters");
  var searchInput = document.getElementById("work-search-input");
  var emptyState = document.getElementById("work-empty");
  var statusEl = document.getElementById("work-status");

  /** Small helper, mirrors content-loader.js's pattern in this file's own scope. */
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  var workCfg = cfg.work || {};
  setText("work-eyebrow-text", workCfg.eyebrow);
  setText("work-title", workCfg.heading);
  setText("work-subtitle", workCfg.subtitle);

  if (searchInput) {
    if (workCfg.searchPlaceholder) searchInput.setAttribute("placeholder", workCfg.searchPlaceholder);
    var searchLabelEl = document.getElementById("work-search-label");
    if (searchLabelEl && workCfg.searchLabel) searchLabelEl.textContent = workCfg.searchLabel;
  }

  var allLabel = workCfg.allLabel || "All";
  var emptyText = workCfg.emptyStateText || "No projects found.";
  var categories = Array.isArray(cfg.categories) ? cfg.categories : [];

  /* -----------------------------------------------------------------
     SORT — newest first, derived from data. Nothing is manually
     labeled "latest"; the order below is the single source of truth.
  ----------------------------------------------------------------- */
  var projects = Array.isArray(cfg.projects)
    ? cfg.projects.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      })
    : [];

  async function hydrateFromBackend() {
    if (!window.Kryozen || typeof window.Kryozen.getProjects !== "function") return;
    var remote = await window.Kryozen.getProjects();
    if (!Array.isArray(remote)) return;
    projects = remote.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    window.Kryozen.projects = projects;
    window.Kryozen.getLatestProject = function () { return projects.length ? projects[0] : null; };
    grid.innerHTML = "";
    cardEls = [];
    buildCards();
    applyFilters();
  }

  // Exposed for a future homepage "latest project" highlight — see
  // PROJECT_RULES.md → "Work / Portfolio System". Not consumed yet.
  window.Kryozen = window.Kryozen || {};
  window.Kryozen.projects = projects;
  window.Kryozen.getLatestProject = function () {
    return projects.length ? projects[0] : null;
  };

  /* -----------------------------------------------------------------
     ICONS — same original-monoline-glyph approach as content-loader.js,
     kept local to this file since they're only used here.
  ----------------------------------------------------------------- */
  var ICON_PLAY =
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="20" cy="20" r="18"/><polygon points="16,13 28,20 16,27" fill="currentColor" stroke="none"/></svg>';

  var ICON_SEARCH =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>';

  var searchIconEl = document.getElementById("work-search-icon");
  if (searchIconEl) searchIconEl.innerHTML = ICON_SEARCH;

  /* -----------------------------------------------------------------
     FILTER CHIPS — generated from config.categories, "All" prepended.
     Never duplicated by hand: add/remove a category in config only.
  ----------------------------------------------------------------- */
  var currentCategory = allLabel;
  var chipButtons = [];

  function buildFilters() {
    if (!filtersContainer) return;

    var allOptions = [allLabel].concat(categories);

    allOptions.forEach(function (category) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "work__filter-chip";
      chip.textContent = category;
      chip.setAttribute("aria-pressed", category === allLabel ? "true" : "false");
      chip.addEventListener("click", function () {
        setCategory(category);
      });
      filtersContainer.appendChild(chip);
      chipButtons.push(chip);
    });
  }

  function setCategory(category) {
    currentCategory = category;
    chipButtons.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.textContent === category ? "true" : "false");
    });
    applyFilters();
  }

  /* -----------------------------------------------------------------
     CARDS — one per project, built entirely from data. No individual
     project markup ever lives in index.html.
  ----------------------------------------------------------------- */
  var cardEls = [];

  function createCard(project) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "project-card";
    card.dataset.category = project.category || "";
    card.dataset.searchIndex = ((project.title || "") + " " + (project.category || "")).toLowerCase();
    card.setAttribute("aria-label", (project.title || "Untitled project") + " — " + (project.category || ""));

    // Thumbnail (with graceful fallback face if missing or broken).
    var thumb = document.createElement("span");
    thumb.className = "project-card__thumb";

    if (project.thumbnail) {
      var img = document.createElement("img");
      img.src = project.thumbnail;
      img.alt = "";
      img.loading = "lazy";
      img.width = 640;
      img.height = 360;
      img.addEventListener(
        "error",
        function () {
          thumb.classList.add("project-card__thumb--fallback");
          img.remove();
        },
        { once: true }
      );
      thumb.appendChild(img);
    } else {
      thumb.classList.add("project-card__thumb--fallback");
    }

    var fallbackLabel = document.createElement("span");
    fallbackLabel.className = "project-card__fallback-label";
    fallbackLabel.setAttribute("aria-hidden", "true");
    fallbackLabel.textContent = project.category || "";
    thumb.appendChild(fallbackLabel);

    var playGlyph = document.createElement("span");
    playGlyph.className = "project-card__play";
    playGlyph.setAttribute("aria-hidden", "true");
    playGlyph.innerHTML = ICON_PLAY;
    thumb.appendChild(playGlyph);

    // Meta: title, category, and — only if present — the first software tag.
    if (project.featured) {
      var featured = document.createElement("span");
      featured.className = "project-card__featured";
      featured.textContent = "Featured";
      featured.setAttribute("aria-hidden", "true");
      thumb.appendChild(featured);
    }

    var meta = document.createElement("span");
    meta.className = "project-card__meta";

    var title = document.createElement("span");
    title.className = "project-card__title";
    title.textContent = project.title || "Untitled";
    meta.appendChild(title);

    var tags = document.createElement("span");
    tags.className = "project-card__tags";

    var categoryTag = document.createElement("span");
    categoryTag.className = "project-card__category";
    categoryTag.textContent = project.category || "";
    tags.appendChild(categoryTag);

    if (Array.isArray(project.software) && project.software.length) {
      var softwareTag = document.createElement("span");
      softwareTag.className = "project-card__software";
      softwareTag.textContent = project.software[0];
      tags.appendChild(softwareTag);
    }

    meta.appendChild(tags);

    card.appendChild(thumb);
    card.appendChild(meta);

    // Hook for the future video player / detail view. Nothing listens
    // for this yet — see PROJECT_RULES.md → "Work / Portfolio System".
    card.addEventListener("click", function () {
      card.dispatchEvent(
        new CustomEvent("kryozen:project-open", {
          bubbles: true,
          detail: project,
        })
      );
    });

    return card;
  }

  function buildCards() {
    var fragment = document.createDocumentFragment();
    projects.forEach(function (project) {
      var card = createCard(project);
      fragment.appendChild(card);
      cardEls.push(card);
    });
    grid.appendChild(fragment);
  }

  /* -----------------------------------------------------------------
     FILTER + SEARCH
     Cards fade/scale out via CSS, then get `hidden` set once the
     transition completes — so the grid reflows only after the exiting
     card has visually left, not abruptly. Entering cards get `hidden`
     removed immediately so the enter transition can play.
  ----------------------------------------------------------------- */
  var HIDE_DELAY_MS = 320; // matches --duration-base; reduced-motion users get near-instant transitions via reset.css, so this timer just needs to be >= the real transition length.
  var hideTimer = null;

  function applyFilters() {
    var term = ((searchInput && searchInput.value) || "").trim().toLowerCase();
    var visibleCount = 0;

    cardEls.forEach(function (card) {
      var matchesCategory = currentCategory === allLabel || card.dataset.category === currentCategory;
      var matchesSearch = !term || card.dataset.searchIndex.indexOf(term) !== -1;
      var shouldShow = matchesCategory && matchesSearch;

      if (shouldShow) {
        visibleCount += 1;
        if (card.hidden) {
          card.hidden = false;
          // Force a reflow so the browser registers the pre-transition
          // state before the class below removes it — otherwise the
          // opacity/scale change can't be animated.
          void card.offsetWidth;
        }
        card.classList.remove("project-card--filtered-out");
      } else {
        card.classList.add("project-card--filtered-out");
      }
    });

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(function () {
      cardEls.forEach(function (card) {
        card.hidden = card.classList.contains("project-card--filtered-out");
      });
    }, HIDE_DELAY_MS);

    if (emptyState) emptyState.hidden = visibleCount !== 0;

    if (statusEl) {
      statusEl.textContent =
        visibleCount === 0
          ? emptyText
          : visibleCount + " project" + (visibleCount === 1 ? "" : "s") + " shown.";
    }
  }

  buildFilters();
  buildCards();
  applyFilters();
  hydrateFromBackend();

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
})();
