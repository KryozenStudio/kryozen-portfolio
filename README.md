# Kryozen Studio

A premium, cinematic portfolio foundation for a video editor — pure black,
deep red accent, glassmorphism, and a single orchestrated intro animation.
Static site, zero build step, ready for GitHub Pages.

This build includes the foundation (responsive navbar, hero section,
footer, theme system, config system), the **Work / Portfolio system**
(category filters, search, data-driven project cards), and — as of
Phase 3 — a **video player**, **About**, **Services**, and **Contact**
section. Everything content-related is edited through
`config/site.config.js`; see the table of contents below for the specific
guide you need.

---

## 1. Project Structure

```
kryozen-studio/
├── index.html            Single page: navbar + hero + footer
├── config/
│   └── site.config.js    ALL editable content — start here
├── css/
│   ├── variables.css     Theme tokens (colors, type, spacing, motion)
│   ├── reset.css
│   ├── base.css
│   ├── buttons.css
│   ├── player.css        Video player modal
│   ├── navbar.css
│   ├── hero.css
│   ├── work.css          Work/Portfolio section, filters, search, cards
│   ├── services.css      Services section
│   ├── about.css         About section
│   ├── contact.css       Contact section (no form)
│   └── footer.css
├── js/
│   ├── content-loader.js Injects config into the page (nav/hero/footer)
│   ├── project-source.js Resolves config.projects for the public pages
│   ├── work.js           Homepage: latest-project bookkeeping
│   ├── category-page.js  Category pages: filters, search, cards
│   ├── player.js         Video player: open/close, YouTube embed, fallback
│   ├── services.js       Services section: cards from config.services
│   ├── about.js          About section: portrait, copy, tools strip
│   ├── contact.js        Contact section: methods from config + config.social
│   ├── navbar.js         Scroll-to-glass state + mobile menu
│   ├── hero-intro.js     Once-per-session intro bookkeeping
│   └── main.js
├── assets/
│   ├── images/
│   │   ├── logo/          logo.svg (replace this)
│   │   ├── hero/          optional hero background artwork
│   │   └── profile/        About section portrait (see "How to Edit About Content")
│   ├── videos/            not used — videos live on YouTube, see "Video Player: How It Works"
│   └── thumbnails/         project card thumbnails (see "How to Add / Edit Work Projects")
├── PROJECT_RULES.md       Design/coding rules for all future work
└── README.md              This file
```

Full design rationale, color palette, animation rules, and coding standards
live in **`PROJECT_RULES.md`** — read it before extending the site.

---

## 2. Deploying on GitHub Pages

1. Create a new GitHub repository and push the contents of this folder to
   it (the repo root should contain `index.html`, not a subfolder).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose the branch (usually `main`) and folder `/ (root)`, then **Save**.
5. GitHub will give you a URL like `https://<username>.github.io/<repo>/`
   within a minute or two.

No build step, no `npm install`, no config beyond the steps above — it's a
static site.

**Using a custom domain?** Add a `CNAME` file at the repo root containing
your domain, then point your domain's DNS at GitHub Pages per
[GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

---

## 3. How to Replace the Logo

1. Add your logo file to `assets/images/logo/` (SVG recommended — the
   current placeholder mark uses `currentColor` so it inherits the accent
   color automatically; PNG/WebP work too).
2. Open `config/site.config.js` and update:
   ```js
   logo: {
     path: "assets/images/logo/your-logo.svg",
     alt: "Your Studio logo",
     isRaster: false, // set true if you used a PNG/WebP/JPG
   },
   ```
3. Reload the page — the navbar mark updates; the hero intro uses the separate supplied brand artwork
   automatically (they share the same config value).

The hero intro animation (iris reveal + countdown ring) works with any
roughly-square image, vector or raster.

---

## 4. How to Change Colors

All colors are CSS custom properties in **`css/variables.css`**, under the
`:root` selector. Nothing else in the codebase uses a raw hex value — change
a token here and it updates everywhere it's used.

Most common edits:

```css
--color-bg: #08080a;           /* page background */
--color-accent: #c31432;       /* primary red — logo, icons */
--color-accent-bright: #e2213f;/* hover/active red */
--color-accent-dim: #7a0e22;   /* deeper red, used in gradients */
--color-text-primary: #f4f2f0; /* headings/body */
--color-text-secondary: #a3a1a4;
```

See `PROJECT_RULES.md` → "Color Palette" for the full token list and the
one-accent-hue rule before introducing a second color.

---

## 5. How to Edit Social Links

Open `config/site.config.js`:

```js
social: [
  { name: "Discord", href: "https://discordapp.com/users/1375134237455417444", icon: "discord" },
  { name: "YouTube", href: "https://youtube.com/@kryozen-nv?si=t0jSVNsM5yNuyoPC", icon: "youtube" },
  { name: "Instagram", href: "https://www.instagram.com/kryozen_nv/", icon: "instagram" },
  ],
```

These render as the icon row in the footer. The Contact section intentionally
uses only direct contact methods (Email and Discord) so social links are not
repeated throughout the page. Available `icon` values: `discord`, `youtube`,
`instagram`; icon values are defined in `js/content-loader.js`.

The site's primary **Contact** actions
button both read from a separate field:

```js
nav: {
},
hero: {
  ctaSecondary: { label: "Contact", href: "#contact" },
},
```

Keep the primary contact link in the Contact section and update its `href` only when needed
together if that link ever changes.

> **No-JS note:** the navbar's plain-text fallback links (shown only when
> JavaScript is disabled) are hardcoded in `index.html` for reliability.
> If you change hrefs in config, also update the small
> `<nav class="no-js-fallback">` block in `index.html` if you want the
> no-JS fallback to match.

---

## 6. How to Edit Hero & Footer Text

Still in `config/site.config.js`:

```js
hero: {
  eyebrow: "SHOWREEL",
  heading: "KRYOZEN STUDIO",
  intro: "…your intro paragraph…",
  ctaPrimary: { label: "View Work", href: "#work" },
  ctaSecondary: { label: "Contact", href: "#contact" },
  artwork: "", // optional background image path
},
footer: {
  copyright: "© {year} Kryozen Studio. All rights reserved.", // {year} auto-fills
  note: "Edits available worldwide, remote & async.",
},
```

`index.html` ships with matching default text so the page reads correctly
even with JavaScript off — if you edit the config, the on-page text updates
automatically once JS runs, but keep `index.html`'s hardcoded copy roughly
in sync so the no-JS fallback isn't stale.

---

## 7. How to Add / Edit Work Projects

The Work section (filters, search, and every project card) is generated
entirely from `config/site.config.js` — you never touch `index.html` to
add, remove, or reorder a project.

**Add a project** by adding an object to the `projects` array:

```js
projects: [
  {
    id: "example-project",        // unique, slug-style
    title: "Example Project",
    category: "Anime / AMV",       // must match a string in `categories` below
    thumbnail: "assets/thumbnails/example.jpg",
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ", // the full URL you copied from YouTube — "" is valid, see "Video Player: How It Works"
    description: "Short description.", // shown in the video player, not on the card
    software: ["Node Video"],     // card shows only the first entry; the player shows all
    date: "2026-08-07",           // ISO format — controls sort order
  },
  // ...more projects
],
```

That's it — the card, its thumbnail, its category tag, and its filter
membership all update automatically on reload.

**Ordering is automatic.** Projects always render newest-first based on
`date`. You never need to reorder the array or add a "latest" label
yourself.

**Thumbnails:** drop the image file in `assets/thumbnails/` and reference
it by path. If you leave `thumbnail: ""`, or the file is missing, the card
shows a styled placeholder (gradient + category label) instead of a broken
image — so it's safe to write a project's entry before its thumbnail is
ready.

**Categories:** a category is registered in three places, not just one —
`categories` (the array below, source of the filter chips and the valid
values for a project's `category` field), `categoryPages` (which page
file it lives on), and `categoryDescriptions` (the subtitle shown on that
page):

```js
categories: [
  "Short Form", "Gaming", "Anime / AMV",
  "Long Form", "Thumbnail Design", "Captions / Subtitles",
],
categoryPages: {
  "Short Form": "short-form.html",
  // ...one entry per category, mapping its name to its page file
},
categoryDescriptions: {
  "Short Form": "Fast, focused edits built for vertical viewing…",
  // ...one entry per category
},
```

To add a whole new category (not just a new project in an existing one):
add it to all three maps above, then copy any existing category `.html`
file (e.g. `short-form.html`) to a new filename, and in the copy update
its `<title>`, its `<meta name="description">`, and the
`data-category="…"` attribute on its `<main>` element to the new
category's exact name. Nothing else in that file changes — everything on
the page (title, description, filters, project grid) renders itself from
the config maps above and that one `data-category` attribute.

**Search** matches against each project's title and category — nothing
else needs configuring.

**Clicking a card** opens the video player with that project's title,
category, description, software, and video — see "Video Player: How It
Works" below for exactly what happens and how to add a video. Each
card dispatches a `kryozen:project-open` browser event with the project's
data; the player is the only thing listening for it (see
`PROJECT_RULES.md` → "Video Player System").

---

## 8. Video Player: How It Works

Clicking any project card opens a single modal video player — no page
navigation, no separate detail page. Videos are unlisted YouTube uploads;
there is no upload system, backend, or file storage involved at all.

- **Adding a video:**
  1. Upload the video to YouTube and set its visibility to **Unlisted**
     (not Public, not Private — Unlisted means anyone with the link can
     watch, but it won't show up in search or on your channel).
  2. Copy the video's URL — either the `youtube.com/watch?v=...` form or
     the shorter `youtu.be/...` form both work.
  3. Paste that full URL into that project's `youtubeUrl` field in
     `config/site.config.js` — don't shorten it or extract the ID
     yourself, the site does that automatically.
  4. Commit and push (Termux, or any git client). GitHub Pages picks it
     up on the next deploy.
- **Leaving it empty (`youtubeUrl: ""`)** shows a polished "No video has
  been added for this project yet" state instead of an empty/broken
  player — it's completely safe to publish a project card before its
  video is ready.
- **An unrecognized URL** (not a YouTube URL, or missing the video ID)
  shows a similar "Video unavailable" fallback rather than a broken embed
  — you don't need to double-check every link works before publishing.
- **Playback:** the video never starts automatically — not on page load,
  and not when you open a project. It loads with YouTube's own controls
  ready, and the visitor presses play themselves. Opening a different
  project, or closing the player, always removes the previous embed
  entirely (which is what stops its playback); only one can ever exist.
- **Closing:** the ✕ button, clicking outside the player, or pressing
  Escape all close it the same way, and restore normal page scrolling.
- **Aspect ratio:** fixed to 16:9, which is how YouTube's own embedded
  player always renders regardless of the source video's original shape
  — vertical/Shorts-style uploads get letterboxed by YouTube itself.
- **No Google login required:** Unlisted videos play for any visitor
  without them needing to sign in to anything.

Full technical behavior (event integration, close-path handling, etc.) is
documented in `PROJECT_RULES.md` → "Video Player System", for anyone
extending this file rather than just using it.

---

## 9. How to Edit About Content

Open `config/site.config.js`:

```js
about: {
  eyebrow: "ABOUT",
  heading: "About",
  role: "Video Editor",
  profileImage: "assets/images/profile/profile.jpg",
  intro: "The person behind the cuts.",
  bio: "…a short paragraph…",
},
```

- **Name/brand** isn't a separate field here — it's pulled from
  `brand.shortName` (near the top of the config file), the same name the
  navbar already shows. Edit it there.
- **Portrait:** drop your photo in `assets/images/profile/` and update
  `profileImage`'s path. Leaving it empty, or pointing at a missing file,
  shows the studio's logo mark on a gradient instead of a broken image —
  safe to leave until you have a real photo.
- **Tools/software strip:** reuses the existing top-level `software`
  array (the same one you'd populate for any future "tools" reference)
  rather than a separate field:
  ```js
  software: [
    { name: "Node Video", icon: "" },

  ],
  ```
  An empty array hides the tools strip entirely rather than showing an
  empty row.
- Keep `bio` short — one paragraph. This section is intentionally not a
  full biography page.

---

## 10. How to Add / Edit / Remove Services

Open `config/site.config.js`. Section heading/subtitle and the service
list are two separate objects:

```js
servicesSection: {
  eyebrow: "SERVICES",
  heading: "Services",
  subtitle: "What I offer, in plain terms.",
},
services: [
  {
    id: "short-form",              // unique, slug-style
    title: "Short-Form Video Editing",
    description: "One short sentence.",
    icon: "shortform",             // optional — see icon list below
  },
  // ...more services
],
```

- **Add a service:** add an object to the `services` array. It appears
  automatically — no HTML to touch.
- **Remove a service:** delete its object from the array.
- **Icons are optional.** Available `icon` values right now: `shortform`,
  `amv`, `gaming`, `music`, `thumbnail` (defined in `js/services.js`).
  Leaving `icon` empty, or using a value not in that list, just omits the
  icon circle — the card still looks correct without one.
- **Empty array:** if `services` is empty, the section shows a "Services
  intentional empty-state message instead of a blank grid.

---

## 11. How to Edit Contact Methods

Open `config/site.config.js`:

```js
contact: {
  eyebrow: "CONTACT",
  heading: "Let's Work Together",
  subtitle: "…a short one-line CTA…",
  email: "kryozenstudio@gmail.com",
},
```

The Contact section intentionally has no form. It renders only the two
direct contact methods currently approved for clients: **Email** and
**Discord**. Social discovery links such as YouTube and Instagram remain in
the footer and are not duplicated as Contact cards.

Changing the email address in `config.contact.email` updates the Contact
section automatically. The Discord card is read from the `Discord` entry in
`config.social`, so there is one source of truth for that link.

There is no backend submission system because the site is deployed as a
static GitHub Pages site.

---

---

## 12. How to Add Future Sections

Work, Services, About, Contact, and the video player are all built. For
whatever comes after this:

1. Add a new CSS file per section (e.g. `css/testimonials.css`) and link
   it in `index.html`'s `<head>` in page order (see `PROJECT_RULES.md`
   §2) — shared/global components like the video player go with
   `buttons.css` right after `base.css` instead.
2. Add the section's markup inside `<main>`, with a matching `id`, and
   add it to `config.nav.links` (plus the matching manual entry in
   `index.html`'s `<nav class="no-js-fallback">`) so the navbar reaches
   it automatically — `[id] { scroll-margin-top: 88px; }` in `base.css`
   already accounts for the fixed navbar.
3. Give it its own config objects — a copy object plus, if it renders a
   list, a separate data array — following the pattern every section so
   far has used (`work` / `categories` / `projects`,
   `servicesSection` / `services`, `about`, `contact`), and add a
   corresponding `js/<section>.js` that follows `js/work.js`'s
   self-contained pattern.
4. Follow the eyebrow-label + one-accent-color + purposeful-animation
   rules in `PROJECT_RULES.md` so new sections feel like part of the
   same site.

---

## 13. Local Preview

No build step needed — just serve the folder over HTTP (opening
`index.html` directly with `file://` will work for layout, but some
browsers block `fetch`/module-style loading over `file://`, and there's no
reason to fight that). Simplest options:

```bash
# Python
python3 -m http.server 8000

# Node (if you have it)
npx serve .
```

Then visit `http://localhost:8000`.


## Phase 3 — Dedicated category pages

The public portfolio supports one page per category:

- `short-form.html`
- `gaming.html`
- `anime-amv.html`
- `long-form.html`
- `thumbnail-design.html`
- `captions-subtitles.html`

The homepage remains the primary entry point. Category pages do not introduce
project-detail or subcategory levels.

There is no admin panel, authentication system, or backend anywhere in this
project. Adding a project is a fully manual, static-file workflow — see
"7. How to Add / Edit Work Projects" and "8. Video Player: How It Works"
above. GitHub only ever stores the website's code, project metadata, and
YouTube video IDs — never video files.
