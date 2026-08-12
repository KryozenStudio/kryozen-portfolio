/**
 * =============================================================================
 * CONTACT SECTION
 * No form — see PROJECT_RULES.md → "Contact Section" → "No contact
 * form" for why. Every method link is either config.contact.email or an
 * entry from the existing config.social array (the same links the
 * footer already renders); nothing about Discord/YouTube/etc. is
 * duplicated here.
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
    youtube:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="4"/><polygon points="10,9.5 10,14.5 15,12" fill="currentColor" stroke="none"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="16.2" cy="7.8" r="0.9" fill="currentColor" stroke="none"/></svg>',
    twitter:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
  };

  /* -----------------------------------------------------------------
     BUILD METHOD LIST — email first (if configured), then every entry
     already in config.social, reused as-is.
  ----------------------------------------------------------------- */
  var methods = [];

  if (contactCfg.email) {
    methods.push({
      name: "Email",
      value: contactCfg.email,
      href: "mailto:" + contactCfg.email,
      icon: "email",
      external: false,
    });
  }

  if (Array.isArray(cfg.social)) {
    cfg.social.forEach(function (item) {
      if (!item || !item.name) return; // skip malformed entries
      methods.push({
        name: item.name,
        value: item.href && item.href !== "#" ? item.href.replace(/^https?:\/\//, "") : "Link coming soon",
        href: item.href || "#",
        icon: item.icon,
        external: true,
      });
    });
  }

  if (!methods.length) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.textContent = contactCfg.emptyStateText || "Contact links coming soon.";
    }
    return;
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

    link.appendChild(icon);
    link.appendChild(text);
    fragment.appendChild(link);
  });

  methodsContainer.appendChild(fragment);
  if (emptyState) emptyState.hidden = true;
})();
