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
  }, { threshold: 0.12, rootMargin: "0px" });
  // No bottom rootMargin shrink (previously "-8%"): threshold:0.12 alone
  // already delays the reveal until meaningfully scrolled into view, so
  // the extra margin wasn't pulling real weight — and for a short element
  // right at the end of the page (the footer, or any future section that
  // ends up last), it's actively harmful: the page's maximum possible
  // scroll position can leave that element's top edge already past a
  // bottom-shrunk root, meaning no scroll position — not "hasn't
  // scrolled enough yet," but *no* position, ever — satisfies the
  // threshold, and the element sits at opacity:0 forever. Confirmed this
  // was actually happening to .footer__inner on ordinary viewport
  // heights (~900px), not just a theoretical edge case.

  elements.forEach(function (el) { observer.observe(el); });

  // Safety net: if the page is scrolled to (or within a few px of) its
  // absolute maximum scroll position and something is still unrevealed,
  // force it visible. This isn't reacting to the specific bug fixed
  // above (that one's gone — root cause, not papered over) — it's a
  // backstop against any *future* short/trailing element hitting the
  // same class of problem again without anyone noticing, since "content
  // permanently stuck invisible" fails silently with no console error
  // to catch it. rAF-throttled, matches the pattern js/navbar.js uses
  // for its own scroll listener.
  var ticking = false;
  function checkStuckAtBottom() {
    ticking = false;
    var doc = document.documentElement;
    var atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 4;
    if (!atBottom) return;
    elements.forEach(function (el) {
      if (!el.classList.contains("is-visible")) {
        el.classList.add("is-visible");
        observer.unobserve(el);
      }
    });
  }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(checkStuckAtBottom);
  }, { passive: true });
})();
