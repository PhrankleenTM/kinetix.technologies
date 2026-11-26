# Kinetix Technologies — Codebase Handoff

## 0. Read this first

- Project root: `C:\Users\DELL\OneDrive\Cloud Backup\kinetix-site`
- Remote: `origin https://github.com/PhrankleenTM/kinetix.technologies.git`
- Branch: `main`
- User rules (must be followed):
  1. Do **not** make codebase changes without explicit user consent. Consent was explicitly given for the CMS/admin/Vercel work.
  2. Keep code comments minimal — 2–3 words is enough.
  3. Update `kinetix.md` after every change.
- This file is the single handoff document. Read top-to-bottom before touching code.
- Production target: **Vercel**. The hosted site must work without `npm start`.
- Local development is optional: `npm start` (or `npm run dev`), then:
  - Site: `http://localhost:3000`
  - Admin: `http://localhost:3000/admin`
- Clean public URLs:
  - `/`, `/services`, `/work`, `/about`, `/insights`, `/collaborations`, `/contact`
  - `/case-studies/<slug>` (generic template rendered from CMS; covers existing and new projects)
  - `/insights/<slug>`
  - `/admin`
- Admin seed password: `ADMIN_PASSWORD` if set, otherwise `admin123`; set `ADMIN_PASSWORD` in production.

## 1. Current state / where work stopped

- The static marketing site has a CMS/admin panel that works locally and on Vercel.
- Public pages fetch CMS data from `/api/bootstrap`; local server injection was removed.
- Writes, auth, and uploads are handled by `/api/*` Vercel serverless functions.
- Hosted persistent records use **Neon/Postgres** via `DATABASE_URL`:
  - `cms_kv` — editable site content
  - `cms_admin` — password hash/salt and persistent `sessionKey`
  - `cms_uploads` — uploaded image metadata
  - `cms_submissions` — contact and newsletter submissions
- Vercel Blob stores uploaded image binaries; Postgres stores upload metadata and the `/api/media?path=...` public URLs.
- First DB-backed request creates tables and seeds content from `data/content.json`; admin seeds with `ADMIN_PASSWORD` or `admin123` and a generated `sessionKey`.
- When no DB or Blob configuration exists, legacy local JSON/file fallback remains only for local development.
- `data/bindings.json` stays repo-static and is returned by `/api/bootstrap`.
- Auth uses a stateless signed `cms_token` cookie; restarting or redeploying no longer logs users out.
- The signing key is stored as `sessionKey` in `cms_admin` when DB is configured; changing Blob vars does not invalidate active sessions.
- Admin is Projects-only and auto-creates/updates matching `caseStudies` entries on save.
- Every Work project has a detail page at `/case-studies/<slug>`; no hardcoded HTML page is needed for new projects.
- Blob store access mode cannot be changed after store creation. Code supports both public and private stores by trying both access modes unless `BLOB_ACCESS` is set.
- A Blob store must still be connected once to the Vercel project. No manual API URL configuration is needed.
- Admin is linked from every public page footer under **Company**.
- Public hrefs are extensionless. `seo` keys and binding keys still contain `.html` because they are internal page identifiers.
- `README.md` is UTF-16 LE and may appear binary to tools.
- No automated browser test suite exists; manual desktop/mobile review is the final visual check.

## 2. Big picture

- Static marketing site: **16 HTML pages**, **1 stylesheet**, **site scripts + CMS scripts**.
- Local server: `server.js`, plain Node built-ins, used only for local development/testing.
- Hosted backend: Vercel serverless functions in `api/`, using `@vercel/blob`.
- The HTML remains static-friendly. Without CMS data, original HTML is still readable; `/assets/js/cms-loader.js` enhances it with editable content.
- Fonts load from Google Fonts: `Geist` (300–700), `Geist Mono` (400,500), `Instrument Serif` (ital 0,1).
- Contact form posts to `POST /api/contact`; submissions are saved in Postgres and emailed via Gmail SMTP to `kinetix.technologies.web@gmail.com`.
- Newsletter forms post to `POST /api/newsletter`; each signup is saved in Postgres and emailed via Gmail SMTP to the same address.
- CMS content, admin state, upload metadata, and form submissions use Postgres as source of truth when `DATABASE_URL` is set.
- Form status/labels are CMS-controlled through `ui`; fallback email is `settings.email`.
- Heroes use locally stored blurred stock photos plus the static `.grid-bg` overlay; there is no canvas background animation.
- Hero headings use one font family: `--sans` Geist, the font used in "We build digital systems that"; mono labels/code and serif text outside hero headings are unchanged.
- Branding uses the supplied Kinetix logo set: transparent full logos for header/footer, background favicons for browser tabs, and background PNGs for Apple touch icons.
- Light mode uses `kinetix-full-light.svg`, `favicon.svg`, and `apple-touch-icon.png`; dark mode uses `kinetix-full-dark.svg`, `favicon-dark.svg`, and `apple-touch-icon-dark.png`.
- Browser favicons are square, enlarged crops of the new logo's `K` glyph so they remain visible at tab sizes.

## 3. File map

- `server.js` — local static server, clean URL routing, and dispatch to `api/` handlers.
- `package.json` — `start`/`dev` scripts; `@vercel/blob`, `pg`, and `nodemailer` dependencies; Node `>=18`.
- `package-lock.json` — lockfile generated by `npm install @vercel/blob`, `npm install nodemailer`, and `npm install pg`.
- `.gitignore` — ignores `node_modules/`, `.vercel/`, env files, local admin state, temp files, and uploads.
- `vercel.json` — clean rewrites for `/admin`, root pages, articles, and generic case-study template.
- `api/_lib/db.js` — Postgres pool, schema bootstrap, KV/admin/upload/submission queries.
- `api/_lib/store.js` — DB/Blob/local storage routing, password hashing, stored session key, signed cookies, HTTP helpers, page normalization.
- `api/_lib/mail.js` — Gmail SMTP transport, environment config, recipient, and header sanitization.
- `api/contact.js` — `POST /api/contact`; validates and emails project enquiries.
- `api/newsletter.js` — `POST /api/newsletter`; validates and emails signup notifications.
- `api/bootstrap.js` — `GET /api/bootstrap`; returns `{ content, bindings, page }`.
- `api/content.js` — `GET/POST /api/content`.
- `api/status.js` — `GET /api/status`.
- `api/login.js` — `POST /api/login`.
- `api/logout.js` — `POST /api/logout`.
- `api/upload.js` — `POST /api/upload`.
- `api/media.js` — `GET /api/media?path=...`; serves Blob uploads, including private stores.
- `api/password.js` — `POST /api/password`.
- `data/content.json` — default/local editable content; top-level keys: `settings`, `seo`, `nav`, `home`, `services`, `work`, `about`, `insights`, `articles`, `collaborations`, `contact`, `ui`, `cta`, `caseStudies`.
- `data/bindings.json` — content-to-DOM binding map; 17 binding entries: `_global`, 7 root pages, 4 case studies, 5 articles.
- `data/admin.json` — generated local password hash/salt; gitignored and blocked from static serving.
- `assets/uploads/` — local upload fallback; hosted uploads go to Blob.
- `admin.html` — admin panel UI.
- `assets/css/admin.css` — admin panel and Projects CMS styles.
- `assets/js/admin.js` — Projects-only admin logic; add/edit/remove projects, slugs, details, uploads, save, backup, password.
- `assets/js/cms-loader.js` — fetches `/api/bootstrap`, supports `window.__CMS_PAGE__`, dynamically loads `cms.js`, calls `init(data)`.
- `assets/js/cms.js` — public CMS renderer; generic case-study binding; exposes `window.KinetixCMS.init`.
- `assets/js/main.js` — theme toggle, nav/menu/reveal/counters/filters/forms/progress/year; updates on `cms:ready`.
- `index.html`, `services.html`, `work.html`, `about.html`, `insights.html`, `collaborations.html`, `contact.html` — root public pages.
- `case-studies/project.html` — generic CMS-driven detail page for every project slug.
- `case-studies/*.html` — 4 original case-study pages kept as static fallbacks.
- `insights/*.html` — 5 article pages.
- `assets/css/style.css` — full design system, layout, responsive rules, blurred hero photos, animations, and page fade.
- `assets/img/favicon.svg`, `assets/img/favicon-dark.svg` — light/dark square `K` browser tab icons linked by every page and swapped by `main.js`.
- `assets/img/apple-touch-icon.png`, `assets/img/apple-touch-icon-dark.png` — light/dark Apple touch icons swapped by `main.js`.
- `assets/img/hero/` — locally stored Pexels hero photos (Pexels License); each page sets `--hero-img` on its `.hero`.
- `assets/img/logo/kinetix-full-light.svg`, `assets/img/logo/kinetix-full-dark.svg` — transparent full logos used by header and footer; `kinetix-full-light-background.svg` and `kinetix-full-dark-background.svg` are source background variants.

## 4. Shared page anatomy

Head:
- `<meta charset="utf-8">`, viewport, title, description, `theme-color`, OG tags.
- Favicon + apple touch icon.
- Google Fonts preconnect/stylesheet.
- Stylesheet link.
- Inline script adds `.js`, sets `data-theme` from `kinetix-theme` (default light), and syncs `theme-color` before CSS paints.
- `<noscript>` style that forces `.js .rv`, `.w>span`, `.fade` visible.
- No server-side CMS injection in production.

Body:
- `<a class="skip" href="#main">Skip to content</a>`
- `<header class="nav">` → `.container.nav-in` → legacy logo inline SVG hidden by CSS and replaced with a theme-aware background image, desktop `nav.links`, CTA `.btn-nav`, injected `.desktop-theme`, `button.burger`.
- `<div class="mobile-menu">` → 7 `.ml` links + CTA.
- `<main id="main">` → hero → content sections → CTA.
- `<footer class="footer">` → `.f-grid` (logo/blurb/socials, Navigation, Company, Stay ahead with newsletter) → `.f-bottom` with `.yr-now` → `.wordmark` rendered as the supplied theme-aware full logo.
- Company footer ends with `<li><a href="/admin">Admin</a></li>`.

Scripts at the end:
- `<script src="/assets/js/cms-loader.js" defer></script>`
- `assets/js/main.js` or `../assets/js/main.js`, `defer`
- `cms.js` is loaded dynamically by `cms-loader.js`.

Active nav:
- Current page link gets `class="active"` in desktop nav and mobile menu, plus `aria-current="page"` in desktop nav.
- Case studies mark **Work** active; article pages mark **Insights** active.

## 5. CSS structure (`assets/css/style.css`)

Tokens in `:root`:
- `--bg:#18181b`, `--bg-deep:#111113`, `--surface:#1e1e22`, `--surface-2:#27272a`
- `--muted:#a1a1aa`, `--text:#f4f4f5`, `--accent:#fafafa`, `--accent-ink:#18181b`
- `--line:rgba(161,161,170,0.16)`, `--line-strong:rgba(161,161,170,0.34)`
- Base tokens read `--cms-*` overrides so CMS colors still control dark mode.
- Light theme sets direct tokens under `html[data-theme="light"]` and overrides hardcoded dark surfaces.
- `--sans` Geist stack, `--serif` Instrument Serif, `--mono` Geist Mono, `--ease:cubic-bezier(0.2,0.7,0.1,1)`
- `.hero h1 .serif` overrides `--serif` with `--sans`; other `.serif` elements keep Instrument Serif.
- `.logo::before` and `.wordmark` hide legacy inline text/SVG and display theme-aware logo background images; the header logo renders at `156px × 56px` so "Technologies" stays visible.

CMS color settings map to CSS variables named `--cms-<setting key>`; they do not override light mode.

Section markers include:
`NAV`, `BUTTONS`, `TYPE`, `HERO`, badges, code showcase, marquee, reveal, cards, tags, stat strip, project cards, work rows, split text sections, services page, process, quotes, CTA, forms, newsletter, case study, article, insights list, collab, footer.

Mobile menu:
- `.mobile-menu` uses safe centering, scroll overflow, `84px 24px 28px` padding, and `2px` gaps so all links plus CTA fit on short screens.
- `.mobile-menu a.ml` uses `clamp(1.65rem, 7vw, 2.25rem)` with `10px` vertical padding; `.mobile-menu .btn` uses reduced margin/padding.
- Theme toggle: `.theme-toggle.desktop-theme` only in the navbar; icons are injected by `main.js`.

Admin visibility:
- `assets/css/admin.css` defines `[hidden] { display: none !important; }` so author `display:grid` rules cannot override `#login` and `#app` hidden toggles.

Key layout classes:
- `.container` = `min(1200px, 100% - 48px)`.
- `.section` = large vertical padding clamped by viewport width.
- `.hero` full viewport; `.hero.short` shorter.
- Grids: `.g2`, `.g3`, `.g4`, `.split`, `.row2`, `.steps`, `.pgrid`, `.alist`, `.f-grid`.
- Components: `.card`, `.svc-card`, `.pcard`, `.chip`, `.empty`, `.badge`, `.stat`, `.res`, `.meta-grid`, `.quote`, `.cta`, `.nl`, `.nl-msg`, `.form-msg`, `.progress`, `.next`, `.collab-card`.

Animations:
- `pageIn`, `ping`, `rise`, `fadeUp`, `blink`, `marq`, `float`, `float2`, `spin`.
- `.rv`/`.step` start hidden and get `.in` from JS.
- Same-origin page navigation fades out then fades in; CSS animations stay enabled even if the OS requests reduced motion.

## 6. JavaScript behavior

### `assets/js/cms-loader.js`

- Computes the binding page key from `location.pathname` unless `window.__CMS_PAGE__` is set.
- Fetches `/api/bootstrap?page=<pageKey>` with `cache: no-store`.
- Dynamically loads `/assets/js/cms.js` if `window.KinetixCMS` is absent.
- Sets `window.__CMS__` and calls `window.KinetixCMS.init(data)`.
- Warns in console if CMS data is unavailable; original HTML remains intact.

### `assets/js/cms.js`

- Exposes `window.KinetixCMS = { init }`.
- Guards against double initialization.
- Resolves page from `data.page` with normalized `location.pathname` fallback.
- Reads `window.__CMS_SLUG__` for generic case-study routes.
- Builds a dynamic case-study binding for `case-studies/project.html` from the requested slug.
- `get(path)` supports dot paths and `caseStudies[slug=mediflow].title` style selectors.
- `findBySlug` strips URL/path and `.html` so clean links and old values both work.
- Renderers: `words`, `badges`, `marquee`, `iconCards`, `serviceCards`, `workRows`, `stats`, `steps`, `quotes`, `chips`, `projects`, `collabCards`, `paragraphs`, `list`, `strongList`, `numberCards`, `serviceRows`, `navLinks`, `ctaLabel`, `mailto`, `socials`, `infoList`, `articleRows`, `articleBlocks`, `caseBlocks`.
- Generated links use clean URLs: `/contact`, `/services`, `/case-studies/<slug>`, `/insights/<slug>`.
- Global specials: `seo`, `colors`, `logo`, `ui`, `siteName`, `companyFooter`; `logoImage` may inject an `<img>`, but CSS hides header logos so the supplied theme-aware asset stays authoritative.
- `colors` writes `--cms-*` variables; light mode stays on its own palette.
- `seo` does not write `theme-color`; the active theme controls it.
- Page specials: `cta`, `caseNext`, `articleNext`, `typeOptions`.
- Emits `cms:ready` with the content object after rendering.

### `assets/js/main.js`

- `cms`, `ui`, and `siteEmail` are mutable.
- Listens for `cms:ready` and refreshes CMS-derived strings.
- Injects the desktop theme button, applies stored theme or light default, persists `kinetix-theme` in `localStorage`, syncs `theme-color`, swaps favicon/Apple touch icon, and updates button icons.
- Handles nav scroll state, burger menu, same-origin page fade, reveals, counters, card spotlight, work filters, newsletter/contact form POSTs, reading progress, and footer year.

### `assets/js/admin.js`

- Focused Projects CMS only: login, project card grid, add/edit/remove project, cover image upload, live preview, save, export/import backup, password change, logout.
- Project fields: name, auto slug, category, year, short description, full details, tags, filter categories, fallback illustration.
- Every project gets `/case-studies/<slug>`; on save, matching `state.caseStudies` entries are created/updated.
- Existing rich case-study blocks are preserved; new projects get generated Overview/Capabilities/The brief blocks.
- Handles `401` by showing the login screen and asking the user to sign in again.
- No section navigation, no raw JSON editor, no generic field editor.

## 7. Serverless/storage architecture

### `api/_lib/db.js`

- Requires `DATABASE_URL`; missing DB throws `DB_NOT_CONFIGURED`.
- Uses `pg.Pool`; `DB_POOL_MAX` defaults to `1`, suitable for Vercel serverless.
- Lazily creates `cms_kv`, `cms_admin`, `cms_uploads`, and `cms_submissions` on first DB query.
- `cms_kv` stores the whole site content object under `content`.
- `cms_admin` stores one row with password hash/salt and persistent `sessionKey`.
- `cms_uploads` stores Blob path, public URL, content type, and byte size.
- `cms_submissions` stores contact/newsletter payloads as JSONB with timestamps.

### `api/_lib/store.js`

- Detects DB configuration from `DATABASE_URL`; production should always set it.
- Detects Blob configuration from `BLOB_READ_WRITE_TOKEN` or `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`.
- With DB configured, `getContent`/`saveContent` read/write `cms_kv` and seed from `data/content.json` once.
- With DB configured, `getAdmin`/`saveAdmin` read/write `cms_admin`; first admin seeds with `ADMIN_PASSWORD` or `admin123` and a generated `sessionKey`.
- With DB configured, `saveUpload` writes binaries to Blob, records metadata in `cms_uploads`, and returns `/api/media?path=...`.
- With DB configured, `getMedia` validates the path, checks `cms_uploads`, then streams the Blob object; old Blob paths are backfilled into DB metadata.
- Without DB, legacy Blob/local JSON/file fallback remains for local-only development.
- Lazy-loads `@vercel/blob`.
- Tries `public` then `private` Blob access by default; set `BLOB_ACCESS=public` or `BLOB_ACCESS=private` to force one.
- Password hashing uses `crypto.scryptSync`; verification uses `crypto.timingSafeEqual`.
- Password changes preserve `sessionKey` and refresh the session cookie.
- Sessions are HMAC-signed JSON payloads in `cms_token`, 12 hours, `HttpOnly; SameSite=Lax; Path=/`.
- Session secret comes from stored `sessionKey`, then `CMS_SECRET`, then a fallback development secret.
- `sendJson`, `readBody`, `normalizePage`, and `normalizeMediaPath` are shared helpers.

### `server.js`

- Local development only.
- Dispatches `/api/*` to the same handler files used by Vercel.
- Serves static files and clean URLs:
  - `/admin` → `admin.html`
  - `/services` → `services.html`
  - `/case-studies/<slug>` → `case-studies/project.html`
  - `/insights/<slug>` → `insights/<slug>.html`
- Blocks `api/`, `data/`, `node_modules/`, `server.js`, `package.json`, `package-lock.json`, `vercel.json`, dotfiles, and `.tmp`.
- Port from `PORT`, default `3000`.

### `vercel.json`

- Rewrites admin/root pages to their `.html` files.
- `/admin` → `/admin.html`.
- `/case-studies/:slug` → `case-studies/project.html` so new CMS projects work.
- `/insights/:slug` → `insights/<slug>.html`.

### Endpoints

- `GET /api/bootstrap` — public `{ content, bindings, page }`.
- `GET /api/content` — public content JSON.
- `POST /api/content` — authenticated; saves entire content object.
- `GET /api/status` — `{ authenticated, storage: { database, blob } }`.
- `POST /api/login` — password → signed cookie.
- `POST /api/logout` — clears cookie.
- `POST /api/upload` — authenticated; PNG/JPEG/GIF/WebP data URL up to 5 MB; binary to Blob, metadata to Postgres.
- `GET /api/media?path=...` — validates DB upload metadata, then streams Blob.
- `POST /api/password` — authenticated; min 8 characters; rehashes admin record in Postgres and refreshes cookie.
- `POST /api/contact` — public; name/email/message required; saves to `cms_submissions`, then emails the enquiry to `MAIL_TO`.
- `POST /api/newsletter` — public; email required; saves to `cms_submissions`, then emails each signup to `MAIL_TO`.

### Database and storage env

- `DATABASE_URL` — required in production; Neon pooled Postgres connection string.
- Vercel CLI is linked to `phrankleentms-projects/kinetix.technologies`; `.vercel/` and `.env*` are ignored.
- Hosted env check found Gmail, Blob, and `DATABASE_URL` (Secret, Production/Preview/Development).
- Neon project `flat-pond-91807634` (`kinetix-technologies`) is in `aws-us-east-1`, matching Vercel's `iad1` functions.
- `DB_POOL_MAX` — optional; defaults to `1`.
- `ADMIN_PASSWORD` — admin seed password; use a strong secret in production.
- Blob connection uses `BLOB_READ_WRITE_TOKEN` or `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`.
- `BLOB_ACCESS` — optional `public` or `private`; default tries both.
- Forms return `503` with `Database storage is not configured yet.` if `DATABASE_URL` is missing.

### Gmail SMTP

- Recipient defaults to `kinetix.technologies.web@gmail.com`; override with `MAIL_TO`.
- Required Vercel env var: `GMAIL_APP_PASSWORD` — a 16-character Gmail App Password, not the normal Gmail password.
- `GMAIL_USER` defaults to `MAIL_TO`; set it only when sending from a different Gmail account.
- Gmail App Passwords require 2-Step Verification on the sending Google account.
- Optional: `GMAIL_SMTP_HOST`, `GMAIL_SMTP_PORT` (default `465`), `GMAIL_SMTP_SECURE`.
- Without `GMAIL_APP_PASSWORD` or `GMAIL_SMTP_PASSWORD`, form APIs return `503` and the browser shows a clear fallback message.
- Honeypot field `website`, field length limits, and CRLF-safe headers reduce basic bot/header abuse.

## 8. Content inventory

### Root pages

- `index.html` — homepage; `flow`; badges `40%`, `3.2x`, `100%`.
- `services.html` — six service sections with IDs `#website`, `#ecom`, `#clinic`, `#inventory`, `#crm`, `#custom`; `rings`.
- `work.html` — filterable portfolio; `streaks`; 7 `.pcard` items; `.chip` filters; `.empty` fallback.
- `about.html` — company story; `wave`.
- `insights.html` — article index + newsletter; `scan`.
- `collaborations.html` — partnership options; `venn`.
- `contact.html` — contact form `#contact-form` + newsletter; `ripple`.

### Work cards

| Card | `data-cat` | Link |
|---|---|---|
| MediFlow | `clinic` | `/case-studies/mediflow` |
| Commerce Website | `websites ecommerce` | `/case-studies/commerce-website` |
| StockPilot | `erp` | `/case-studies/stockpilot` |
| Corporate Website | `websites` | `/case-studies/corporate-website` |
| Cobalt | `ecommerce` | `/case-studies/cobalt` |
| Pulse | `crm` | `/case-studies/pulse` |
| Launch Page | `websites` | `/case-studies/launch-page` |

- `custom` chip has no matching card → shows `.empty`.

### Case studies

- `mediflow` — Clinic Management System · 2025.
- `stockpilot` — Inventory & ERP · 2026.
- `cobalt` — E-Commerce Platform · 2026.
- `pulse` — CRM & Business Tools · 2026.
- All Work projects now have a `caseStudies` entry and slug-based detail page.
- New entries are generated from project name/category/year/description/details/tags when saved in admin.
- Existing rich blocks are preserved; `next` follows Work project order and wraps.
- Detail pages render through `case-studies/project.html` with dynamic CMS bindings.

### Articles

- `why-clinic-systems-fail` — September 2026.
- `real-cost-of-a-slow-website` — August 2026.
- `principles-inventory-design` — July 2026.
- `custom-vs-off-the-shelf` — June 2026.
- `designing-for-non-technical-users` — May 2026.

## 9. Conventions and gotchas

- Public URLs contain no `.html`; internal binding/SEO keys still do.
- In case-studies and articles, asset paths still use `../assets/...`; public links are absolute clean URLs.
- Every page repeats the inline logo SVG twice. Duplicate `clipPath` IDs are harmless but note if adding SVG defs.
- CTA headings may contain literal asterisks, e.g. `*performs?*`; check content before changing.
- `.progress` only exists on article pages.
- Newsletter submits to `/api/newsletter`; each signup is saved in `cms_submissions` and emailed.
- Contact form's required fields: `name`, `email`, `message`; `type` is optional and defaults to `General enquiry`.
- Forms are public and rate limiting is not implemented; Gmail may still flag unusual volume.
- Keep comments minimal (2–3 words).
- Avoid PowerShell `ConvertTo-Json` on `data/content.json`; it previously reformatted the file and damaged `·` characters.
- `data/admin.json` is secret-ish local state; never commit it.
- `GET /api/content` is public because page content is public. Write APIs are authenticated.
- A `401` in admin means the cookie/session expired or changed; sign in again.
- Project detail pages use the slug in the path, not a matching HTML filename.
- Blob store access mode cannot be changed after creation. Use `BLOB_ACCESS` only if auto-detection is undesirable.
- Production should set `DATABASE_URL`; once set, hosted reads/writes use Postgres instead of Blob/local fallback.
- Browser `localStorage` is intentionally kept only for `kinetix-theme`; all project records are DB-backed.
- Do not commit `assets/css/style.css` unless explicitly asked; it had pre-existing formatting-only changes.
- `npm audit` currently reports high-severity transitive findings after adding `@vercel/blob`; review before production hardening.

## 10. Common changes

Always: update `kinetix.md` → make requested change → validate → report what changed.

### Use the admin panel

- Local: run `npm start`, open `http://localhost:3000/admin`.
- Hosted: open `/admin` on the deployed domain.
- Manage only **Projects**: click **+ Add project** or click a project card.
- Set project name, page slug, category, year, short description, full details, tags, filters, and cover image.
- Click **Save changes**; the public Work card and `/case-studies/<slug>` page update together.
- Matching `caseStudies` entries are generated/updated automatically; rich existing blocks are preserved.
- Upload cover images; saved path becomes `/api/media?path=...` on Blob-backed deployments.
- Use **Export** before risky edits; use **Import** to load a backup, then **Save**.
- Change password from the admin panel after first login.

### Add/adjust page content

- Prefer editing `data/content.json` through the admin panel.
- If adding a new visible field, also add a binding in `data/bindings.json` and/or a renderer/special in `assets/js/cms.js`.
- Keep `data-fx`, `.rv`, `.fade`, `--i`, `--d` patterns; set active nav links.

### Add a service

- Add item to `services.items` and preferably `home.services.cards`.
- Keep anchor IDs aligned with links, e.g. `/services#website`.

### Add a portfolio item

- Prefer adding through `/admin`; it sets `slug`, `link`, and matching `caseStudies` entry.
- Manual entries need `category`, `categories`, `tags`, `year`, `slug`, `details`, image or `viz`.
- Link becomes `/case-studies/<slug>` and renders through `case-studies/project.html`.
- No new HTML file or `data/bindings.json` entry is needed for new projects.

### Add an article

- Add file in `insights/`, add `.alist` entry via `articles`, include `.progress` and `.sub`, use absolute clean public links.
- Add `insights/<slug>.html` to `data/bindings.json` with title/block/text paths and `articleNext`.

### Change theme defaults

- Dark remains the CSS base, but light is the user-facing default via `data-theme="light"` in head scripts and `main.js`.
- Saved `kinetix-theme` values override the light default; dark remains opt-in.
- `main.js` injects `.desktop-theme`; no per-page button markup is needed.
- Head scripts set `data-theme` before paint so saved themes do not flash.
- Hero photo uses `--hero-img` per page; `--hero-img-opacity` and `--hero-overlay` keep light/dark readable.
- CMS `settings.colors` affects dark mode through `--cms-*`; update light overrides separately.

## 11. Validation checklist

Run after CMS/binding/content edits:

```powershell
node --check server.js
node --check api/_lib/store.js
node --check api/bootstrap.js
node --check api/content.js
node --check api/status.js
node --check api/login.js
node --check api/logout.js
node --check api/upload.js
node --check api/media.js
node --check api/password.js
node --check api/_lib/mail.js
node --check api/_lib/db.js
node --check api/contact.js
node --check api/newsletter.js
node --check assets/js/cms.js
node --check assets/js/cms-loader.js
node --check assets/js/admin.js
node --check assets/js/main.js
node -e "for (const f of ['data/content.json','data/bindings.json','package.json','vercel.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm start
```

Smoke-test locally:
- `/` loads CMS data via `/api/bootstrap?page=index.html`.
- `/case-studies/mediflow` loads `page=case-studies/project.html` with `__CMS_SLUG__=mediflow`.
- With no saved theme, `/` loads in light mode; saved `dark` still loads dark.
- `/` shows a desktop theme button; clicking it toggles `html[data-theme]` and persists `kinetix-theme`.
- No `canvas.fx` elements or `fx.js` references remain; hero stock photo, text, marquee, reveals, and page fade still render/animate.
- Mobile menu has no theme toggle; navbar toggle remains available.
- `/admin` opens the admin panel.
- `/api/status` reports `authenticated: false` and storage modes when logged out.
- `/api/contact` and `/api/newsletter` return `503` locally until `DATABASE_URL` and `GMAIL_APP_PASSWORD` are set.
- With DB and SMTP configured, contact/newsletter forms show success, save to `cms_submissions`, and deliver to the configured Gmail inbox.
- Upload/save/password require auth; login uses current password; save reflects on public site.
- `/data/admin.json`, `/api/_lib/store.js`, `/server.js`, `/package.json`, `/vercel.json` return 403.
- Restore content after any test mutation.

Hosted smoke-test:
- Visit `/`, `/services`, `/case-studies/mediflow`, `/insights/why-clinic-systems-fail`, `/admin`.
- Confirm `/api/status` reports `database: "postgres"` and `blob: "connected"`.
- Confirm CMS edits persist after redeploy/restart and are backed by Postgres.
- Confirm uploaded images load through `/api/media?path=...` with DB metadata and Blob binaries.
- Set `DATABASE_URL`, `BLOB_*`, and `GMAIL_APP_PASSWORD` in Vercel, redeploy, submit a test contact message, and confirm it arrives in the Gmail inbox and is stored in `cms_submissions`.
- Submit a test newsletter signup and confirm the notification arrives in the Gmail inbox and is stored in `cms_submissions`.
- Change the default admin password.

## 12. Open questions / optional follow-ups

- Review `npm audit` findings before production hardening.
- Add rate limiting/CAPTCHA if public forms attract spam.
- Replace placeholder social URLs with real profiles if provided.
- Manual browser pass at desktop/mobile widths after CMS edits; no browser test suite exists.
