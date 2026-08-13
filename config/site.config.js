/**
 * =============================================================================
 * KRYOZEN STUDIO — SITE CONFIGURATION
 * =============================================================================
 * This is the ONLY file most content edits should require. It is read by
 * /js/content-loader.js and injected into the page at runtime, so you can
 * change text, links, and image paths here without touching the HTML/CSS
 * layout.
 *
 * Colors/theme live in /css/variables.css (see the "COLOR SYSTEM" comment
 * at the top of that file) since they need to be real CSS custom properties.
 * =============================================================================
 */

window.SITE_CONFIG = {

  // ---------------------------------------------------------------------
  // BRAND
  // ---------------------------------------------------------------------
  brand: {
    name: "KRYOZEN STUDIO",
    shortName: "KRYOZEN",
    // Shown in the browser tab.
    tagline: "Video Editing & Post-Production",
  },

  // ---------------------------------------------------------------------
  // LOGO — used in the navbar and the hero intro animation
  // ---------------------------------------------------------------------
  logo: {
    path: "assets/images/logo/logo.svg",
    alt: "Kryozen Studio logo",
    // Set true if you swap logo.svg for a PNG/WebP/JPG file.
    isRaster: false,
  },

  // ---------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------
  nav: {
    links: [
      { label: "Home", href: "#top" },
      { label: "Work", href: "#work" },
      { label: "Services", href: "#services" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
    // Rendered as a distinct pill/button at the end of the nav, separate
    // from the links array above.
    discord: {
      label: "Discord",
      href: "https://discordapp.com/users/1375134237455417444",
    },
  },

  // ---------------------------------------------------------------------
  // HERO
  // ---------------------------------------------------------------------
  hero: {
    eyebrow: "REEL 001 — SHOWREEL",
    heading: "KRYOZEN STUDIO",
    intro:
      "I edit short-form, gaming, and anime content — built around beat sync, clean typography and captions, and thoughtful compositing.",
    ctaPrimary: {
      label: "View Work",
      href: "#work",
    },
    ctaSecondary: {
      label: "Discord",
      href: "https://discordapp.com/users/1375134237455417444",
    },
    // Optional background still — leave empty to use the default gradient.
    // Example: "assets/images/hero/hero-artwork.webp"
    artwork: "",
  },

  // ---------------------------------------------------------------------
  // SOCIAL / CONTACT LINKS — used in the navbar Discord pill and footer
  // ---------------------------------------------------------------------
  social: [
    { name: "Discord", href: "https://discordapp.com/users/1375134237455417444", icon: "discord" },
    { name: "Instagram", href: "https://www.instagram.com/kryozen_nv?igsh=MXF4MmMzNGduc2JnMQ==", icon: "instagram" },
  ],

  // ---------------------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------------------
  footer: {
    // {year} is replaced automatically with the current year.
    copyright: "© {year} Kryozen Studio. All rights reserved.",
    note: "Edits available worldwide, remote & async.",
  },

  // ---------------------------------------------------------------------
  // WORK / PORTFOLIO — section copy + behavior text. Read by js/work.js.
  // ---------------------------------------------------------------------
  work: {
    eyebrow: "REEL 002 — WORK",
    heading: "Selected Work",
    subtitle: "A growing collection of edits across formats — filter by category or search by title.",
    searchLabel: "Search projects",
    searchPlaceholder: "Search projects…",
    allLabel: "All",
    emptyStateText: "No projects found.",
  },

  // ---------------------------------------------------------------------
  // WORK CATEGORIES
  // Add or remove categories here — the filter chips in the Work section
  // are generated entirely from this array. Each project's `category`
  // field (below) must match one of these strings exactly.
  //
  // These represent actual project/content formats only — not services,
  // techniques, or client industries. "Long Form" stays in this list as
  // a genuine future category (no fake projects behind it yet — see the
  // note on `projects` below). Things like captions/subtitles or a
  // client's industry (e.g. SaaS) are project attributes, not formats,
  // so they don't belong here — if that metadata is ever needed, add a
  // `tags` or `industry` field to individual projects instead of
  // inventing a new category.
  // ---------------------------------------------------------------------
  categories: [
    "Short Form",
    "Gaming",
    "Anime / AMV",
    "Long Form",
    "Thumbnail Design",
  ],

  // =========================================================================
  // ABOUT — read by js/about.js. Extends the `about` object first added in
  // Phase 1 (only `profileImage` existed then, as an empty placeholder).
  // Name/brand is intentionally NOT duplicated here — about.js reads
  // `brand.shortName` directly (see PROJECT_RULES.md → "About Section").
  // =========================================================================
  about: {
    eyebrow: "REEL 003 — ABOUT",
    heading: "About",
    role: "Video Editor",
    profileImage: "assets/images/profile/profile.jpg",
    intro: "The person behind the cuts.",
    bio: "I study references closely — rhythm, timing, composition — then work to capture what makes them click before folding in my own read on the footage. Right now that's short-form, gaming, and anime edits, with a focus on beat sync, clean typography and captions, and compositing. Still building out my process, and always looking to get sharper.",
  },

  // Software / tools strip shown in the About section. Only the tool name
  // is required — `icon` is reserved for later and safe to leave empty.
  // This is the editor's actual current (mobile) toolkit — only list
  // software that's been explicitly confirmed. Update this array when
  // moving to PC software; nothing else needs to change.
  software: [
    { name: "Node Video", icon: "" },
  ],

  // =========================================================================
  // SERVICES SECTION COPY — read by js/services.js. Kept separate from the
  // `services` data array below, the same way `work` (copy) is kept
  // separate from `categories`/`projects` (data).
  // =========================================================================
  servicesSection: {
    eyebrow: "REEL 004 — SERVICES",
    heading: "Services",
    subtitle: "What I offer, in plain terms.",
    emptyStateText: "No services listed yet.",
  },

  // Services offered — rendered as cards by js/services.js. Each entry
  // needs at minimum `id` and `title`; `description` and `icon` are
  // optional and the layout holds up fine without them (see
  // PROJECT_RULES.md → "Services Section" for the fallback behavior).
  services: [
    {
      id: "short-form",
      title: "Short-Form Editing",
      description: "Beat-synced cuts and clean captions, paced for retention — built for Reels and Shorts.",
      icon: "shortform",
    },
    {
      id: "gaming-editing",
      title: "Gaming Editing",
      description: "Highlight and montage edits with rhythm-driven cutting tuned to the gameplay.",
      icon: "gaming",
    },
    {
      id: "amv-editing",
      title: "Anime / AMV Editing",
      description: "Motion-matched, beat-synced anime edits built around musicality, not just clip-syncing.",
      icon: "amv",
    },
    {
      id: "captions-typography",
      title: "Captions & Typography",
      description: "Clean, legible captions and on-screen typography that support the edit instead of cluttering it.",
      icon: "captions",
    },
    {
      id: "thumbnail-design",
      title: "Thumbnail Design",
      description: "High-contrast, click-worthy thumbnails designed to earn the click without misleading it.",
      icon: "thumbnail",
    },
  ],

  // =========================================================================
  // CONTACT — read by js/contact.js. Deliberately has no form fields: the
  // Contact section is link/button based only (see PROJECT_RULES.md →
  // "Contact Section" → "No contact form"). Discord/Instagram are NOT
  // duplicated here — js/contact.js reads them straight from the
  // existing `social` array above, same links the footer already uses.
  // Only `email` is new.
  // =========================================================================
  contact: {
    eyebrow: "REEL 005 — CONTACT",
    heading: "Let's Work Together",
    subtitle: "Send over your footage and a deadline — happy to talk through scope before you commit to anything.",
    email: "kryozenstudio@gmail.com",
    emptyStateText: "No contact methods listed yet.",
  },

  // =========================================================================
  // VIDEO PLAYER — read by js/player.js. Section copy for the two
  // fallback states, not project data (that stays on each project's own
  // `video` field in `projects` above).
  // =========================================================================
  player: {
    closeLabel: "Close video player",
    noVideoText: "No video has been added for this project yet.",
    videoUnavailableText: "Video unavailable.",
  },

  // Portfolio projects — rendered by js/work.js. Order here doesn't matter:
  // the Work section always sorts by `date`, newest first, at render time.
  //
  // Intentionally empty: no real project has been added yet, and this
  // site must never present fictional work as if it were real portfolio
  // content. js/work.js already handles an empty array correctly — the
  // Work section shows its polished "No projects found." empty state
  // (config.work.emptyStateText) instead of a blank or broken grid.
  //
  // Add real projects here following this shape:
  // {
  //   id: "example-project",
  //   title: "Example Project",
  //   category: "Anime / AMV",       // must match a string in `categories` above
  //   thumbnail: "assets/thumbnails/example.jpg",
  //   video: "",                    // "" is valid — see PROJECT_RULES.md → "Video Player System"
  //   description: "Short description.",
  //   software: ["Node Video"],
  //   date: "2026-08-07",
  // },
  projects: [],
};
