# Kinetix Technologies — Codebase Handoff

## 0. Read this first

- Project root: `C:\Users\DELL\OneDrive\Cloud Backup\kinetix-site`
- Remote: `origin https://github.com/PhrankleenTM/kinetix.technologies.git`
- Branch: `main`
- User rules (must be followed):
  1. Do **not** make codebase changes without explicit user consent. Consent was explicitly given for the full CMS/admin panel work completed here.
  2. Keep code comments minimal — 2–3 words is enough.
  3. Update `kinetix.md` after every change.
- This file is the single handoff document. Read top-to-bottom before touching code.
- Start the site with `npm start` (or `npm run dev`), then open:
  - Site: `http://localhost:3000`
  - Admin: `http://localhost:3000/admin.html`
- Default admin password: `admin123`. Change it from the admin panel before deployment.

## 1. Current state / where work stopped

- The static marketing site is complete and now has a zero-dependency Node CMS/admin panel.
- All public HTML pages work as static files, and also receive CMS injection when served by `server.js`.
- CMS content lives in `data/content.json`; DOM binding rules live in `data/bindings.json`.
- Admin panel supports form editing, add/remove/reorder arrays, image upload, save, export/import, raw JSON editing, password change, and logout.
- Default password hash/salt live in `data/admin.json`; this file is blocked from static serving and gitignored.
- Admin login diagnostics were improved after a `Request failed` report: network/server failures now show an explicit `npm start` + localhost message, and the login card displays the same hint.
- If login says `Request failed`, the static HTML is being opened without `server.js`; run `npm start` and use `http://localhost:3000/admin.html`.
- Latest validation passed after all edits:
  - `node --check server.js`
  - `node --check assets/js/cms.js`
  - `node --check assets/js/admin.js`
  - `node --check assets/js/main.js`
  - JSON parse for `data/content.json`, `data/bindings.json`, `package.json`
  - No duplicate JSON keys
  - No missing content paths in bindings
  - No selector token misses across 16 HTML files
  - Server smoke test: injection/page keys, admin exclusion, static blocks, login/cookie, auth gates, upload, save/reflect/restore
- Git commits at handoff:
  - `2cfcfe0 2026-11-22 edit the logo`
  - `f8744a9 2026-11-22 full project basis`
  - `6024a80 2026-11-22 first commit`
- Working tree now includes CMS/admin additions; check `git status --short` before doing anything else.
- Earlier dirty state: `assets/css/style.css` had formatting-only changes from outside this work. Do not revert/commit it without asking the user.
- No automated browser test suite exists; manual desktop/mobile browser review is still the final visual check.

## 2. Big picture

- Static marketing site: **16 HTML pages**, **1 stylesheet**, **3 site scripts**, plus CMS scripts.
- Optional backend: `server.js`, plain Node built-ins only, no dependencies/build step.
- The HTML remains static-friendly: opening a page without the server leaves original HTML intact because `cms.js` is only injected by the server.
- Fonts load from Google Fonts: `Geist` (300–700), `Geist Mono` (400,500), `Instrument Serif` (ital 0,1).
- Contact form builds a `mailto:` link. Email address, subject, opening message, labels, placeholders and project types are CMS-controlled.
- Newsletter forms are local-only simulations; validation/success messages are CMS-controlled.
- Each hero has one `<canvas class="fx" data-fx="...">`; `assets/js/fx.js` reads only the first one found.

## 3. File map

- `server.js` — zero-dependency static server + CMS APIs + HTML injection + auth/uploads.
- `package.json` — npm scripts: `start`, `dev`; Node `>=18`.
- `.gitignore` — ignores `data/admin.json`, `data/*.tmp`, uploads; keeps `assets/uploads/.gitkeep` if present.
- `data/content.json` — all editable site content; top-level keys: `settings`, `seo`, `nav`, `home`, `services`, `work`, `about`, `insights`, `articles`, `collaborations`, `contact`, `ui`, `cta`, `caseStudies`.
- `data/bindings.json` — content-to-DOM binding map; 17 binding entries: `_global`, 7 root pages, 4 case studies, 5 articles.
- `data/admin.json` — generated password hash/salt; default password `admin123`; gitignored and blocked from static serving.
- `assets/uploads/` — generated upload directory; uploaded images are gitignored.
- `admin.html` — admin panel UI.
- `assets/css/admin.css` — admin panel styles, including `.raw-json`.
- `assets/js/admin.js` — admin panel logic, recursive form editor, templates, raw JSON, APIs.
- `assets/js/cms.js` — public CMS renderer injected by `server.js`.
- `index.html` — homepage; `data-fx="flow"`; service cards, work rows, stats, process, quotes, CTA.
- `services.html` — six service sections with IDs `#website`, `#ecom`, `#clinic`, `#inventory`, `#crm`, `#custom`; `data-fx="rings"`.
- `work.html` — filterable portfolio; `data-fx="streaks"`; 7 `.pcard` items; `.chip` filters; `.empty` fallback.
- `about.html` — company story; `data-fx="wave"`.
- `insights.html` — article index (`.alist`) + newsletter section; `data-fx="scan"`.
- `collaborations.html` — partnership options (`.collab-card`); `data-fx="venn"`.
- `contact.html` — contact form `#contact-form` + newsletter section; `data-fx="ripple"`.
- `case-studies/*.html` — 4 case studies; all `data-fx="mesh"`; use `../` paths.
- `insights/*.html` — 5 articles; all `data-fx="mesh"`; add `<div class="progress"></div>` and `.sub`; use `../` paths.
- `assets/css/style.css` — full design system, layout, responsive rules, animations.
- `assets/js/main.js` — nav/menu/reveal/counters/filters/forms/progress/year; CMS-aware messages/email.
- `assets/js/fx.js` — canvas hero animations.
- `assets/img/favicon.svg`, `assets/img/apple-touch-icon.png` — used by every page.
- `assets/img/logo/` — logo variants; header/footer use inline SVG by default, replaceable via CMS `settings.logoImage`.
- `README.md` — UTF-16 LE encoded, contains only `# kinetix.technologies`. Some tools report it as binary.

## 4. Shared page anatomy (all HTML files)

Head (`index.html:1-12` is the canonical example):
- `<meta charset="utf-8">`, viewport, title, description, `theme-color #18181B`, OG tags.
- Favicon + apple touch icon.
- Google Fonts preconnect/stylesheet.
- `<link rel="stylesheet" href="assets/css/style.css">` (or `../assets/...` in subfolders).
- Inline `<script>document.documentElement.classList.add('js')</script>` — required for reveal/fade/word CSS.
- `<noscript>` style that forces `.js .rv`, `.w>span`, `.fade` visible.
- When served by `server.js`, this is injected before `</head>`:
  - `<script>window.__CMS__={content,bindings,page};</script>`
  - `<script src="/assets/js/cms.js" defer></script>`
  - `admin.html` is excluded from injection.

Body:
- `<a class="skip" href="#main">Skip to content</a>`
- `<header class="nav">` → `.container.nav-in` → logo inline SVG (`aria-label="Kinetix Technologies home"`), desktop `nav.links`, CTA `.btn-nav`, `button.burger`.
- `<div class="mobile-menu">` → 7 `.ml` links + CTA.
- `<main id="main">` → hero (`section.hero` or `section.hero.short`) → content sections → CTA.
- `<footer class="footer">` → `.f-grid` (logo/blurb/socials, Navigation, Company, Stay ahead with newsletter) → `.f-bottom` with `.yr-now` → `.wordmark`.
- Scripts at the end, in order: `assets/js/main.js` then `assets/js/fx.js`, both `defer`.

Active nav:
- Current page link gets `class="active"` in desktop nav and mobile menu, plus `aria-current="page"` in desktop nav.
- Case studies mark **Work** active; article pages mark **Insights** active.

Hero:
- `canvas.fx` + `div.grid-bg` first children.
- `.hero-tag.fade` with `.pulse-dot`.
- `h1` words wrapped as `<span class="w"><span style="--i:N">…</span></span>`; `.serif` spans use Instrument Serif.
- `.sub.fade`, `.actions.fade`, `.badges.fade` use `style="--d:…ms"` delays.
- Article pages now include a `.sub.fade` element after `h1` so `articles[slug].sub` is editable.

Subfolder paths:
- `case-studies/` and `insights/` use `../assets/...`, `../index.html`, `../work.html`, `../contact.html`.

## 5. CSS structure (`assets/css/style.css`)

Tokens in `:root` (current working tree):
- `--bg:#18181b`, `--bg-deep:#111113`, `--surface:#1e1e22`, `--surface-2:#27272a`
- `--muted:#a1a1aa`, `--text:#f4f4f5`, `--accent:#fafafa`, `--accent-ink:#18181b`
- `--line:rgba(161,161,170,0.16)`, `--line-strong:rgba(161,161,170,0.34)`
- `--sans` Geist stack, `--serif` Instrument Serif, `--mono` Geist Mono, `--ease:cubic-bezier(0.2,0.7,0.1,1)`

CMS color settings map to these CSS variable names without the `--` prefix:
`bg`, `bg-deep`, `surface`, `surface-2`, `muted`, `text`, `accent`, `accent-ink`, `line`, `line-strong`.

Section markers, in order:
`NAV`, `BUTTONS`, `TYPE`, `HERO`, `badges`, `code showcase`, `marquee`, `reveal`, `cards`, `tags`, `stat strip`, `project cards`, `work rows`, `split text sections`, `services page`, `process`, `quotes`, `CTA`, `forms`, `newsletter`, `case study`, `article`, `insights list`, `collab`, `footer`.

Key layout classes:
- `.container` = `min(1200px, 100% - 48px)`.
- `.section` = large vertical padding clamped by viewport width.
- `.hero` full viewport; `.hero.short` shorter.
- Grids: `.g2`, `.g3`, `.g4`, `.split`, `.row2`, `.steps`, `.pgrid`, `.alist`, `.f-grid`.
- Components: `.card`, `.svc-card`, `.pcard`, `.chip`, `.empty`, `.badge`, `.stat`, `.res`, `.meta-grid`, `.quote`, `.cta`, `.nl`, `.nl-msg`, `.form-msg`, `.progress`, `.next`, `.collab-card`.

Animations/keyframes:
- `ping` (pulse dot), `rise` (word reveal, driven by `--i`), `fadeUp` (`.fade`, driven by `--d`), `blink` (code cursor), `marq` (marquee), `float`/`float2` (SVG viz), `spin`.
- `.rv`/`.step` start hidden and get `.in` from JS.

Breakpoints (approximate, from CSS):
- 1020: nav links → burger; hero grid stacks.
- 980: `.g3`/`.g4` → 2 columns.
- 960: footer grid → 2 columns.
- 900: `.split`, `.sticky`, `.steps` collapse.
- 860: stats → 2 columns.
- 760: `.pgrid`, `.alist`, `.rows` collapse.
- 700: `.meta-grid` → 1 column.
- 640: `.g2`/`.g3`/`.g4` → 1 column; `.feat`/`.row2` collapse.
- 560: `.steps` and footer → 1 column.

Reduced motion:
- CSS and JS both check `prefers-reduced-motion: reduce`. JS shows final states immediately; FX modes draw one static frame.

## 6. JavaScript behavior

### `assets/js/main.js`
- Reads `window.__CMS__.content` into `cms`, `ui`, and `siteEmail`.
- `1-4` — IIFE, `$`/`$$` helpers, `reduce` flag.
- `6-9` — CMS content/UI/email fallbacks.
- `11-18` — `.nav` gains `.scrolled` when `scrollY > 24`.
- `20-22` — burger toggles `body.menu-open`, locks scroll, sets `aria-expanded`; staggered `.mobile-menu a` delays; Escape closes; link click closes.
- `24-33` — IntersectionObserver adds `.in` to `.rv`/`.step`.
- `35-36` — counters: `data-count`, `data-dec`, `data-suffix`; 1600ms cubic ease.
- `38-48` — pointer spotlight on `.card` sets `--mx`/`--my`.
- `50-56` — `.chip` filters `.pcard[data-cat]` using `dataset.cat.split(' ').includes(filter)`; toggles `.empty.show`.
- `58-63` — newsletter validation/success using `ui.newsletterInvalid` / `ui.newsletterSuccess`.
- `65-75` — contact form → `mailto:` using `settings.email`, `ui.contactSubject`, `ui.contactOpening`.
- `77-79` — `.progress` reading bar on article pages.
- `81-82` — `.yr-now` set to current year.

### `assets/js/cms.js`
- Injected only by `server.js`; returns early when `window.__CMS__` is absent.
- Resolves page from `window.__CMS__.page` with `location.pathname` fallback.
- `get(path)` supports dot paths and `caseStudies[slug=mediflow].title` style selectors.
- Renderers: `words`, `badges`, `marquee`, `iconCards`, `serviceCards`, `workRows`, `stats`, `steps`, `quotes`, `chips`, `projects`, `collabCards`, `paragraphs`, `list`, `strongList`, `numberCards`, `serviceRows`, `navLinks`, `ctaLabel`, `mailto`, `socials`, `infoList`, `articleRows`, `articleBlocks`, `caseBlocks`.
- `renderList` supports selector arrays and `replaceWith`.
- Global specials: `seo`, `colors`, `logo`, `ui`, `siteName`, `companyFooter`.
- Page specials: `cta`, `caseNext`, `articleNext`, `typeOptions`.
- `applyAttrs` supports `textFirst`, `placeholder`, `value`.
- Emits `cms:ready` with the content object after rendering.

### `assets/js/admin.js`
- Logs in via `/api/login`, loads `/api/content`, renders section buttons and recursive fields.
- `SECTION_LABELS` has friendly names; `KEY_LABELS` has common field labels.
- `TEMPLATES` provides sensible new-item objects for projects, articles, case studies, services, collabs, cards, badges, steps, quotes, values, details, etc.
- Array items can be added, removed, and reordered.
- Image fields show preview, text path input, and file upload.
- `+ Add field` appears on objects.
- Raw JSON section can apply arbitrary valid object JSON for structural edits.
- Export downloads `kinetix-content.json`; import loads a backup into memory (must click Save).
- Password modal calls `/api/password`; logout calls `/api/logout`.

### `assets/js/fx.js`
- Picks `document.querySelector('canvas.fx')`, mode from `data-fx`, defaults to `flow`.
- Colors: `BG '#18181B'`, `INK '244,244,245'`, `MUTE '161,161,170'`.
- `size()` uses hero bounds, DPR capped at 2, resets mouse, calls `modes[mode].init()`.
- Pointer move/leave tracks smoothed mouse (`sx`, `sy`) relative to the canvas.
- IntersectionObserver pauses the loop when hero is off-screen.
- Resize is debounced 150ms.
- Modes:
  - `flow` (`27-50`) — flow-field particles, cursor repulsion; homepage.
  - `rings` (`53-75`) — orbiting dashed rings with traveling nodes; services.
  - `streaks` (`78-94`) — speed streaks; work.
  - `wave` (`97-109`) — dot grid with cursor-centered wave; about.
  - `scan` (`112-131`) — document lines with sweeping highlight; insights index.
  - `venn` (`134-147`) — drifting overlapping circles; collaborations.
  - `ripple` (`150-161`) — auto ripples + click-to-ping; contact.
  - `mesh` (`164-174`) — drifting radial glows; all case studies + articles.

## 7. CMS server and APIs

### `server.js`
- `PORT` from environment, default `3000`.
- Creates `data/` and `assets/uploads/` if missing.
- Creates `data/admin.json` on first run with `admin123`.
- Password hashing: `crypto.scryptSync`; verification: `crypto.timingSafeEqual`.
- Sessions are in-memory tokens in a `Map`, cookie `cms_token`, `HttpOnly; SameSite=Lax; Path=/`, 12 hours.
- Restarting the server logs everyone out.
- JSON writes are atomic via `.tmp` + rename.
- Uploads accept PNG/JPEG/GIF/WebP data URLs up to 5 MB; sanitized filename + timestamp.
- Static blocks return 403 for:
  - `/data/*`
  - `/server.js`
  - `/package.json`
- All HTML except `admin.html` is injected with CMS payload and `cms.js`.
- `injectCms(html, route)` derives `page`:
  - `/` → `index.html`
  - trailing `/` → append `index.html`
  - nested paths preserved, e.g. `case-studies/mediflow.html`

### Endpoints
- `GET /api/content` — public content JSON.
- `GET /api/status` — `{ authenticated }`.
- `POST /api/login` — password → cookie.
- `POST /api/logout` — clears cookie/session.
- `POST /api/content` — authenticated; saves entire content object.
- `POST /api/upload` — authenticated; image upload.
- `POST /api/password` — authenticated; min 8 characters; rehashes `admin.json`.

## 8. Content inventory

### Root pages
- `index.html` — title `Kinetix Technologies | Websites, Clinic Systems & ERP Modules`; `flow`; badges `40%`, `3.2x`, `100%`; stats add `98%` inventory accuracy.
- `services.html` — title `Services | Kinetix Technologies`; `rings`; six sections with anchor IDs listed above.
- `work.html` — title `Selected Work | Kinetix Technologies`; `streaks`.
- `about.html` — title `About | Kinetix Technologies`; `wave`; hero `We are Kinetix.`
- `insights.html` — title `Insights | Kinetix Technologies`; `scan`.
- `collaborations.html` — title `Collaborations | Kinetix Technologies`; `venn`; hero `Let’s build together.`
- `contact.html` — title `Contact | Kinetix Technologies`; `ripple`; hero `Let’s talk.`

### Work cards (`work.html`)
| Card | `data-cat` | Link |
|---|---|---|
| MediFlow | `clinic` | `case-studies/mediflow.html` |
| Commerce Website | `websites ecommerce` | `contact.html` |
| StockPilot | `erp` | `case-studies/stockpilot.html` |
| Corporate Website | `websites` | `contact.html` |
| Cobalt | `ecommerce` | `case-studies/cobalt.html` |
| Pulse | `crm` | `case-studies/pulse.html` |
| Launch Page | `websites` | `contact.html` |

- `custom` chip has no matching card → shows `.empty`.
- Card visuals are inline SVG with `.float`/`.float2`; no image files needed.

### Case studies
| File | Project | Meta | Results |
|---|---|---|---|
| `case-studies/mediflow.html` | MediFlow | Clinic Management System · 2025 · Multi-branch medical practice | `40%` less admin time, seconds to book, near-zero billing errors |
| `case-studies/stockpilot.html` | StockPilot | Inventory & ERP · 2026 · Distribution company | inventory/sales management |
| `case-studies/cobalt.html` | Cobalt | E-Commerce Platform · 2026 · B2B brand | payments, subscriptions, orders |
| `case-studies/pulse.html` | Pulse | CRM & Business Tools · 2026 · Growing services team | leads, follow-ups, reporting |

- Structure: hero + `.meta-grid` + `.prose` with `.case-block` / `.split` / `.sticky` + `.next` + CTA.
- "Next project" chain: MediFlow → Cobalt → StockPilot → Pulse → MediFlow.

### Articles
| File | Date | Title |
|---|---|---|
| `insights/why-clinic-systems-fail.html` | September 2026 | Why most clinic systems fail (and how to avoid it) |
| `insights/real-cost-of-a-slow-website.html` | August 2026 | The real cost of a slow website |
| `insights/principles-inventory-design.html` | July 2026 | 5 principles we use when designing inventory systems |
| `insights/custom-vs-off-the-shelf.html` | June 2026 | How to choose between a custom system and off-the-shelf tools |
| `insights/designing-for-non-technical-users.html` | May 2026 | Designing for non-technical users |

- Structure: `<div class="progress"></div>` + hero + `.sub` + `.ameta` + `.article` with `h2`/`p`/`ul`/`.pull` + "Keep reading" + CTA.
- "Keep reading" chain follows the same order as the table, wrapping to the first.

## 9. Conventions and gotchas

- Paths: root pages use bare names; `case-studies/` and `insights/` use `../`.
- Every page repeats the inline logo SVG twice (header + footer). Both copies define `clipPath` IDs `kx-n` and `kx-cap` — duplicate IDs per page. Harmless in current browsers, but note if adding more SVG defs.
- CTA headings may contain literal asterisks, e.g. `*performs?*`; check `data/content.json` before changing.
- `.progress` only exists on article pages.
- `fx.js` uses first `canvas.fx` only; adding a second hero canvas will not animate it.
- Newsletter success is fake; no backend, no opt-in record.
- Contact form's required fields: `name`, `email`, `type`. `company`, `budget`, `message` optional.
- `README.md` is UTF-16 LE; use UTF-8-aware tooling carefully.
- Keep comments minimal (2–3 words). Existing code comments are mostly section labels like `/* NAV */`, `// reveal on scroll`.
- Avoid PowerShell `ConvertTo-Json` on `data/content.json`; it previously reformatted the file and damaged `·` characters. Use Node/admin panel instead.
- `data/admin.json` is secret-ish state; never commit it. Uploads are gitignored.
- `GET /api/content` is public because page content itself is public. Write APIs are authenticated.
- If adding a binding path, verify it resolves in `data/content.json`; if adding a selector, verify the target HTML contains it.
- `bindings.json` must not have duplicate object keys; duplicate `_global.list` keys previously caused silent overwrite.

## 10. How to make common changes

Always: update `kinetix.md` → make requested change → validate → report what changed. For this CMS work, explicit consent was already granted.

### Use the admin panel
- Start `npm start`, open `http://localhost:3000/admin.html`, log in with the current password.
- Pick a section, edit fields, click **Save**. Refresh the public site.
- Add arrays with the `+ Add …` buttons; remove/reorder with item controls.
- New array items use `TEMPLATES`; fallback clones the first item shape.
- Upload images in image fields; saved path becomes `/assets/uploads/...`.
- Use **Export** before risky edits; use **Import** to load a backup, then **Save**.
- Use **Raw JSON** for structural edits, then apply and save.
- Change password from the admin panel after first login.

### Add/adjust page content
- Prefer editing `data/content.json` through the admin panel.
- If adding a new visible field, also add a binding in `data/bindings.json` and/or a renderer/special in `assets/js/cms.js`.
- Keep `data-fx`, `.rv`, `.fade`, `--i`, `--d` patterns; set active nav links.

### Add a service
- Add item to `services.items` and preferably `home.services.cards`.
- Keep anchor IDs aligned with links, e.g. `services.html#website`.

### Add a portfolio item
- Add to `work.projects`, with `category`, `categories`, `tags`, `year`, image or `viz`, and link.
- Add matching `caseStudies` entry and page if there is a case study; update `.next` chain slug.

### Add an article
- Add file in `insights/`, add `.alist` entry via `articles`, include `.progress`, `.sub`, use `../` paths, update "Keep reading" chain.
- Add `insights/<slug>.html` to `data/bindings.json` with title/block/text paths and `articleNext`.

### Change visuals/motion/forms
- Visuals: edit tokens/component blocks in `assets/css/style.css`; respect breakpoints above.
- Motion: edit `assets/js/fx.js` mode or add a new mode and set `data-fx`; keep reduced-motion behavior.
- Forms: `assets/js/main.js` handles newsletter and contact mailto; keep `#name`, `#email`, `#type`, `#form-msg` IDs aligned.

## 11. Validation checklist

Run after CMS/binding/content edits:

```powershell
node --check server.js
node --check assets/js/cms.js
node --check assets/js/admin.js
node --check assets/js/main.js
node -e "for (const f of ['data/content.json','data/bindings.json','package.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm start
```

Smoke-test manually:
- `/` shows injected `window.__CMS__` with `"page":"index.html"`.
- `/case-studies/mediflow.html` shows `"page":"case-studies/mediflow.html"`.
- `/admin.html` has no `window.__CMS__`.
- `/data/admin.json`, `/data/content.json`, `/server.js`, `/package.json` return 403.
- `/api/status` is `{ "authenticated": false }` when logged out.
- Upload/save require auth; login uses current password; save reflects on public site.
- Restore content after any test mutation.

## 12. Open questions / optional follow-ups

- Confirm whether the uncommitted `assets/css/style.css` reformat should be kept.
- Deploy behind HTTPS and change the default admin password.
- For multi-user production, replace in-memory sessions and file-based password with a proper store.
- Add a real newsletter/contact backend if needed.
- Replace placeholder social URLs with real profiles if provided.
- Manual browser pass at desktop/mobile widths after CMS edits; no browser test suite exists.
