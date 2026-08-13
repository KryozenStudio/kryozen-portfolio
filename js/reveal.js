/**
 * KRYOZEN — SECTION REVEAL
 * Lightweight scroll reveals for secondary content. The hero keeps the
 * cinematic intro; everything below it uses quieter motion so the page
 * stays fast and intentional.
 */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var selectors = [
    ".work__head",
    ".work__controls",
    ".services__head",
    ".service-card",
    ".about__layout",
    ".faq__head",
    ".faq__item",
    ".contact__inner",
    ".footer__inner"
  ];

  var elements = [];
  selectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add("section-reveal");
      elements.push(el);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  elements.forEach(function (el) { observer.observe(el); });
})();
