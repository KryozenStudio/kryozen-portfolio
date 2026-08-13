/**
 * =============================================================================
 * CONTENT LOADER
 * Reads window.SITE_CONFIG (config/site.config.js) and injects it into the
 * page. This is the only file that touches text content / hrefs / image
 * src — it exists so editing config/site.config.js is enough to update the
 * site without ever opening index.html.
 * =============================================================================
 */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.warn("[Kryozen] SITE_CONFIG not found — check that config/site.config.js loaded before content-loader.js.");
    return;
  }

  /** Small helper: set text content only if the element exists. */
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  /** Small helper: set an href only if the element + value exist. */
  function setHref(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.setAttribute("href", value);
  }

  /* -----------------------------------------------------------------
     MINIMAL MONOLINE SOCIAL ICON SET
     Original glyphs (not third-party logo assets) so the whole visual
     language — including icons — stays consistent with the site's
     monoline brand mark. Swap freely for brand SVGs later if desired.
  ----------------------------------------------------------------- */
  var ICONS = {
    discord:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="10" rx="5"/><circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M8 7 L9 4.4 M16 7 L15 4.4"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="4"/><polygon points="10,9.5 10,14.5 15,12" fill="currentColor" stroke="none"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="16.2" cy="7.8" r="0.9" fill="currentColor" stroke="none"/></svg>',
    link:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>',
  };

  /* -----------------------------------------------------------------
     BRAND / DOCUMENT META
  ----------------------------------------------------------------- */
  if (cfg.brand) {
    document.title = cfg.brand.name + (cfg.brand.tagline ? " — " + cfg.brand.tagline : "");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && cfg.brand.tagline) {
      metaDesc.setAttribute("content", cfg.brand.tagline + ". " + (cfg.hero && cfg.hero.intro ? cfg.hero.intro : ""));
    }
    setText("navbar-brand-word", cfg.brand.shortName || cfg.brand.name);
  }

  /* -----------------------------------------------------------------
     LOGO — navbar mark. The hero intro has its own supplied brand artwork.
  ----------------------------------------------------------------- */
  if (cfg.logo && cfg.logo.path) {
    document.querySelectorAll("[data-logo-img]").forEach(function (el) {
      el.setAttribute("src", cfg.logo.path);
      el.setAttribute("alt", cfg.logo.alt || cfg.brand.name + " logo");
    });
  }

  /* -----------------------------------------------------------------
     NAVBAR LINKS (desktop + mobile share the same config array)
  ----------------------------------------------------------------- */
  if (cfg.nav && Array.isArray(cfg.nav.links)) {
    var desktopList = document.getElementById("navbar-links");
    var mobileList = document.getElementById("navbar-mobile-links");

    cfg.nav.links.forEach(function (link) {
      if (desktopList) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "navbar__link";
        a.href = link.href;
        a.textContent = link.label;
        li.appendChild(a);
        desktopList.appendChild(li);
      }
      if (mobileList) {
        var mLi = document.createElement("li");
        var mA = document.createElement("a");
        mA.className = "navbar__mobile-link";
        mA.href = link.href;
        mA.textContent = link.label;
        mLi.appendChild(mA);
        mobileList.appendChild(mLi);
      }
    });
  }

  /* -----------------------------------------------------------------
     HERO
  ----------------------------------------------------------------- */
  if (cfg.hero) {
    setText("hero-eyebrow-text", cfg.hero.eyebrow);
    setText("hero-title", cfg.hero.heading);
    setText("hero-intro", cfg.hero.intro);

    if (cfg.hero.ctaPrimary) {
      setText("hero-cta-primary", cfg.hero.ctaPrimary.label);
      setHref("hero-cta-primary", cfg.hero.ctaPrimary.href);
    }
    if (cfg.hero.ctaSecondary) {
      setText("hero-cta-secondary", cfg.hero.ctaSecondary.label);
      setHref("hero-cta-secondary", cfg.hero.ctaSecondary.href);
    }
    if (cfg.hero.artwork) {
      var backdrop = document.querySelector(".hero__backdrop");
      if (backdrop) {
        backdrop.style.backgroundImage =
          "linear-gradient(180deg, rgba(8,8,10,0.55), var(--color-bg) 92%), url('" + cfg.hero.artwork + "')";
        backdrop.style.backgroundSize = "cover";
        backdrop.style.backgroundPosition = "center";
      }
    }
  }

  /* -----------------------------------------------------------------
     FOOTER
  ----------------------------------------------------------------- */
  if (cfg.footer) {
    var year = String(new Date().getFullYear());
    setText("footer-copy", (cfg.footer.copyright || "").replace("{year}", year));
    setText("footer-note", cfg.footer.note);
  }

  if (Array.isArray(cfg.social)) {
    var socialContainer = document.getElementById("footer-social");
    if (socialContainer) {
      cfg.social.forEach(function (item) {
        var a = document.createElement("a");
        a.className = "footer__social-link";
        a.href = item.href || "#";
        a.setAttribute("aria-label", item.name);
        a.innerHTML = ICONS[item.icon] || ICONS.link;
        socialContainer.appendChild(a);
      });
    }
  }
})();
