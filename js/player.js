/**
 * =============================================================================
 * VIDEO PLAYER
 * The ONLY listener for the "kryozen:project-open" event dispatched by
 * js/category-page.js (see PROJECT_RULES.md → "Video Player System").
 * This file does not create a second project-opening system — it is
 * purely a consumer of the existing integration point. The event's
 * detail is {project, originEl}: project is the clicked card's data,
 * originEl is the card's own <button> element, used below to animate
 * the player expanding out of that card's on-screen position/size
 * rather than simply fading in centered (see openPlayer()/computeFlip()).
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
 *   6. When the clicked card is still on screen, animate the dialog
 *      to/from that card's exact position and size (a "FLIP" — First,
 *      Last, Invert, Play) instead of the plain centered fade, so
 *      opening/closing a project reads as one continuous transformation
 *      of the card itself rather than an unrelated modal appearing on
 *      top. Falls back to the plain fade automatically whenever there's
 *      no usable origin (card scrolled out of the DOM via a re-render,
 *      reduced-motion, etc.) — see computeFlip().
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
  // FLIP close runs longer than the plain fade (var(--duration-expand) in
  // css/player.css) — a card visibly travelling and resizing back to its
  // grid position needs more time to read as deliberate than a same-spot
  // opacity fade does. Kept in sync with player.css's own
  // #player.is-flip.is-closing transition-duration by hand, the same way
  // CLOSE_ANIMATION_MS above already tracks --duration-base.
  var CLOSE_ANIMATION_MS_FLIP = reduceMotion ? 0 : 520;

  // The project-card <button> the player is currently "expanded from," if
  // the most recent open used a FLIP transition — set in openPlayer(),
  // read (and re-measured live) in requestClose() so the close animation
  // travels back to wherever that card is now, not where it was when the
  // player opened (the visitor could have scrolled in between).
  var lastOriginEl = null;

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

  /** Returns originEl's current viewport rect, or null if there's no
   *  usable origin to FLIP from — covers both "no card was involved"
   *  (originEl undefined) and "the card was, but it's since left the
   *  DOM" (a search/filter re-render replaces the whole grid — see
   *  js/category-page.js's render(), which does grid.innerHTML = "").
   *  A detached element's getBoundingClientRect() silently returns all
   *  zeros rather than throwing, which would otherwise animate the
   *  player collapsing to the top-left corner of the screen — checking
   *  isConnected first avoids ever measuring a detached node. */
  function computeFlip(originEl) {
    if (!originEl || !originEl.isConnected) return null;
    var rect = originEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return rect;
  }

  function openPlayer(project, originEl) {
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
    dialog.classList.remove("is-closing", "is-flip");
    lastOriginEl = null;
    dialog.style.removeProperty("--flip-close-transform");

    var wasAlreadyOpen = dialog.open;
    if (!wasAlreadyOpen) {
      document.body.style.overflow = "hidden";
      dialog.showModal(); // native: moves focus in, traps it, sets aria-modal
    }

    // Force a reflow so the browser has laid the dialog out at its real
    // centered size/position — needed both for the existing base-fade
    // path (registers the pre-transition state before .is-open changes
    // it) and, now, so getBoundingClientRect() below reads real numbers.
    void dialog.offsetWidth;

    // Only FLIP on a genuine fresh open from a card click. Re-opening
    // while already open (shouldn't normally happen — cards are inert
    // once the dialog is up — but openPlayer has no other guard against
    // it) skips FLIP rather than animating from a rect measured against
    // whatever the dialog's mid-transition size happened to be.
    var originRect = wasAlreadyOpen ? null : computeFlip(originEl);

    if (originRect) {
      var targetRect = dialog.getBoundingClientRect();
      var dx = (originRect.left + originRect.width / 2) - (targetRect.left + targetRect.width / 2);
      var dy = (originRect.top + originRect.height / 2) - (targetRect.top + targetRect.height / 2);
      // Floor guards against a division producing something absurd if
      // the dialog were ever laid out at 0 size — clamps to a barely-
      // visible speck rather than Infinity/NaN.
      var sx = Math.max(originRect.width / Math.max(targetRect.width, 1), 0.04);
      var sy = Math.max(originRect.height / Math.max(targetRect.height, 1), 0.04);

      dialog.style.transition = "none";
      dialog.style.opacity = "0";
      dialog.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")";
      void dialog.offsetWidth; // commit that starting state before re-enabling transitions below
      dialog.style.transition = "";
      dialog.classList.add("is-flip");
      lastOriginEl = originEl;
    } else {
      dialog.style.transform = "";
      dialog.style.opacity = "";
    }

    // Whether or not FLIP engaged above, clearing the inline
    // transform/opacity here hands control back to the stylesheet:
    // #player.is-open (base fade) or #player.is-flip.is-open (FLIP,
    // longer duration/different ease — see css/player.css) becomes the
    // animation target, and the browser tweens from whatever was just
    // committed (either the FLIP starting point or nothing at all) to
    // it in one motion.
    dialog.style.transform = "";
    dialog.style.opacity = "";
    dialog.classList.add("is-open");
  }

  function requestClose() {
    if (isClosing || !dialog.open) return;
    isClosing = true;

    var usingFlip = dialog.classList.contains("is-flip");
    var closeRect = usingFlip ? computeFlip(lastOriginEl) : null;

    if (closeRect) {
      // Re-measured live rather than reusing the rect captured at open
      // time — the visitor may have scrolled while the player was open,
      // so "back to the card" means back to wherever it is now.
      var currentRect = dialog.getBoundingClientRect();
      var dx = (closeRect.left + closeRect.width / 2) - (currentRect.left + currentRect.width / 2);
      var dy = (closeRect.top + closeRect.height / 2) - (currentRect.top + currentRect.height / 2);
      var sx = Math.max(closeRect.width / Math.max(currentRect.width, 1), 0.04);
      var sy = Math.max(closeRect.height / Math.max(currentRect.height, 1), 0.04);
      dialog.style.setProperty("--flip-close-transform", "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")");
    } else {
      // Card isn't on screen to travel back to (re-rendered away, or
      // this open never used FLIP) — #player.is-closing's own default
      // transform (a plain small scale/translate fade, see css/player.css)
      // applies since --flip-close-transform is left unset.
      dialog.classList.remove("is-flip");
    }

    dialog.classList.remove("is-open");
    dialog.classList.add("is-closing");

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      dialog.close(); // fires the "close" event below, which does cleanup
    }, closeRect ? CLOSE_ANIMATION_MS_FLIP : CLOSE_ANIMATION_MS);
  }

  // Single source of truth for "the player is closed" cleanup — runs no
  // matter which path triggered the close (button, backdrop, or the
  // animated Escape path below).
  dialog.addEventListener("close", function () {
    window.clearTimeout(closeTimer);
    isClosing = false;
    dialog.classList.remove("is-open", "is-closing", "is-flip");
    dialog.style.removeProperty("--flip-close-transform");
    lastOriginEl = null;
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
  // listens for this event. detail is {project, originEl} — see this
  // file's top comment and js/category-page.js's dispatch site.
  document.addEventListener("kryozen:project-open", function (event) {
    var detail = event.detail || {};
    openPlayer(detail.project, detail.originEl);
  });
})();
