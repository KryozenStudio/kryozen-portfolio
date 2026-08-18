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
    shortform:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="5" width="12" height="30" rx="3"/><polygon points="17,16 25,20 17,24" fill="currentColor" stroke="none"/></svg>',
    amv:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="9" width="26" height="22" rx="2"/><line x1="7" y1="16" x2="33" y2="16"/><line x1="7" y1="24" x2="33" y2="24"/></svg>',
    gaming:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="14" width="28" height="14" rx="7"/><circle cx="15" cy="21" r="1.4" fill="currentColor" stroke="none"/><circle cx="25" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="29" cy="21" r="1.4" fill="currentColor" stroke="none"/></svg>',
    thumbnail:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="8" width="28" height="24" rx="3"/><circle cx="14" cy="16" r="2.2" fill="currentColor" stroke="none"/><path d="M8 27 L16 19 L22 25 L27 18 L32 27"/></svg>',
    captions:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="30" height="24" rx="4"/><path d="M11 16h18M11 21h12M11 26h8"/></svg>',
    typography:
      '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h22M20 10v21M14 31h12"/><path d="M11 10l-5 21M29 10l5 21"/></svg>',
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
