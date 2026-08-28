(function(){
  "use strict";
  // Homepage intro is intentionally replayable on each page entry.
  // Only prefers-reduced-motion suppresses the animation (handled in index.html).

  /* -----------------------------------------------------------------
     TIMELINE READOUT — drives the live HH:MM:SS:FF digits in
     .hero__ticker (see css/hero.css). Purely a brand/atmosphere detail,
     not real elapsed time or a countdown to anything — it starts at
     00:00:00:00 on every load and counts up for as long as the hero is
     on screen. Reduced-motion users get a single static frame instead
     of a running counter (the scrubbing playhead is already stopped via
     CSS — see hero.css's reduced-motion block).
  ----------------------------------------------------------------- */
  var timeEl = document.getElementById("hero-ticker-time");
  if (!timeEl) return;

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n, len) {
    var s = String(Math.floor(n));
    while (s.length < len) s = "0" + s;
    return s;
  }

  function format(elapsedMs) {
    var totalFrames = Math.floor(elapsedMs / (1000 / 24)); // 24fps "frame" digit, cosmetic only
    var frames = totalFrames % 24;
    var totalSeconds = Math.floor(totalFrames / 24);
    var seconds = totalSeconds % 60;
    var totalMinutes = Math.floor(totalSeconds / 60);
    var minutes = totalMinutes % 60;
    var hours = Math.floor(totalMinutes / 60);
    return pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + ":" + pad(frames, 2);
  }

  if (reduceMotion) {
    timeEl.textContent = format(7000); // one plausible-looking still frame, not a running counter
    return;
  }

  var start = null;
  var lastPaint = 0;
  var rafId = null;

  function tick(now) {
    if (start === null) start = now;
    // Throttled to ~12 updates/sec — the frame digit only needs to look
    // alive, not actually render at 24fps; a full rAF-rate DOM write
    // would be wasted work for a decorative counter nobody is timing.
    if (now - lastPaint >= 83) {
      timeEl.textContent = format(now - start);
      lastPaint = now;
    }
    rafId = window.requestAnimationFrame(tick);
  }

  // Pause entirely when the tab isn't visible rather than letting a
  // purely decorative counter keep waking the main thread in the
  // background — resumes (with the elapsed-time base intact) when the
  // tab is foregrounded again.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
    } else if (rafId === null) {
      lastPaint = 0;
      rafId = window.requestAnimationFrame(tick);
    }
  });

  rafId = window.requestAnimationFrame(tick);
})();
