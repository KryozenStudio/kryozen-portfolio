/**
 * =============================================================================
 * SERVICES SECTION
 * Self-contained loader, same pattern as js/work.js and js/about.js.
 * Every card is built from config.services — nothing is hardcoded in
 * index.html. A missing/unrecognized `icon` value just omits the icon
 * circle; the card layout doesn't depend on it.
 * =============================================================================
 */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.warn("[Kryozen] SITE_CONFIG not found — check that config/site.config.js loaded before js/services.js.");
    return;
  }

  var grid = document.getElementById("services-grid");
  if (!grid) return; // Services section markup isn't on this page.

  var emptyState = document.getElementById("services-empty");
  var sectionCfg = cfg.servicesSection || {};

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  setText("services-eyebrow-text", sectionCfg.eyebrow);
  setText("services-title", sectionCfg.heading);
  setText("services-subtitle", sectionCfg.subtitle);

  /* -----------------------------------------------------------------
     ICONS — original monoline glyphs, one per service, matching the
     stroke-based style used everywhere else in the site (logo, footer
     social icons, work section play/search icons).
  ----------------------------------------------------------------- */
  var ICONS = {
    /* Multi-frame 9:16 vertical viewport — three stacked/offset vertical
       rectangles standing in for multiple short-form clips, rather than
       a single play button (which reads as "video" generically, not
       specifically "short-form/vertical"). */
    shortform:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="9" width="11" height="22" rx="2.5" opacity=".45"/><rect x="15" y="6" width="11" height="28" rx="2.5" opacity=".75"/><rect x="24" y="9" width="11" height="22" rx="2.5"/></svg>',
    /* Kinetic soundwave / katana-strike — a single diagonal slash with a
       staggered soundwave rhythm underneath, reading as both "cut" and
       "sync to music" at once. */
    amv:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 30 L32 10" opacity=".85"/><path d="M12 24v-4M17 26v-8M22 27v-11M27 24v-5M31 22v-2"/></svg>',
    /* Crosshair / frame-sync reticle. */
    gaming:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="20" r="10"/><path d="M20 4v7M20 29v7M4 20h7M29 20h7"/><circle cx="20" cy="20" r="2" fill="currentColor" stroke="none"/></svg>',
    thumbnail:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="8" width="28" height="24" rx="3"/><circle cx="14" cy="16" r="2.2" fill="currentColor" stroke="none"/><path d="M8 27 L16 19 L22 25 L27 18 L32 27"/></svg>',
    /* Dynamic caption bar with a blinking text cursor at the end — a
       live-captioning motif (text "typing in" in real time) rather than
       a static subtitle rectangle. The final <rect> is the cursor;
       .icon-cursor (css/services.css) makes it blink. */
    captions:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="30" height="24" rx="4"/><path d="M11 16h14M11 21h18M11 26h10"/><rect class="icon-cursor" x="27" y="24" width="4" height="5" rx="1" fill="currentColor" stroke="none"/></svg>',
    /* "Aa_" kinetic typography mark with the same blinking cursor. */
    typography:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 27 L12 12 L18 27M8.4 21h7.2"/><path d="M22 27v-9a4 4 0 0 1 8 0v9M30 21h-8"/><rect class="icon-cursor" x="33" y="23" width="3" height="6" rx="1" fill="currentColor" stroke="none"/></svg>',
  };

  var services = Array.isArray(cfg.services) ? cfg.services : [];

  function createCard(service) {
    var card = document.createElement("article");
    card.className = "service-card";

    var iconMarkup = service.icon && ICONS[service.icon];
    if (iconMarkup) {
      var icon = document.createElement("span");
      icon.className = "service-card__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = iconMarkup;
      card.appendChild(icon);
    }
    // No icon / unrecognized icon key: the icon circle is simply
    // omitted. Title becomes the first element — layout still works.

    var title = document.createElement("h3");
    title.className = "service-card__title";
    title.textContent = service.title || "Untitled service";
    card.appendChild(title);

    if (service.description) {
      var description = document.createElement("p");
      description.className = "service-card__description";
      description.textContent = service.description;
      card.appendChild(description);
    }

    return card;
  }

  if (!services.length) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.textContent = sectionCfg.emptyStateText || "No services are currently listed.";
    }
    return;
  }

  var fragment = document.createDocumentFragment();
  services.forEach(function (service) {
    if (!service || !service.title) return; // skip malformed entries, don't break the grid
    fragment.appendChild(createCard(service));
  });
  grid.appendChild(fragment);

  if (emptyState) emptyState.hidden = true;
})();
