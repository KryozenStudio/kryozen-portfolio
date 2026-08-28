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

  /** -------------------------------------------------------------------
   * AMBIENT PARALLAX
   * The .site-ambient layer (css/ui-enhancements.css) already drifts on
   * its own via CSS keyframes — this adds a second, independent axis of
   * motion driven by actual scroll position, so the background responds
   * to what the visitor is doing rather than only ever running its own
   * autonomous loop. Sets --ambient-parallax, a small px offset (capped,
   * eased toward but never fully reaching the cap) that .site-ambient
   * reads in its own transform. rAF-throttled like every other scroll
   * listener in this codebase (see js/navbar.js).
   * ---------------------------------------------------------------- */
  var ambient = document.querySelector(".site-ambient");
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (ambient && !reduceMotion) {
    var ticking = false;
    var MAX_OFFSET = 46; // px — kept small; this is a depth cue, not a second scroll

    function applyParallax() {
      ticking = false;
      var y = window.scrollY || 0;
      // Diminishing return past a few hundred px of scroll, so a very
      // long page doesn't drag the layer indefinitely off-screen —
      // asymptotically approaches MAX_OFFSET instead of scaling linearly
      // forever.
      var offset = MAX_OFFSET * (1 - Math.exp(-y / 900));
      ambient.style.setProperty("--ambient-parallax", offset.toFixed(1) + "px");
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(applyParallax);
        }
      },
      { passive: true }
    );

    applyParallax(); // sync to whatever scroll position the page loaded at (e.g. #hash navigation, back/forward restore)
  }
})();
