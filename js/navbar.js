/**
 * =============================================================================
 * NAVBAR BEHAVIOR
 * Two responsibilities only: toggle the glass background once the page has
 * scrolled, and drive the mobile menu panel. Scroll handling is
 * rAF-throttled to stay off the main thread as much as possible.
 * =============================================================================
 */

(function () {
  "use strict";

  var nav = document.querySelector(".navbar");
  if (!nav) return;

  /* -----------------------------------------------------------------
     SCROLL → GLASS STATE
  ----------------------------------------------------------------- */
  var ticking = false;
  var SCROLL_THRESHOLD = 24;

  function updateScrollState() {
    nav.classList.toggle("navbar--scrolled", window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateScrollState();

  /* -----------------------------------------------------------------
     MOBILE MENU
  ----------------------------------------------------------------- */
  var toggle = document.querySelector(".navbar__toggle");
  var panel = document.getElementById("navbar-mobile-panel");
  var closeButton = document.getElementById("navbar-mobile-close");

  if (toggle && panel) {
    var closeMenu = function () {
      toggle.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    var openMenu = function () {
      toggle.setAttribute("aria-expanded", "true");
      panel.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    if (closeButton) closeButton.addEventListener("click", closeMenu);

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on any link tap inside the panel (links are injected later by
    // content-loader.js, so delegate from the panel itself).
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    // If the viewport grows past the mobile breakpoint while the panel
    // is open (e.g. rotating a tablet), close it so state can't get stuck.
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 860) closeMenu();
    });
  }
})();
