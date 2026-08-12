# Kryozen Studio — Project Rules

This document governs this codebase. Work, Services, About, Contact, and the
video player are all built (Phases 1–3) — this document covers how they're
extended, plus whatever comes next. Read it before adding anything. If a
change conflicts with a rule here, fix the change — not the rule — unless
you're deliberately amending this file.

---

## 1. Design Philosophy

Kryozen Studio is a **premium, cinematic, minimal** portfolio. Every design
decision should be checked against these three words. Concretely:

- **Premium** — generous whitespace, restrained color, considered typography.
  Nothing should look like it was picked from a default template.
- **Cinematic** — the site borrows structural language from film and video
  editing itself: timecodes instead of generic numbering, a countdown-leader
  logo reveal instead of a generic fade-in, monospace "readout" labels for
  metadata. The motif should always tie back to *actual video editing*, not
  decoration for its own sake.
- **Minimal** — one accent color (deep red), one motion moment per view, no
  competing focal points. If two elements are both fighting for attention,
  cut one.

**Never:** RGB/rainbow gradients, neon glow overload, stock "AI-generated"
gradients-and-blobs backgrounds, gratuitous parallax, more than one accent
hue.

---

## 2. Folder Structure

```
kryozen-studio/
├── index.html              → one HTML file per page (this is a single-page
│                              foundation today; future pages follow the
│                              same pattern: <name>.html at the root)
├── config/
│   └── site.config.js       → ALL editable content lives here
├── css/
│   ├── variables.css        → design tokens (colors, type, spacing, motion)
│   ├── reset.css            → element reset, reduced-motion enforcement
│   ├── base.css              → global element defaults, focus states, utilities
│   ├── buttons.css          → shared .btn component
│   ├── player.css            → video player modal (shared component, not page content)
│   ├── navbar.css           → navbar + mobile menu
│   ├── hero.css              → hero section + its intro animation
│   ├── work.css              → Work/Portfolio section, filters, search, cards
│   ├── services.css          → Services section, service cards
│   ├── about.css              → About section, portrait + copy
│   ├── contact.css           → Contact section, method rows (no form)
│   └── footer.css           → footer
├── js/
│   ├── content-loader.js    → injects config into the DOM (nav/hero/footer content)
│   ├── work.js               → Work section: builds filters/cards from config, search, sort
│   ├── player.js              → video player: listens for kryozen:project-open, plays/stops video
│   ├── services.js            → Services section: builds cards from config.services
│   ├── about.js                → About section: portrait, copy, software strip
│   ├── contact.js             → Contact section: method links from config + config.social
│   ├── navbar.js             → navbar scroll state + mobile menu behavior
│   ├── hero-intro.js         → once-per-session intro bookkeeping
│   └── main.js                → bootstrap, loaded last
├── assets/
│   ├── images/
│   │   ├── logo/            → logo.svg + replacement instructions
│   │   ├── hero/             → optional hero background artwork
│   │   └── profile/          → About section portrait (config.about.profileImage)
│   ├── videos/                → project videos (config.projects[].video, played by js/player.js)
│   └── thumbnails/           → project card thumbnails (config.projects[].thumbnail)
├── README.md
└── PROJECT_RULES.md          → this file
```

**Rule:** one CSS file per component/section, keyframes live inside the file
of the component they animate (not a shared `animations.css`) — this keeps
each file understandable in isolation and avoids hunting across files to
understand one element's motion.

**Rule:** all new sections get their own CSS file and, if they render
dynamic content, a matching JS file (e.g. `services.css` + `services.js`),
and are added to `index.html`'s `<link>`/`<script>` lists in the order they
appear on the page. Shared, non-section components (like `buttons.css` or
`player.css`, which isn't page content) are grouped right after `base.css`
instead. Don't grow an existing file to cover a new section.

---

## 2a. Work / Portfolio System

The Work section (`css/work.css`, `js/work.js`) is fully data-driven from
`config/site.config.js`. Nothing about an individual project is hardcoded
in `index.html` — the filters, the search field's behavior, and every
project card are generated at runtime.

**Project schema** (`config.projects[]`):

```js
{
  id: "example-project",      // unique, slug-style — used as the stable key
  title: "Example Project",
  category: "AMV",            // must exactly match a string in config.categories
  thumbnail: "assets/thumbnails/example.jpg", // "" is valid — see fallback below
  video: "",                  // "" is valid — js/player.js shows a fallback state instead of a broken player
  description: "Short description.", // shown in the video player, not on the card
  software: ["Node Video"],   // card shows only the first entry; the player shows all of them
  date: "2026-08-07",         // ISO date — drives sort order, nothing else
}
```

**Ordering:** `js/work.js` sorts `config.projects` by `date` (newest first)
every time it renders — the array's order in the config file is irrelevant
and never needs to be maintained by hand. `window.Kryozen.getLatestProject()`
exposes the result for a future homepage "latest project" highlight; nothing
currently calls it.

**Categories:** `config.categories` is the single source for both the
filter chips and the valid values for `project.category`. Adding a category
there is enough — no other file needs to change.

**Thumbnail fallback:** if `project.thumbnail` is empty, or the image fails
to load, the card shows a gradient + category-label placeholder instead of
a broken image — so a project can be added before its thumbnail is ready
without ever looking broken.

**Filtering/search:** both run entirely client-side against the in-memory
`projects` array (see PROJECT_RULES.md §9.5) — there is no reload and no
network request. Cards that don't match fade out via
`.project-card--filtered-out`, then get the `hidden` attribute once the
transition ends, so the grid never "pops" mid-animation.

**Video player integration:** each card is a `<button>` (not a link — a
click doesn't navigate anywhere) that dispatches a `kryozen:project-open`
custom event with the full project object as `event.detail`. `js/player.js`
is the sole listener — see §2b "Video Player System" below for the full
open/close/playback contract. `js/work.js` itself has no knowledge of the
player; it only ever dispatches the event.

**Future upload/project-management readiness:** this project intentionally
does *not* have a way to add projects through the website itself — GitHub
Pages can't write back to the repository, and building a fake "upload"
button that can't actually persist anything would be misleading. What it
does have is a project data shape (`id`/`title`/`category`/`thumbnail`/
`video`/`description`/`software`/`date`) that already lives in exactly one
place (`config.projects`) and nowhere else — no project information is
duplicated into any other file. If a future tool (a small local script, a
CMS, a build step) is built to generate or edit entries in this array, it
only needs to target this one array in this one file; nothing about
`js/work.js`, `js/player.js`, or the card/filter/search rendering needs to
change to support it.

---

## 2b. Video Player System

`css/player.css` + `js/player.js`. A single, reusable native `<dialog id="player">`
lives once in `index.html` (as a direct child of `<body>`, after the
footer) — `js/player.js` repopulates it per project rather than building a
new dialog per card.

**Integration point:** `js/player.js` is the *only* listener for
`kryozen:project-open` (dispatched by `js/work.js` — see §2a). Do not add a
second project-opening system; if a project needs to be opened
programmatically from new code, dispatch that same event rather than
calling into `js/player.js` directly.

**Why native `<dialog>`:** `showModal()` gives correct top-layer stacking,
moves focus into the dialog automatically, restores focus to the
triggering card on close, and fires a native `cancel` event on Escape —
all without hand-rolled focus-trap JS, which is the easiest place for a
modal to "break." `js/player.js` intercepts `cancel` (via
`preventDefault()`) purely so Escape animates closed the same way the
close button and backdrop click do; it still fully relies on native
`showModal()`/`close()` for the actual open/close and focus mechanics.

**Close paths — all three route through one `requestClose()` function,**
which is the single place that starts the closing animation and (after
it finishes) calls the real `dialog.close()`:
1. The close button.
2. Clicking the dialog's own backdrop area (`event.target === dialog`).
3. Escape (via the intercepted `cancel` event, see above).

**Cleanup lives in one place too:** the dialog's native `close` event —
which fires no matter which of the three paths triggered it — is where
`js/player.js` pauses/unloads the video and restores
`document.body.style.overflow`. Don't add cleanup logic anywhere else; add
new cleanup steps to that one `close` listener.

**Video behavior:**
- Videos never autoplay — not on page load, and not when a project is
  opened. Nothing is even preloaded (`preload="none"`) until a project is
  opened, and the `<video>` element is given no `autoplay` attribute and
  no `.play()` call. It loads with native controls visible and stays
  paused until the user presses play themselves.
- Only one video ever exists: `openPlayer()` unconditionally tears down
  any previous `<video>` (pause, remove `src`, `.load()`) before building
  the new one, and the `close` handler does the same on every close.
- Missing video (`project.video` is `""`) and invalid video (the `error`
  event fires on the `<video>` element) both render the same
  `.player__media--fallback` state — a gradient + icon + message, not a
  broken native player. The two cases use slightly different copy
  (`config.player.noVideoText` vs `config.player.videoUnavailableText`)
  but are visually identical.
- Aspect ratio is intentionally not fixed — projects span 16:9, 9:16
  (vertical short-form), and wider trailer crops. The `<video>` sizes itself
  (`max-height: 70vh`, `width: 100%`, `height: auto`) inside a
  flex-centered black `.player__media`, so nothing gets cropped.

**Config** (`config.player`): `closeLabel`, `noVideoText`,
`videoUnavailableText` — copy only. Project-specific data (title,
category, description, software, video) stays on the project object
itself in `config.projects[]`; it is never duplicated into `config.player`.

---

## 2c. About Section

`css/about.css` + `js/about.js`. Deliberately short — a portrait, a
one-line intro, a short bio, and a tools strip. This is not a biography
page; don't extend `config.about.bio` into multiple paragraphs.

**Reuses existing data instead of duplicating it:**
- "Name/brand" is *not* a separate `about.name` field — `js/about.js`
  reads `config.brand.shortName` (falling back to `config.brand.name`)
  directly, the same brand name the navbar already shows.
- The software/tools strip reads the existing top-level `config.software`
  array (first added as an empty placeholder in Phase 1) rather than a
  separate `about.skills` field.
- The portrait's fallback face (shown when `config.about.profileImage` is
  empty, or the image fails to load) is a plain
  `<img data-logo-img src="assets/images/logo/logo.svg">` sitting in the
  markup already — `js/content-loader.js`'s existing generic
  `document.querySelectorAll("[data-logo-img]")` wiring picks it up
  automatically. `js/about.js` never touches that image directly; it only
  toggles the `.about__portrait--fallback` class on the wrapper to reveal
  or hide it.

**Config** (`config.about`): `eyebrow`, `heading`, `role`, `profileImage`,
`intro`, `bio`. All optional in the sense that a missing field just
renders as empty text rather than throwing — but `profileImage` and `bio`
being empty is the expected/common case (see fallback behavior above).

---

## 2d. Services Section

`css/services.css` + `js/services.js`. Section copy and the service list
are deliberately two separate config objects:

- `config.servicesSection` — `eyebrow`, `heading`, `subtitle`,
  `emptyStateText` (the same copy/data split already used for
  `config.work` vs `config.categories`/`config.projects`).
- `config.services` — the array of service objects themselves. This was
  the name of an empty Phase-1 placeholder array; Phase 3 populated it
  with the same shape it always had (`{id, title, description, icon}`) —
  its type was never changed.

**Icons are optional and layout-safe.** `js/services.js` keeps a small
local `ICONS` map (`shortform`, `amv`, `gaming`, `music`, `thumbnail`) of
original monoline glyphs. If `service.icon` is empty or doesn't match a
key in that map, the icon circle is simply not rendered — the card's
title becomes its first element and the grid still looks correct. Don't
make any part of the card's layout depend on an icon being present.

**Empty state:** if `config.services` is empty (or every entry is
malformed and skipped), `js/services.js` shows `#services-empty` with
`config.servicesSection.emptyStateText` instead of an empty grid.

---

## 2e. Contact Section

`css/contact.css` + `js/contact.js`.

**No contact form — and none should be added without a deliberate,
separate decision.** GitHub Pages is static; a real form needs a
third-party submission endpoint (e.g. Formspree, a serverless function)
that this project does not currently have. The Contact section is
link/button-based only: email (`mailto:`) plus whatever's in
`config.social`.

**Reuses `config.social` instead of duplicating contact links.** Discord,
YouTube, Instagram, and Twitter are *not* re-entered anywhere in
`config.contact` — `js/contact.js` reads the existing `config.social`
array directly (the same links the footer already renders) and only adds
one new thing on top: `config.contact.email`. If you add a new entry to
`config.social`, it automatically appears as a Contact method too, with no
Contact-specific config needed.

**Icon set:** `js/contact.js` keeps its own small local copy of the
`discord`/`youtube`/`instagram`/`twitter` glyphs (plus a new `email`
glyph) rather than importing `js/content-loader.js`'s icon map — this
matches the precedent `js/work.js` already set of each section file
owning a small local icon set instead of sharing one across files.

**Fallback behavior:** a method with no `href` still renders with `href="#"`
(matching the existing precedent in `js/content-loader.js`'s footer social
loop) rather than being hidden — consistent with how the navbar's Discord
button already behaves as a "#" placeholder throughout the site. Only a
fully malformed entry (no `name` at all) is skipped. If the combined
method list ends up empty, `#contact-empty` shows
`config.contact.emptyStateText` instead of an empty section.

**Config** (`config.contact`): `eyebrow`, `heading`, `subtitle`, `email`,
`emptyStateText`.

---

## 3. Color Palette

Defined once, in `css/variables.css`. Never hardcode a hex value anywhere
else in the codebase — always reference the CSS custom property.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#08080a` | Page background |
| `--color-bg-elevated` | `#101012` | Cards / elevated panels |
| `--color-accent` | `#c31432` | Primary accent (icons, logo mark) |
| `--color-accent-bright` | `#e2213f` | Hover/active states |
| `--color-accent-dim` | `#7a0e22` | Gradient shadows |
| `--color-text-primary` | `#f4f2f0` | Headings, primary copy |
| `--color-text-secondary` | `#a3a1a4` | Body copy |
| `--color-text-tertiary` | `#6b696d` | Labels, timecodes, captions |

**Rule:** one accent hue only (red). If a future section needs a second
signal color (e.g. a "success" state on a contact form), it must be a
desaturated neutral or a red variant — never a new hue — unless this file is
updated first with an explicit rationale.

---

## 4. Typography

- **Display** (`--font-display`, Bebas Neue): section headings and the hero
  wordmark only. Never body copy, never small UI text.
- **Body** (`--font-body`, Inter): all paragraph copy, nav links, buttons.
- **Mono** (`--font-mono`, JetBrains Mono): the "timecode" motif —
  eyebrows/labels, metadata, scroll cues. Uppercase, wide letter-spacing.

Use the fluid `clamp()` scale already defined in `variables.css`
(`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-body-lg`, `--fs-body`,
`--fs-small`, `--fs-label`) rather than one-off font sizes.

---

## 5. Animation Rules

1. **Every animation must justify its existence.** Before adding one, name
   the purpose in a code comment (state change, hierarchy, feedback,
   brand moment). "Looks cool" is not a purpose.
2. **One orchestrated "moment" per page load** — currently the hero's
   countdown-iris logo intro. Future sections should use quiet, functional
   transitions (hover states, fade-on-scroll-into-view) rather than adding a
   second big choreographed sequence.
3. **`prefers-reduced-motion: reduce` must always be respected.**
   `reset.css` already forces all animation/transition durations to ~0 
   globally as a safety net — but any animation that changes *layout* or
   *position* (not just opacity) should also be explicitly checked in CSS
   or JS, since instant-but-still-jarring position jumps can still be
   uncomfortable. Prefer opacity/transform-only animations.
4. **No infinite animations except deliberate ambient ones** (the REC dot
   pulse, the scroll cue) — and even those must be subtle (low-amplitude,
   slow, easy to ignore).
5. Keep the "film" motif intact for *content* motion — dissolve/wipe/iris
   metaphors are on-brand for reveals (the hero intro, filter/search
   transitions). `--ease-out` / `--ease-in-out` remain the default for
   anything that isn't a direct press.
6. **`--ease-spring` is reserved for interactive press/release feedback
   only** — buttons, cards, filter chips, the player close button, the
   navbar toggle. It is a deliberate, scoped exception to rule 5, not a
   general replacement for it: don't use it for section reveals, the
   hero intro, or anything that isn't responding to a direct
   click/tap/hover. Every element using it follows the same two-rule
   pattern so the "press" and "release" halves can use different easing:
   ```css
   .thing {
     transition: transform 220ms var(--ease-spring); /* release: eases back with a slight overshoot */
   }
   .thing:active {
     transition: transform 90ms var(--ease-out); /* press: fast, decisive, no bounce */
     transform: scale(0.97);
   }
   ```
   Keep press scale in the `0.94`–`0.98` range — anything smaller reads as
   a jump, not a press.

---

## 6. Coding Standards

- **Vanilla JS only**, no framework, no build step. This is a static site
  hosted on GitHub Pages — keep it deployable by pushing files.
- **`config/site.config.js` is the single source of truth for content.**
  If you're tempted to hardcode a string, link, or image path directly in
  `index.html`, add it to the config schema instead and read it via
  `content-loader.js`. The one intentional exception: `index.html` ships
  with real fallback copy matching the config defaults, so the page reads
  correctly with JavaScript disabled — `content-loader.js` re-syncs that
  text from config on load. If you change a value in config, remember the
  no-JS fallback text in `index.html` and the `<nav class="no-js-fallback">`
  block will only match automatically if you keep them in sync manually.
- **One inline `<script>` is allowed**, and only one: the reduced-motion /
  session-check snippet in `index.html`'s `<head>`. It must run
  synchronously before first paint to avoid a flash of the animated intro
  state. Every other script is external and `defer`red.
- **IDs are the DOM hook for content injection** (`hero-title`,
  `footer-copy`, etc.) — don't repurpose an existing ID for new content;
  add a new one and reference it from `content-loader.js`.
- Comment non-obvious CSS (why a value is what it is), not obvious CSS
  (don't comment `color: red /* makes it red */`).
- No inline `style="..."` attributes except the one dynamic case
  (`content-loader.js` setting a background-image from config) — everything
  else is a class.

---

## 7. Performance Goals

- No JS framework, no bundler, no build step — ship what's in the repo.
- Fonts: only the weights actually used are requested from Google Fonts
  (`display=swap`, `preconnect`), and there are exactly three font families.
  Don't add a fourth without removing one.
- Images: WebP by default for photos/thumbnails once the Work section
  exists; SVG for anything vector (logo, icons). Lazy-load (`loading="lazy"`)
  any image below the fold.
- JS stays small and dependency-free. If a future feature seems to need a
  library, first check whether ~30 lines of vanilla JS covers it.
- Scroll listeners must be rAF-throttled (see `navbar.js` for the pattern)
  — never run layout-affecting logic directly inside a raw `scroll` handler.

---

## 8. Accessibility Goals

- Semantic HTML first: `<header>`, `<nav>`, `<main>`, `<footer>`, one `<h1>`
  per page, headings in order (no skipping from `<h1>` to `<h3>`).
- Every interactive element must have a visible `:focus-visible` state
  (already themed in `base.css` — don't remove `outline` without replacing
  it).
- Every animation respects `prefers-reduced-motion` (see §5).
- Touch targets ≥ 44×44px (nav toggle, links, buttons already meet this —
  keep new interactive elements at or above this size).
- Decorative elements (`.grain-overlay`, the hero logo ring, the eyebrow
  dot) are `aria-hidden="true"`. Content-bearing elements never are.
- Color contrast: `--color-text-secondary` on `--color-bg` is the minimum
  contrast used for body copy — don't introduce a dimmer text color for
  anything readable.
- The video player modal (§2b) uses native `<dialog>` specifically so
  focus movement, focus return, and Escape-to-close come from the
  browser rather than custom JS — any future modal should do the same
  rather than re-implementing focus trapping by hand.

---

## 9. Future Development Rules

Work, Services, About, Contact, and the video player are all built
(Phases 1–3). The following are explicitly **not** built and were
intentionally excluded from Phase 3 — don't add any of them without a
deliberate, separate decision (each needs real infrastructure choices —
a backend, a CMS, a form endpoint — that this static site doesn't have):
testimonials, pricing tables, a blog, a client dashboard, a booking
system, authentication, a CMS, an analytics dashboard, an AI chatbot, a
newsletter system, or a contact form (see §2e).

For whatever *does* come next:

1. Extend `config/site.config.js` the same way each phase has so far —
   a section gets its own copy object (`work`, `servicesSection`,
   `about`, `contact`) and, if it renders a list, a separate data array
   (`projects`, `services`) — rather than inventing a parallel config
   file or overloading an existing field's shape.
2. Follow the existing eyebrow-label pattern (timecode-style, e.g.
   `"REEL 002 — WORK"`) for each new section's heading treatment, so the
   motif stays consistent site-wide. `REEL 001`–`005` are taken (hero
   through contact); the next section continues the sequence.
3. New sections get `scroll-margin-top` for free (see `base.css`'s
   `[id] { scroll-margin-top: 88px; }` rule) — just give the section a
   matching `id` and add it to `config.nav.links` (plus the matching
   manual entry in `index.html`'s `<nav class="no-js-fallback">`, per
   §6) and the navbar's anchor links work automatically.
4. Any future modal/overlay should follow §2b's pattern: native
   `<dialog>` over hand-rolled focus trapping, one `close` event as the
   single cleanup point, and every close trigger routed through one
   function.
5. Filters/search/any future client-side data view must stay pure
   client-side (no backend on GitHub Pages) — filter the in-memory
   config array, don't fetch anything.
6. Before adding a new dependency of any kind, ask whether vanilla
   HTML/CSS/JS can do it. The bar for adding a library is high.
