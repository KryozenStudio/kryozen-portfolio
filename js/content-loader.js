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

  /**
   * The hero wordmark ("KRYOZEN" / "STUDIO") is deliberately two separate
   * <span class="hero__wordmark-line--main/--sub"> elements, not plain
   * text — hero.css's brand-reveal choreography animates each one in on
   * its own delay (see "LOGO ANIMATION" in hero.css). Using the generic
   * setText() helper here would set #hero-title's textContent directly,
   * which *replaces* those two child spans with a single unstyled text
   * node — silently destroying the whole two-line reveal on every page
   * load. This updates each line's text in place instead, so the markup
   * (and the animation that depends on it) survives content injection.
   */
  function setWordmark(id, heading) {
    var el = document.getElementById(id);
    if (!el || !heading) return;
    var mainEl = el.querySelector(".hero__wordmark-line--main");
    var subEl = el.querySelector(".hero__wordmark-line--sub");
    var parts = heading.split(" ");
    var mainText = parts.shift();
    var subText = parts.join(" ");
    if (mainText && mainEl) mainEl.textContent = mainText;
    if (subText && subEl) subEl.textContent = subText;
    el.setAttribute("data-wordmark", heading);
  }

  /** Small helper: set an href only if the element + value exist. */
  function setHref(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.setAttribute("href", value);
  }

  /**
   * Section hrefs in config.nav.links are always written relative to the
   * homepage ("#work", "#about", ...) — that's correct as-is on
   * index.html, but on every other page (the category pages) an in-page
   * anchor with nothing to scroll to just does nothing when clicked.
   * Prefix those with "index.html" on any non-homepage page, matching
   * the pattern already used by the category page's own "← All work"
   * link (href="index.html#work").
   */
  function normalizeNavHref(href) {
    if (!href || href.charAt(0) !== "#") return href;
    var isHome = /(^|\/)(index\.html)?$/.test(window.location.pathname);
    return isHome ? href : "index.html" + href;
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
    // Mobile link strip: the same six links, shown directly in the bar
    // below 860px instead of only inside the hamburger panel (see
    // .navbar__mobile-strip in navbar.css). Optional element — pages
    // without it (there are none currently, but keep this defensive)
    // just skip this list.
    var stripList = document.getElementById("navbar-strip-links");

    cfg.nav.links.forEach(function (link) {
      var href = normalizeNavHref(link.href);

      if (desktopList) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "navbar__link";
        a.href = href;
        a.textContent = link.label;
        li.appendChild(a);
        desktopList.appendChild(li);
      }
      if (mobileList) {
        var mLi = document.createElement("li");
        var mA = document.createElement("a");
        mA.className = "navbar__mobile-link";
        mA.href = href;
        mA.textContent = link.label;
        mLi.appendChild(mA);
        mobileList.appendChild(mLi);
      }
      if (stripList) {
        var sLi = document.createElement("li");
        var sA = document.createElement("a");
        sA.className = "navbar__strip-link";
        sA.href = href;
        sA.textContent = link.label;
        sLi.appendChild(sA);
        stripList.appendChild(sLi);
      }
    });
  }

  /* -----------------------------------------------------------------
     HERO
  ----------------------------------------------------------------- */
  if (cfg.hero) {
    setText("hero-eyebrow-text", cfg.hero.eyebrow);
    setWordmark("hero-title", cfg.hero.heading);
    setText("hero-intro", cfg.hero.intro);

    if (cfg.hero.ctaPrimary) {
      setText("hero-cta-primary", cfg.hero.ctaPrimary.label);
      setHref("hero-cta-primary", cfg.hero.ctaPrimary.href);
    }
    if (cfg.hero.ctaSecondary) {
      setText("hero-cta-secondary", cfg.hero.ctaSecondary.label);
      setHref("hero-cta-secondary", cfg.hero.ctaSecondary.href);
    }
    // Hero background is intentionally CSS-only.
    // Do not inject raster artwork here: the previous artwork contained
    // embedded branding that appeared as an unwanted background logo.
    var backdrop = document.querySelector(".hero__backdrop");
    if (backdrop) {
      backdrop.style.backgroundImage = "";
      backdrop.style.backgroundSize = "";
      backdrop.style.backgroundPosition = "";
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
