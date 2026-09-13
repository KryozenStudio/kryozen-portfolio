/**
 * =============================================================================
 * CONTACT SECTION
 * No form — see PROJECT_RULES.md → "Contact Section" → "No contact
 * form" for why. Every method link is either config.contact.email or an
 * entry from the existing config.social array (the same links the
 * footer already renders); only the direct Discord contact method is rendered here; discovery links stay in the footer.
 * =============================================================================
 */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.warn("[Kryozen] SITE_CONFIG not found — check that config/site.config.js loaded before js/contact.js.");
    return;
  }

  var methodsContainer = document.getElementById("contact-methods");
  if (!methodsContainer) return; // Contact section markup isn't on this page.

  var emptyState = document.getElementById("contact-empty");
  var contactCfg = cfg.contact || {};

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  setText("contact-eyebrow-text", contactCfg.eyebrow);
  setText("contact-title", contactCfg.heading);
  setText("contact-subtitle", contactCfg.subtitle);

  /* -----------------------------------------------------------------
     ICONS — a local copy of the same handful of monoline glyphs
     js/content-loader.js uses for the footer, plus one new "email"
     glyph. Kept local rather than imported, matching the existing
     precedent already set by js/work.js's own local icon set.
  ----------------------------------------------------------------- */
  var ICONS = {
    email:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>',
    discord:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="10" rx="5"/><circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M8 7 L9 4.4 M16 7 L15 4.4"/></svg>',
  };

  /* -----------------------------------------------------------------
     BUILD METHOD LIST — only direct contact methods belong here.
     Social discovery stays in the footer. Discord is pushed before
     Email deliberately: this array's order is the render order (each
     entry becomes the next appended <a>, see the forEach near the
     bottom of this file), so which push happens first is the only
     thing that decides which method appears first on the page.
  ----------------------------------------------------------------- */
  var methods = [];

  if (Array.isArray(cfg.social)) {
    cfg.social.forEach(function (item) {
      if (!item || item.name !== "Discord" || !item.href) return;
      methods.push({
        name: "Discord",
        value: item.href.replace(/^https?:\/\//, ""),
        href: item.href,
        icon: "discord",
        external: true,
      });
    });
  }

  if (contactCfg.email) {
    methods.push({
      name: "Email",
      value: contactCfg.email,
      href: "mailto:" + contactCfg.email,
      icon: "email",
      external: false,
    });
  }

  if (!methods.length) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.textContent = contactCfg.emptyStateText || "No contact methods are currently available.";
    }
    return;
  }

  /* -----------------------------------------------------------------
     CLIPBOARD + TOAST — shared by every method row below. One toast
     element, created once and reused, rather than one per click.
  ----------------------------------------------------------------- */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for browsers/contexts without the async Clipboard API
    // (older browsers, or a non-secure-context http:// preview).
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) resolve(); else reject(new Error("execCommand copy failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  var toastEl = null;
  var toastTimer = null;
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "contact__toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // Force the entrance animation to restart on a second rapid click:
    // removing the class, then reading offsetWidth (forces a style
    // recalc/reflow before the class goes back on) is the standard way
    // to make a browser treat the re-add as a fresh animation start
    // rather than a no-op because the class was "already set".
    toastEl.classList.remove("is-visible");
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  var fragment = document.createDocumentFragment();
  methods.forEach(function (method) {
    var link = document.createElement("a");
    link.className = "contact__method";
    link.href = method.href;
    if (method.external) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    link.setAttribute("aria-label", method.name + (method.value ? " — " + method.value : ""));

    var icon = document.createElement("span");
    icon.className = "contact__method-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = ICONS[method.icon] || ICONS.email;

    var text = document.createElement("span");
    text.className = "contact__method-text";

    var name = document.createElement("span");
    name.className = "contact__method-name";
    name.textContent = method.name;

    var value = document.createElement("span");
    value.className = "contact__method-value";
    value.textContent = method.value || "";

    text.appendChild(name);
    text.appendChild(value);

    var arrow = document.createElement("span");
    arrow.className = "contact__method-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";

    link.appendChild(icon);
    link.appendChild(text);
    link.appendChild(arrow);

    // "Click to copy" per the brief — a plain click copies the value
    // (email address / Discord link) and shows a toast, rather than
    // firing the link's own default navigation. Modifier-clicks and
    // middle-clicks are deliberately left alone (see the guard below)
    // so opening in a new tab, or a screen reader/keyboard user's
    // expectation of "this is a link", still works the normal way —
    // only the plain, primary-button click is intercepted.
    if (method.value) {
      link.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        copyToClipboard(method.value)
          .then(function () {
            showToast(method.name + " copied to clipboard!");
          })
          .catch(function () {
            // Clipboard API unavailable/denied (e.g. non-secure context,
            // permission blocked) — fall back to the link's normal
            // behavior instead of the click silently doing nothing.
            window.open(link.href, method.external ? "_blank" : "_self", "noopener");
          });
      });
    }

    fragment.appendChild(link);
  });

  methodsContainer.appendChild(fragment);
  if (emptyState) emptyState.hidden = true;
})();
