/**
 * =============================================================================
 * MAIN
 * Bootstrap file, loaded last. Its only direct job is flipping off the
 * no-js fallback state now that JavaScript is confirmed running; the real
 * work (content injection, navbar behavior, intro bookkeeping) lives in
 * their own dedicated files and is loaded alongside this one from
 * index.html:
 *
 *   config/site.config.js   → window.SITE_CONFIG (data)
 *   js/content-loader.js    → injects SITE_CONFIG into the DOM
 *   js/navbar.js            → scroll + mobile menu behavior
 *   js/hero-intro.js        → once-per-session intro bookkeeping
 *   js/main.js              → this file, runs last
 *
 * Kept deliberately tiny — this project intentionally avoids a bundler
 * or framework for a four-section marketing site on GitHub Pages.
 * =============================================================================
 */

(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  // Small shared namespace, reserved for future sections (Work/Services/
  // About) to hang their own init functions off without polluting globals.
  window.Kryozen = window.Kryozen || {};
})();
