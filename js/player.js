/**
 * =============================================================================
 * VIDEO PLAYER
 * The ONLY listener for the "kryozen:project-open" event dispatched by
 * js/category-page.js (see PROJECT_RULES.md → "Video Player System").
 * This file does not create a second project-opening system — it is
 * purely a consumer of the existing integration point.
 *
 * Videos are unlisted YouTube uploads (see PROJECT_RULES.md → "Video
 * Hosting"). There is no local/self-hosted video path, no upload system,
 * and no backend — a project just carries a youtubeUrl string (the full
 * URL as copied from YouTube, not a pre-extracted ID — see
 * extractYouTubeId() below).
 *
 * Responsibilities:
 *   1. Populate the single reusable <dialog id="player"> with the
 *      clicked project's title/category/description/software/video.
 *   2. Build a YouTube /embed/ iframe for project.youtubeUrl. Show a
 *      polished fallback if there is no youtubeUrl, or it's not
 *      recognized as one.
 *   3. Guarantee only one iframe ever exists: any previous one is torn
 *      down before a new one is built, and fully removed on close —
 *      removing the iframe (not just navigating it) is what actually
 *      stops YouTube playback, and it's the only way to guarantee a
 *      project's embed is never left running or recreated needlessly.
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

  var closeTimer = null;
  var isClosing = false;

  /** Remove any iframe/fallback currently in the media area. Removing
   *  the iframe element itself (rather than e.g. blanking its src) is
   *  what stops YouTube playback — there is no other teardown step
   *  needed for an embed. */
  function teardownMedia() {
    if (mediaEl) {
      mediaEl.innerHTML = "";
      mediaEl.classList.remove("player__media--fallback", "player__media--video");
    }
  }

  function renderFallback(reasonText) {
    if (!mediaEl) return;
    mediaEl.classList.remove("player__media--video");
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

  /** Accepts the full YouTube URL as copied from the address bar or share
   *  sheet — youtubeUrl is the one source of truth (see PROJECT_RULES.md
   *  → "Video Hosting"); nothing pre-extracts or duplicates the ID into
   *  config data. Recognizes the two formats YouTube actually produces
   *  (youtube.com/watch?v=, youtu.be/), plus youtube.com/embed/ in case
   *  someone pastes an embed URL directly — all three optionally under
   *  www./m. subdomains and with extra query params (e.g. &t=30s), since
   *  a pasted URL from a real browser address bar often carries some.
   *  Returns the bare 11-character video ID, or null if the string isn't
   *  a recognizable YouTube URL at all. */
  function extractYouTubeId(url) {
    if (!url || typeof url !== "string") return null;
    // Covers watch/embed/youtu.be links (original), plus Shorts
    // (youtube.com/shorts/ID) and Live (youtube.com/live/ID) links, which
    // were previously unrecognized — a Shorts link is exactly what's most
    // likely to get pasted in for Short Form / Gaming / Anime-AMV
    // projects, so a project using one would silently fall back to
    // "video unavailable" even though the link itself was completely
    // valid.
    var match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function renderYouTube(youtubeUrl) {
    if (!mediaEl) return;
    var videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      renderFallback();
      return;
    }
    mediaEl.classList.remove("player__media--fallback");
    mediaEl.classList.add("player__media--video");

    var iframe = document.createElement("iframe");
    iframe.className = "player__iframe";
    // rel=0 limits "related videos" at the end to the same channel;
    // playsinline keeps iOS from forcing native fullscreen on play.
    iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(videoId) + "?rel=0&playsinline=1";
    iframe.title = "YouTube video player";
    iframe.setAttribute("frameborder", "0");
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    // Deliberately no autoplay param — opening the player is not
    // treated as consent to start playback; the visitor presses play
    // themselves inside YouTube's own controls.

    mediaEl.appendChild(iframe);
  }

  function openPlayer(project) {
    if (!project) return;

    // Guarantees only one embed ever exists, even if openPlayer is
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

    if (project.youtubeUrl) {
      renderYouTube(project.youtubeUrl);
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
    // before .is-open changes it — same pattern as js/category-page.js's
    // filter transitions.
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
