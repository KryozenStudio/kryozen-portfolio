/**
 * =============================================================================
 * MAIN
 * Bootstrap file, loaded last.
 *
 * The no-js fallback state is actually flipped off by a tiny inline
 * <script> at the very top of <body> in every HTML file — synchronously,
 * before the nav below it is even parsed, so the fallback content never
 * renders in the first place. Doing it here instead (after the full
 * defer chain finishes) was producing a brief but real navbar height
 * settle on load. The removal below is kept as a harmless no-op
 * backstop in case that inline script is ever stripped.
 *
 * The real work (content injection, navbar behavior, intro bookkeeping)
 * lives in their own dedicated files and is loaded alongside this one
 * from index.html:
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
  document.body.classList.remove("no-js");

  // Small shared namespace, reserved for future sections (Work/Services/
  // About) to hang their own init functions off without polluting globals.
  window.Kryozen = window.Kryozen || {};
})();
