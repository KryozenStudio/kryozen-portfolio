/**
 * =============================================================================
 * CARD SPOTLIGHT
 * A cursor-tracked radial glow on premium cards (service cards, FAQ
 * items, contact methods, project cards, the About panel) — sets
 * --spotlight-x/--spotlight-y per card as the pointer moves over it;
 * css/ui-enhancements.css turns those into a soft light following the
 * cursor across the card's surface (Aceternity-style "spotlight card").
 *
 * Uses one delegated `pointermove` listener on `document` rather than a
 * listener per card: several of these card grids are rebuilt at runtime
 * (category pages re-render on search/filter — see js/category-page.js),
 * so per-element listeners would silently stop working on any card
 * added after this script's first pass. Delegation needs no rebinding
 * and costs nothing extra when the pointer isn't over a card.
 *
 * Desktop/fine-pointer only, same guard as js/hero-pointer.js — skipped
 * entirely (no listener attached) on touch devices and under
 * prefers-reduced-motion, rather than attached-then-hidden.
 * =============================================================================
 */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isFinePointer =
    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduceMotion || !isFinePointer) return;

  var SELECTOR =
    ".service-card, .faq__item, .contact__method, .category-project, " +
    ".category-strip__item, .about__panel";

  var current = null;
  var ticking = false;
  var lastEvent = null;

  function apply() {
    ticking = false;
    var event = lastEvent;
    var card = event.target.closest ? event.target.closest(SELECTOR) : null;

    if (!card) {
      if (current) {
        current.classList.remove("has-spotlight");
        current = null;
      }
      return;
    }

    if (card !== current) {
      if (current) current.classList.remove("has-spotlight");
      card.classList.add("has-spotlight");
      current = card;
    }

    var rect = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", ((event.clientX - rect.left) / rect.width) * 100 + "%");
    card.style.setProperty("--spotlight-y", ((event.clientY - rect.top) / rect.height) * 100 + "%");
  }

  document.addEventListener(
    "pointermove",
    function (event) {
      lastEvent = event;
      if (!ticking) {
        window.requestAnimationFrame(apply);
        ticking = true;
      }
    },
    { passive: true }
  );

  // ---------------------------------------------------------------------
  // MAGNETIC BUTTONS — primary/secondary CTAs pull slightly toward the
  // cursor within their own bounds, then spring back on leave. Composes
  // with (doesn't replace) the existing hover transform in css/buttons.css
  // via the --magnet-x/--magnet-y custom properties that rule already
  // reads — see the comment there.
  // ---------------------------------------------------------------------
  var MAGNET_SELECTOR = ".btn";
  var MAGNET_STRENGTH = 0.28; // fraction of cursor offset the button follows

  document.querySelectorAll(MAGNET_SELECTOR).forEach(function (btn) {
    btn.addEventListener(
      "pointermove",
      function (event) {
        var rect = btn.getBoundingClientRect();
        var x = event.clientX - (rect.left + rect.width / 2);
        var y = event.clientY - (rect.top + rect.height / 2);
        btn.style.setProperty("--magnet-x", x * MAGNET_STRENGTH + "px");
        btn.style.setProperty("--magnet-y", y * MAGNET_STRENGTH + "px");
      },
      { passive: true }
    );

    btn.addEventListener("pointerleave", function () {
      btn.style.setProperty("--magnet-x", "0px");
      btn.style.setProperty("--magnet-y", "0px");
    });
  });
})();
