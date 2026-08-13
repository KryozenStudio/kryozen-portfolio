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
  // LOGO — used in the navbar. The hero intro uses the supplied brand artwork below.
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
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
    ],
  },

  // ---------------------------------------------------------------------
  // HERO
  // ---------------------------------------------------------------------
  hero: {
    eyebrow: "REEL 001 — SHOWREEL",
    heading: "KRYOZEN STUDIO",
    intro:
      "Video edits built around rhythm, typography, captions, compositing, and the feeling of the reference — with a focus on short-form, gaming, and anime/AMV work.",
    ctaPrimary: {
      label: "View Work",
      href: "#work",
    },
    ctaSecondary: {
      label: "Contact",
      href: "#contact",
    },
    // Supplied brand artwork used as the hero backdrop and intro visual.
    // Leave empty to use the default gradient.
    artwork: "assets/images/hero/kryozen-brand.jpg",
  },

  // ---------------------------------------------------------------------
  // SOCIAL LINKS — discovery links rendered in the footer
  // ---------------------------------------------------------------------
  social: [
    { name: "Discord", href: "https://discordapp.com/users/1375134237455417444", icon: "discord" },
    { name: "YouTube", href: "https://youtube.com/@kryozen-nv?si=t0jSVNsM5yNuyoPC", icon: "youtube" },
    { name: "Instagram", href: "https://www.instagram.com/kryozen_nv/", icon: "instagram" },
  ],

  // ---------------------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------------------
  footer: {
    // {year} is replaced automatically with the current year.
    copyright: "© {year} Kryozen Studio. All rights reserved.",
    note: "Worldwide • Remote • Async • Built with intention.",
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
    emptyStateText: "No projects published yet.",
  },

  // ---------------------------------------------------------------------
  // WORK CATEGORIES
  // Add or remove categories here — the filter chips in the Work section
  // are generated entirely from this array. Each project's `category`
  // field (below) must match one of these strings exactly.
  //
  // "Short Form" is the umbrella category for quick vertical/quick-cut
  // edits (Reels, Shorts, and similar) rather than one entry per
  // platform — keeps the filter list from fragmenting into near-
  // duplicate categories as platforms come and go.
  // ---------------------------------------------------------------------
  categories: [
    "Short Form",
    "Gaming",
    "Anime / AMV",
    "Long Form",
    "Thumbnail Design",
  ],
  categoryPages: {
    "Short Form": "short-form.html",
    "Gaming": "gaming.html",
    "Anime / AMV": "anime-amv.html",
    "Long Form": "long-form.html",
    "Thumbnail Design": "thumbnail-design.html",
  },

  categoryDescriptions: {
    "Short Form": "Fast, focused edits built for vertical viewing — clean pacing, captions, motion, and strong visual hierarchy.",
    "Gaming": "Gameplay edits shaped around rhythm, reactions, sound, and purposeful visual energy.",
    "Anime / AMV": "Cinematic anime edits built around music, motion, typography, atmosphere, and emotional timing.",
    "Long Form": "Longer-form editing with clearer structure, pacing, context, and retention-focused presentation.",
    "Thumbnail Design": "High-contrast thumbnail design with clear hierarchy and a strong first-frame impression.",
  },

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
    profileImage: "",
    intro: "The person behind the cuts.",
    bio: "Kryozen is an independent video editor focused on short-form, gaming, and anime/AMV work. Each edit starts with close attention to the reference, rhythm, and visual intent, then is shaped into a clean, purposeful final piece. The work focuses on pacing, beat sync, typography, captions, compositing, and thumbnail design — with an ongoing focus on improving the craft.",
  },

  // Software / tools strip shown in the About section. Only the tool name
  // is required — `icon` is reserved for later and safe to leave empty.
  // This is the editor's actual current (mobile) toolkit — update this
  // array when moving to PC software; nothing else needs to change.
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
    subtitle: "Focused editing for content that needs rhythm, clarity, and personality.",
    emptyStateText: "No services are currently listed.",
  },

  // Services offered — rendered as cards by js/services.js. Each entry
  // needs at minimum `id` and `title`; `description` and `icon` are
  // optional and the layout holds up fine without them (see
  // PROJECT_RULES.md → "Services Section" for the fallback behavior).
  services: [
    { id: "short-form", title: "Short-Form Video Editing", description: "Talking-head clips, reels, and vertical edits with clean pacing, captions, and purposeful motion.", icon: "shortform" },
    { id: "gaming", title: "Gaming Edits", description: "Highlight-driven edits built around gameplay rhythm, beat sync, and focused visual energy.", icon: "gaming" },
    { id: "anime-amv", title: "Anime / AMV Editing", description: "Reference-led anime edits shaped around music, motion, typography, and emotional timing.", icon: "amv" },
    { id: "captions", title: "Captions & Subtitles", description: "Clean, readable captions and subtitle styling designed to stay in rhythm with the edit.", icon: "captions" },
    { id: "typography", title: "Typography", description: "Kinetic type and text animation used to give a cut more personality without overwhelming it.", icon: "typography" },
    { id: "thumbnail-design", title: "Thumbnail Design", description: "Focused thumbnails with clear hierarchy, contrast, and a strong first impression.", icon: "thumbnail" },
  ],

  // =========================================================================
  // FAQ
  // =========================================================================
  faq: {
    eyebrow: "REEL 005 — FAQ",
    heading: "Frequently Asked Questions",
    subtitle: "A few things worth knowing before you send a project.",
    items: [
      { question: "What do you provide?", answer: "Short-form editing, gaming edits, anime / AMV editing, captions and subtitles, typography, and thumbnail design." },
      { question: "How many revisions are included?", answer: "Three revisions are included. After that, additional changes are billed at 30% of the original project fee and are paid upfront before the extra work begins." },
      { question: "How long does an edit take?", answer: "Most edits take around 4–7 days, depending on the style and scope. Larger projects may take longer." },
      { question: "How do I send my footage?", answer: "Google Drive is the preferred way to send footage, references, and other project files." },
      { question: "Can I send a reference?", answer: "Yes. References are welcome and help me understand the exact style you’re looking for." },
      { question: "Do you work with clients worldwide?", answer: "Yes. Projects are handled remotely and asynchronously, so you can work with me from anywhere." },
      { question: "Is long-form editing available?", answer: "Long-form editing is planned for the future and isn’t currently available." },
      { question: "What software do you use?", answer: "Node Video is my current editing software." },
      { question: "How is pricing decided?", answer: "Pricing depends on the style, scope, and amount of work involved. Contact me with the project details for a quote." },
      { question: "How do we get started?", answer: "Send the project details, deadline, and any reference through Discord or email. We’ll discuss the scope before you commit." },
    ],
  },

  // =========================================================================
  // CONTACT — read by js/contact.js. Deliberately has no form fields: the
  // Contact section is link/button based only (see PROJECT_RULES.md →
  // "Contact Section" → "No contact form"). Email and Discord are the
  // direct contact methods; social discovery remains in the footer.
  // =========================================================================
  contact: {
    eyebrow: "REEL 006 — CONTACT",
    heading: "Let's Work Together",
    subtitle: "Send the footage, deadline, and reference. We’ll talk through the scope before you commit.",
    // Direct contact route. Keep this editable from config.
    email: "kryozenstudio@gmail.com",
    emptyStateText: "No contact methods are currently available.",
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
  // Work section shows its polished "No projects published yet." empty state
  // (config.work.emptyStateText) instead of a blank or broken grid.
  //
  // Add real projects here following this shape:
  // {
  //   id: "example-project",
  //   title: "Example Project",
  //   category: "Anime / AMV",     // must match a string in `categories` above
  //   thumbnail: "assets/thumbnails/example.jpg",
  //   video: "",                    // "" is valid — see PROJECT_RULES.md → "Video Player System"
  //   description: "Short description.",
  //   software: ["Node Video"],
  //   date: "2026-08-07",
  // },
  projects: [],
};
