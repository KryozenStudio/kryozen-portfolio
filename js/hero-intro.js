/**
 * =============================================================================
 * HERO INTRO — session bookkeeping
 * The actual reveal animation is pure CSS (see css/hero.css). This file's
 * only job is remembering that the intro already played, so a visitor
 * navigating between pages/reloading later in the same session sees the
 * end state immediately instead of the animation replaying.
 *
 * The *first-paint* skip decision (prefers-reduced-motion, or an already-
 * played session) happens in the small inline script in index.html, which
 * has to run before CSS paints to avoid a flash of the animated state.
 * This file only writes the "played" flag once the intro has actually
 * finished.
 * =============================================================================
 */

(function () {
  "use strict";

  var STORAGE_KEY = "kryozenIntroPlayed";
  var root = document.documentElement;

  function buildWordmark() {
    var title=document.querySelector(".hero__title[data-wordmark]");
    if(!title||title.dataset.split==="true") return;
    var text=title.getAttribute("data-wordmark")||title.textContent||"";
    title.textContent="";
    var i=0;
    Array.from(text).forEach(function(ch){
      if(ch===" "){var space=document.createElement("span");space.className="hero__title-space";space.setAttribute("aria-hidden","true");title.appendChild(space);return;}
      var span=document.createElement("span");span.className="hero__title-char";span.style.setProperty("--i",i++);span.textContent=ch;title.appendChild(span);
    });
    title.dataset.split="true";
  }

  function markPlayed() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (err) {
      // Storage can throw in private-browsing contexts — non-critical,
      // it just means the intro may replay next load. Fail silently.
    }
  }

  buildWordmark();

  // Intro was already skipped at paint time (reduced motion, or replayed
  // within this session) — nothing to wait for.
  if (root.classList.contains("no-intro")) {
    markPlayed();
    return;
  }

  var scrollCue = document.querySelector(".hero__scroll");
  if (scrollCue) {
    scrollCue.addEventListener("animationend", markPlayed, { once: true });
  }

  // Safety net in case the listener above never fires for any reason
  // (e.g. markup changes later). Comfortably longer than --duration-intro.
  window.setTimeout(markPlayed, 3200);
})();
