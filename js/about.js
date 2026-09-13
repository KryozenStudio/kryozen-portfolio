/**
 * =============================================================================
 * ABOUT SECTION
 * Self-contained loader for the About section, following the same
 * pattern as js/work.js (see PROJECT_RULES.md §2). Reuses existing data
 * rather than duplicating it:
 *   - "Name/brand" comes from cfg.brand.shortName (already exists) —
 *     there's no separate about.name field.
 *   - The software/tools strip reads the existing top-level cfg.software
 *     array (first added, empty, in Phase 1).
 *   - The portrait's graceful-fallback mark is a plain <img
 *     data-logo-img>, so js/content-loader.js's existing generic
 *     [data-logo-img] selector wires its src up automatically — no new
 *     code needed for that part.
 * =============================================================================
 */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.warn("[Kryozen] SITE_CONFIG not found — check that config/site.config.js loaded before js/about.js.");
    return;
  }

  var section = document.getElementById("about");
  if (!section) return; // About section markup isn't on this page.

  var aboutCfg = cfg.about || {};

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  setText("about-eyebrow-text", aboutCfg.eyebrow);
  setText("about-title", aboutCfg.heading);
  setText("about-subtitle", aboutCfg.subtitle);
  setText("about-intro", aboutCfg.intro);
  setText("about-bio", aboutCfg.bio);

  var roleEl = document.getElementById("about-role");
  if (roleEl) {
    var brandName = (cfg.brand && (cfg.brand.shortName || cfg.brand.name)) || "";
    var role = aboutCfg.role || "";
    roleEl.textContent = [brandName, role].filter(Boolean).join(" — ");
  }

  /* -----------------------------------------------------------------
     PORTRAIT — optional. No placeholder logo is used when a photo has
     not been configured, keeping the About section free of extra marks.
  ----------------------------------------------------------------- */
  var portrait = document.getElementById("about-portrait");
  var portraitMedia = document.querySelector(".about__media");
  var portraitImg = document.getElementById("about-portrait-img");

  if (portrait && portraitImg) {
    if (aboutCfg.profileImage) {
      portraitImg.src = aboutCfg.profileImage;
      portraitImg.alt = "";
      portraitImg.hidden = false;
      if (portraitMedia) portraitMedia.hidden = false;
      portraitImg.addEventListener("error", function () {
        if (portraitMedia) portraitMedia.hidden = true;
      }, { once: true });
    } else {
      if (portraitMedia) portraitMedia.hidden = true;
    }
  }

  /* -----------------------------------------------------------------
     STAT STRIP — authority numbers below the bio (cfg.about.stats).
     Same graceful-hide pattern as the portrait/software sections below:
     no stats configured, no section rendered.
  ----------------------------------------------------------------- */
  var statsWrap = document.getElementById("about-stats");
  if (statsWrap) {
    var stats = Array.isArray(aboutCfg.stats) ? aboutCfg.stats : [];
    if (stats.length) {
      statsWrap.hidden = false;
      stats.forEach(function (stat) {
        if (!stat || !stat.value) return; // skip malformed entries
        var item = document.createElement("div");
        item.className = "about__stat";
        var value = document.createElement("span");
        value.className = "about__stat-value";
        value.textContent = stat.value;
        item.appendChild(value);
        if (stat.label) {
          var label = document.createElement("span");
          label.className = "about__stat-label";
          label.textContent = stat.label;
          item.appendChild(label);
        }
        statsWrap.appendChild(item);
      });
    } else {
      statsWrap.hidden = true;
    }
  }

  /* -----------------------------------------------------------------
     SOFTWARE / TOOLS STRIP — reuses the existing top-level cfg.software
     array rather than a separate about.skills field.
  ----------------------------------------------------------------- */
  var softwareWrap = document.getElementById("about-software");
  var softwareList = document.getElementById("about-software-list");

  if (softwareWrap && softwareList) {
    var tools = Array.isArray(cfg.software) ? cfg.software : [];
    if (tools.length) {
      softwareWrap.hidden = false;
      tools.forEach(function (tool) {
        if (!tool || !tool.name) return; // skip malformed entries, don't break the layout
        var tag = document.createElement("span");
        tag.className = "about__software-tag";
        // Glowing status dot per the brief ("interactive pill grid...
        // with subtle glowing status dots") — purely decorative, so a
        // plain span rather than anything with its own semantics.
        var dot = document.createElement("span");
        dot.className = "about__software-dot";
        dot.setAttribute("aria-hidden", "true");
        tag.appendChild(dot);
        tag.appendChild(document.createTextNode(tool.name));
        softwareList.appendChild(tag);
      });
    } else {
      softwareWrap.hidden = true;
    }
  }
})();
