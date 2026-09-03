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
    ".category-strip__head",
    ".services__head",
    ".service-card",
    ".about__layout",
    ".faq__head",
    ".faq__item",
    ".contact__inner",
    ".footer__inner"
  ];

  // A second, narrower set: just the big section headings, each nested
  // inside one of the blocks above. These get their own class
  // (text-reveal, defined in css/base.css) — a left-to-right clip-path
  // wipe, the same gesture the hero wordmark and category-page title
  // already use (css/hero.css, css/category-page.css) — layered on top
  // of, not instead of, the parent block's own fade/translateY.
  //
  // Deliberately NOT observed by IntersectionObserver directly, unlike
  // everything in `selectors` above: a target sitting at
  // clip-path: inset(0 100% 0 0) is, correctly, 0% visible on screen,
  // and Chromium's intersection ratio reflects that actual rendered
  // (post-clip) visibility — so a self-clipped element can never report
  // isIntersecting: true to trigger the very class that would un-clip
  // it. Instead, each one rides along with whichever observed
  // .section-reveal ancestor contains it (see the observer callback
  // below) — that ancestor has ordinary, unclipped geometry, so its own
  // intersection detection is unaffected and was already proven to work
  // before text-reveal existed.
  var textRevealSelectors = [
    "#category-strip-title",
    ".services__title",
    ".about__title",
    ".faq__title",
    ".contact__title"
  ];

  // Grid/list children that should cascade in one-after-another rather
  // than all reveal simultaneously the moment their shared row crosses
  // the IntersectionObserver threshold (see --stagger-i in
  // css/base.css's .section-reveal). Capped, same reasoning as the
  // project-card stagger in js/category-page.js: a long list shouldn't
  // stretch the entrance out to something that reads as slow.
  var staggerSelectors = { ".service-card": true, ".faq__item": true };

  var elements = [];
  selectors.forEach(function (selector) {
    var i = 0;
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add("section-reveal");
      if (staggerSelectors[selector]) {
        el.style.setProperty("--stagger-i", Math.min(i, 8));
        i++;
      }
      elements.push(el);
    });
  });

  var orphanTextReveals = []; // see the defensive fallback below
  textRevealSelectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add("text-reveal");
      if (!el.closest(selectors.join(","))) orphanTextReveals.push(el);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach(function (el) { el.classList.add("is-visible"); });
    orphanTextReveals.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      // Carry any nested .text-reveal heading along with its container —
      // see the big comment above textRevealSelectors for why these are
      // never observed on their own.
      entry.target.querySelectorAll(".text-reveal").forEach(function (child) {
        child.classList.add("is-visible");
      });
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

  // Defensive fallback: a .text-reveal element with no .section-reveal
  // ancestor has no observed parent to ride along with, and (per the
  // comment above) can't safely be observed on its own — so it's simply
  // revealed immediately, unanimated, rather than left permanently
  // clipped. Shouldn't trigger for any of the five current
  // textRevealSelectors targets (each has a real ancestor in
  // `selectors`) — this only guards against a future one being added
  // without its own wrapping block.
  orphanTextReveals.forEach(function (el) { el.classList.add("is-visible"); });

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
        el.querySelectorAll(".text-reveal").forEach(function (child) {
          child.classList.add("is-visible");
        });
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
