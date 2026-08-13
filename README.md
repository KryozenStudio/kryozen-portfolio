# Kryozen Studio

A premium, cinematic portfolio foundation for a video editor — pure black,
deep red accent, glassmorphism, and a single orchestrated intro animation.
Static site, zero build step, ready for GitHub Pages.

This build includes the foundation (responsive navbar, hero section,
footer, theme system, config system), the **Work / Portfolio system**
(category filters, search, data-driven project cards), a **video
player**, **About**, **Services**, and **Contact** section, and a
private, unlisted **project-management tool** at `admin/` for generating
project entries without hand-editing JSON-like config syntax. Everything
content-related is edited through `config/site.config.js`; see the table
of contents below for the specific guide you need.

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
│   ├── work.js           Work section: filters, search, cards, sorting
│   ├── player.js         Video player: open/close, playback, fallback
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
│   ├── videos/            project videos (see "Video Player: How It Works")
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
3. Reload the page — the navbar mark and the hero intro logo both update
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
  { name: "Instagram", href: "https://www.instagram.com/kryozen_nv?igsh=MXF4MmMzNGduc2JnMQ==", icon: "instagram" },
],
```

Replace an entry's `href` to change where it points. These render as the
icon row in the footer, **and** as contact methods in the Contact section
(see "How to Edit Contact Methods") — editing this one array updates both
places. Available `icon` values: `discord`, `instagram` (defined in
`js/content-loader.js` — add a new one there if you need another
platform).

The navbar's dedicated **Discord** button and the hero's **Discord**
button both read from a separate field:

```js
nav: {
  discord: { label: "Discord", href: "https://discordapp.com/users/1375134237455417444" },
},
hero: {
  ctaSecondary: { label: "Discord", href: "https://discordapp.com/users/1375134237455417444" },
},
```

Both are already set to the real Discord link. Update both `href` values
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
  eyebrow: "REEL 001 — SHOWREEL",
  heading: "KRYOZEN STUDIO",
  intro: "…your intro paragraph…",
  ctaPrimary: { label: "View Work", href: "#work" },
  ctaSecondary: { label: "Discord", href: "#" },
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
    category: "Anime / AMV",      // must match a string in `categories` below
    thumbnail: "assets/thumbnails/example.jpg",
    video: "assets/videos/example.mp4", // "" is valid — see "Video Player: How It Works"
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

**Categories:** edit the top-level `categories` array to add, rename, or
remove a category. The filter chips regenerate from this list — just make
sure every project's `category` value matches one of these strings exactly:

```js
categories: [
  "Short Form", "Gaming", "Anime / AMV",
  "Long Form", "Thumbnail Design",
],
```

**Search** matches against each project's title and category — nothing
else needs configuring.

**Clicking a card** opens the video player with that project's title,
category, description, software, and video — see "Video Player: How It
Works" below for exactly what happens and how to add a video URL. Each
card dispatches a `kryozen:project-open` browser event with the project's
data; the player is the only thing listening for it (see
`PROJECT_RULES.md` → "Video Player System").

---

## 8. Private Project Management (admin/)

Editing `config/site.config.js` by hand (per §7 above) always works and
is the actual source of truth — but there's also a small private tool at
**`admin/index.html`** that generates that edit for you through a form
instead.

**This page is not linked from the public site anywhere** — no nav entry,
no footer link. It's only reachable if you open it directly (locally:
`admin/index.html`; once deployed: `your-site-url/admin/`). That's its
only protection — there's no password, because a client-side password
can't actually be made secure on a static site, and pretending otherwise
would be worse than not having one. **Don't share that URL**, and don't
add a link to it from anywhere on the public site.

What it does:

- **Add / Edit / Delete projects** through a form (title, category,
  thumbnail/video paths, description, software, date, tags, industry) —
  saved as a draft in this browser's local storage only, seeded from the
  live `config.projects` the first time you open it.
- **Live preview** of the project card using the exact same styling as
  the real site.
- **Export** — a button that generates the properly formatted
  `projects: [...]` array text for your current draft list, ready to
  copy and paste over the array in `config/site.config.js`. That paste +
  commit + push is the actual publish step; nothing on the admin page
  can do that for you (GitHub Pages can't write to its own repository
  from client-side JavaScript).
- **Logo preview** — pick a file to preview it, then replace
  `assets/images/logo/logo.svg` with the real file yourself.

Full architecture notes (the storage abstraction, why it's built this
way, and its known limitations) are in `PROJECT_RULES.md` → "Private
Management System."

---

## 9. Video Player: How It Works

Clicking any project card opens a single modal video player — no page
navigation, no separate detail page.

- **Adding a video:** set a project's `video` field in
  `config/site.config.js` to a path or URL (e.g.
  `"assets/videos/my-edit.mp4"`). Drop the file itself in
  `assets/videos/`.
- **Leaving it empty (`video: ""`)** shows a polished "No video has been
  added for this project yet" state instead of an empty/broken player —
  it's completely safe to publish a project card before its video is
  ready.
- **An invalid or broken video path** (file missing, wrong format, etc.)
  shows a similar "Video unavailable" fallback rather than a broken
  native player — you don't need to double-check every path works before
  publishing.
- **Playback:** the video never starts automatically — not on page load,
  and not when you open a project. It loads with native controls ready,
  and the visitor presses play themselves. Opening a different project,
  or closing the player, always stops and fully unloads the previous
  video; only one can ever be playing.
- **Closing:** the ✕ button, clicking outside the player, or pressing
  Escape all close it the same way, and restore normal page scrolling.
- **Aspect ratio:** the player doesn't force 16:9 — vertical short-form
  edits and widescreen edits both display at their natural size,
  letterboxed on black rather than cropped.

Full technical behavior (event integration, close-path handling, etc.) is
documented in `PROJECT_RULES.md` → "Video Player System", for anyone
extending this file rather than just using it.

---

## 10. How to Edit About Content

Open `config/site.config.js`:

```js
about: {
  eyebrow: "REEL 003 — ABOUT",
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
  Only list software that's actually in use — add entries here as the
  toolkit grows (e.g. when moving to PC editing software). An empty
  array hides the tools strip entirely rather than showing an empty row.
- Keep `bio` short — one paragraph. This section is intentionally not a
  full biography page.

---

## 11. How to Add / Edit / Remove Services

Open `config/site.config.js`. Section heading/subtitle and the service
list are two separate objects:

```js
servicesSection: {
  eyebrow: "REEL 004 — SERVICES",
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
  `gaming`, `amv`, `captions`, `thumbnail` (defined in `js/services.js`).
  Leaving `icon` empty, or using a value not in that list, just omits the
  icon circle — the card still looks correct without one.
- **Empty array:** if `services` is empty, the section shows a "No
  services listed yet" message instead of a blank grid.

---

## 12. How to Edit Contact Methods

Open `config/site.config.js`:

```js
contact: {
  eyebrow: "REEL 005 — CONTACT",
  heading: "Let's Work Together",
  subtitle: "…a short one-line CTA…",
  email: "kryozenstudio@gmail.com",
},
```

`email` is the only Contact-specific field. Leaving it `""` hides the
Email method entirely rather than showing a broken or fake address —
useful if you ever want to drop email and rely on Discord/Instagram only.

Every other contact method (currently Discord and Instagram) is **not**
duplicated here — the Contact section automatically reuses the same
`social` array covered in "How to Edit Social Links" above. Add, remove,
or edit an entry there and it updates in both the footer and Contact
section at once.

There is intentionally **no contact form** — GitHub Pages can't process
form submissions without a separate third-party service, so this project
deliberately uses link/button methods only (email, Discord, Instagram)
instead. See `PROJECT_RULES.md` → "Contact Section" if you're considering
adding a form later.

---

## 13. How to Add Future Sections

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

## 14. Local Preview

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
