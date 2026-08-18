/**
 * =============================================================================
 * HERO POINTER LIGHT
 * A very subtle pointer-reactive ambient highlight in the hero backdrop —
 * purpose: brand moment, reinforces the hero as the site's premium focal
 * point (see PROJECT_RULES.md "Animation Rules"). Desktop/fine-pointer only;
 * skipped entirely (no listeners attached) on touch devices and under
 * prefers-reduced-motion, rather than attached-then-hidden, so there is
 * zero event-handling cost where it wouldn't be shown anyway.
 * =============================================================================
 */
(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  if (!hero) return;

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isFinePointer =
    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduceMotion || !isFinePointer) return;

  var ticking = false;
  var x = 50;
  var y = 32;

  function apply() {
    hero.style.setProperty("--pointer-x", x + "%");
    hero.style.setProperty("--pointer-y", y + "%");
    ticking = false;
  }

  hero.addEventListener(
    "pointermove",
    function (event) {
      var rect = hero.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width) * 100;
      y = ((event.clientY - rect.top) / rect.height) * 100;
      if (!ticking) {
        window.requestAnimationFrame(apply);
        ticking = true;
      }
    },
    { passive: true }
  );

  hero.addEventListener("pointerenter", function () {
    hero.classList.add("has-pointer-light");
  });

  hero.addEventListener("pointerleave", function () {
    hero.classList.remove("has-pointer-light");
  });
})();
