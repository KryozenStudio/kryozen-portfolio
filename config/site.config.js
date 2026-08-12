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
 *
 * Sections marked "(future)" are not rendered by the current foundation
 * build — they exist here so the Work / Services / About sections can be
 * built later without redesigning the config schema.
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
      "I edit AMVs, anime and gaming edits, talking-head videos, and short- and long-form content for creators who care about pacing, sound design, and finishing quality. Based on client footage, built into something worth watching twice.",
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
    { name: "YouTube", href: "https://youtube.com/@kryozen-nv?si=t0jSVNsM5yNuyoPC", icon: "youtube" },
    { name: "Instagram", href: "#", icon: "instagram" },
    { name: "TikTok", href: "#", icon: "tiktok" },
    { name: "Twitter", href: "#", icon: "twitter" },
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
  // ---------------------------------------------------------------------
  categories: [
    "AMV",
    "Gaming",
    "Anime",
    "TikTok",
    "YouTube Shorts",
    "Long-form",
    "Trailers",
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
    bio: "I've spent the last few years cutting AMVs, gaming highlights, and short-form content — chasing the same thing every time: a cut that feels inevitable, not just correct. Every project starts from the footage, not a template.",
  },

  // Software / tools strip shown in the About section. Only the tool name
  // is required — `icon` is reserved for later and safe to leave empty.
  // This is the editor's actual current (mobile) toolkit — update this
  // array when moving to PC software; nothing else needs to change.
  software: [
    { name: "Node Video", icon: "" },
    { name: "Alight Motion", icon: "" },
    { name: "Blurr", icon: "" },
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
    emptyStateText: "Services coming soon.",
  },

  // Services offered — rendered as cards by js/services.js. Each entry
  // needs at minimum `id` and `title`; `description` and `icon` are
  // optional and the layout holds up fine without them (see
  // PROJECT_RULES.md → "Services Section" for the fallback behavior).
  services: [
    {
      id: "short-form",
      title: "Short-Form Video Editing",
      description: "TikTok, Reels, and YouTube Shorts cut for retention — fast pacing, clean captions, built for the scroll.",
      icon: "shortform",
    },
    {
      id: "amv-editing",
      title: "AMV Editing",
      description: "Anime music video edits built around motion-matched cuts and musicality, not just clip-syncing.",
      icon: "amv",
    },
    {
      id: "gaming-montages",
      title: "Gaming Montages",
      description: "Highlight reels and montage edits with reactive sound design tuned to the gameplay.",
      icon: "gaming",
    },
    {
      id: "music-videos",
      title: "Music Videos",
      description: "Narrative and performance-style music video edits, graded and paced to the track.",
      icon: "music",
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
  // "Contact Section" → "No contact form"). Discord/YouTube/Instagram/
  // TikTok/Twitter are NOT duplicated here — js/contact.js reads them
  // straight from the existing `social` array above, same links the
  // footer already uses. Only `email` is new, since no address existed
  // anywhere in the project before this phase.
  // =========================================================================
  contact: {
    eyebrow: "REEL 005 — CONTACT",
    heading: "Let's Work Together",
    subtitle: "Send over your footage and a deadline — happy to talk through scope before you commit to anything.",
    // No email/contact-form messaging by design — Discord (from the
    // `social` array above) is the primary contact route. Leave this ""
    // to keep the Email method hidden; set a real address here only if
    // that ever changes.
    email: "",
    emptyStateText: "Contact links coming soon.",
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
  //   category: "AMV",              // must match a string in `categories` above
  //   thumbnail: "assets/thumbnails/example.jpg",
  //   video: "",                    // "" is valid — see PROJECT_RULES.md → "Video Player System"
  //   description: "Short description.",
  //   software: ["Node Video"],
  //   date: "2026-08-07",
  // },
  projects: [],
};
