/**
 * =============================================================================
 * VIDEO PLAYER
 * The ONLY listener for the "kryozen:project-open" event dispatched by
 * js/work.js (see PROJECT_RULES.md → "Video Player System"). This file
 * does not create a second project-opening system — it is purely a
 * consumer of the existing Phase 2 integration point.
 *
 * Responsibilities:
 *   1. Populate the single reusable <dialog id="player"> with the
 *      clicked project's title/category/description/software/video.
 *   2. Load the project's video with native controls, ready for the user
 *      to press play themselves — it never starts automatically, even
 *      though opening the player is itself a user action. Show a
 *      polished fallback if there is no video / it fails to load.
 *   3. Guarantee only one video ever plays: any previous video is torn
 *      down before a new one is built, and fully unloaded on close.
 *   4. Lock/restore background scroll while open.
 *   5. Animate open/close consistently across every close path (button,
 *      backdrop click, Escape) by intercepting the native "cancel"
 *      event rather than letting Escape close the dialog instantly.
 * =============================================================================
 */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var playerCfg = cfg.player || {};

  var dialog = document.getElementById("player");
  if (!dialog || typeof dialog.showModal !== "function") {
    // <dialog> markup missing, or showModal() unsupported in this
    // browser — fail silently. Project cards remain fully clickable and
    // keep dispatching the event; there's just no listener to act on it
    // here. Nothing else on the page depends on this file running.
    console.warn("[Kryozen] Video player unavailable (no <dialog> support or #player markup missing).");
    return;
  }

  var mediaEl = document.getElementById("player-media");
  var titleEl = document.getElementById("player-title");
  var categoryEl = document.getElementById("player-category");
  var descriptionEl = document.getElementById("player-description");
  var softwareEl = document.getElementById("player-software");
  var closeBtn = document.getElementById("player-close");

  if (closeBtn && playerCfg.closeLabel) {
    closeBtn.setAttribute("aria-label", playerCfg.closeLabel);
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CLOSE_ANIMATION_MS = reduceMotion ? 0 : 260;

  var ICON_NO_VIDEO =
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="20" cy="20" r="18"/><polygon points="16,13 28,20 16,27" fill="currentColor" stroke="none" opacity="0.5"/><line x1="10" y1="10" x2="30" y2="30"/></svg>';

  var currentVideoEl = null;
  var closeTimer = null;
  var isClosing = false;

  /** Fully stop and release any video currently attached to the player. */
  function teardownMedia() {
    if (currentVideoEl) {
      currentVideoEl.pause();
      currentVideoEl.removeAttribute("src");
      currentVideoEl.load(); // forces the browser to drop the buffered resource
      currentVideoEl = null;
    }
    if (mediaEl) mediaEl.innerHTML = "";
  }

  function renderFallback(reasonText) {
    if (!mediaEl) return;
    mediaEl.classList.add("player__media--fallback");

    var wrap = document.createElement("div");
    wrap.className = "player__fallback";

    var icon = document.createElement("span");
    icon.className = "player__fallback-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = ICON_NO_VIDEO;

    var text = document.createElement("p");
    text.className = "player__fallback-text";
    text.textContent = reasonText || playerCfg.videoUnavailableText || "Video unavailable.";

    wrap.appendChild(icon);
    wrap.appendChild(text);
    mediaEl.appendChild(wrap);
  }

  function renderVideo(src) {
    if (!mediaEl) return;
    mediaEl.classList.remove("player__media--fallback");

    var video = document.createElement("video");
    video.className = "player__video";
    video.controls = true;
    video.playsInline = true;
    video.preload = "none"; // never preload — only this file, only on open
    video.src = src;

    video.addEventListener(
      "error",
      function () {
        // Invalid/broken video URL — swap to the same polished fallback
        // used when no video is configured at all, rather than leaving
        // a broken native video element on screen.
        teardownMedia();
        renderFallback();
      },
      { once: true }
    );

    mediaEl.appendChild(video);
    currentVideoEl = video;
    // Deliberately no .play() call and no autoplay attribute here — the
    // video loads with native controls visible and stays paused until
    // the user presses play themselves. Opening the player is not
    // treated as consent to start playback.
  }

  function openPlayer(project) {
    if (!project) return;

    // Guarantees only one video ever plays, even if openPlayer is
    // somehow called again before a prior close finished.
    teardownMedia();

    if (titleEl) titleEl.textContent = project.title || "Untitled project";
    if (categoryEl) categoryEl.textContent = project.category || "";
    if (descriptionEl) descriptionEl.textContent = project.description || "";

    if (softwareEl) {
      softwareEl.innerHTML = "";
      if (Array.isArray(project.software) && project.software.length) {
        softwareEl.hidden = false;
        project.software.forEach(function (name) {
          var tag = document.createElement("span");
          tag.className = "player__software-tag";
          tag.textContent = name;
          softwareEl.appendChild(tag);
        });
      } else {
        softwareEl.hidden = true;
      }
    }

    if (project.video) {
      renderVideo(project.video);
    } else {
      renderFallback(playerCfg.noVideoText || "No video has been added for this project yet.");
    }

    window.clearTimeout(closeTimer);
    isClosing = false;
    dialog.classList.remove("is-closing");

    if (!dialog.open) {
      document.body.style.overflow = "hidden";
      dialog.showModal(); // native: moves focus in, traps it, sets aria-modal
    }

    // Force a reflow so the browser registers the pre-transition state
    // before .is-open changes it — same pattern as js/work.js's filter
    // transitions.
    void dialog.offsetWidth;
    dialog.classList.add("is-open");
  }

  function requestClose() {
    if (isClosing || !dialog.open) return;
    isClosing = true;
    dialog.classList.remove("is-open");
    dialog.classList.add("is-closing");

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      dialog.close(); // fires the "close" event below, which does cleanup
    }, CLOSE_ANIMATION_MS);
  }

  // Single source of truth for "the player is closed" cleanup — runs no
  // matter which path triggered the close (button, backdrop, or the
  // animated Escape path below).
  dialog.addEventListener("close", function () {
    window.clearTimeout(closeTimer);
    isClosing = false;
    dialog.classList.remove("is-open", "is-closing");
    teardownMedia();
    document.body.style.overflow = "";
  });

  // Native <dialog> fires "cancel" on Escape before it would close
  // instantly. Intercepting it routes Escape through the same animated
  // close path as every other close trigger, and this is also where
  // Escape's own close behavior is confirmed to work at all.
  dialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    requestClose();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", requestClose);
  }

  // Click on the dialog element's own backdrop area (not a descendant)
  // closes it — the standard pattern for native <dialog> click-outside.
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) requestClose();
  });

  // The integration point. This is the only file in the project that
  // listens for this event.
  document.addEventListener("kryozen:project-open", function (event) {
    openPlayer(event.detail);
  });
})();
