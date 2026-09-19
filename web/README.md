# TravBhv web rewrite (SvelteKit)

This directory is the SvelteKit rewrite of the Jekyll site at the repo root
(Travel Behavior Research Group, Chulalongkorn University). The Jekyll site
still lives at the root and is the production site until cutover — **do not
edit or delete the Jekyll files** (`_data/`, `_pages/`, `_includes/`,
`_layouts/`, `_posts/`, `css/`, `admin/`, ...). The rewrite reads them.

## Commands

```sh
npm install        # first time
npm run dev        # dev server
npm run build      # static build -> web/build/
npm run preview    # serve the build at http://localhost:4173/TravBhv/
npm run check      # svelte-check (types)
```

## Configuration

- `svelte.config.js`: `@sveltejs/adapter-static` with `fallback: '404.html'`,
  `paths.base = '/TravBhv'` + `paths.relative = false` (absolute
  `/TravBhv/...` URLs, matching the Jekyll output byte-for-byte; must stay in
  sync with `baseurl` in the repo-root `_config.yml`), and
  `prerender.handleHttpError` set to warn (not fail) on 404s while linked
  routes like `/access/` are still unported — tighten this back to `'error'`
  once all routes exist.
- `src/routes/+layout.ts`: `prerender = true` (all routes prerendered at
  build time) and `trailingSlash = 'always'` so emitted URLs keep the
  Jekyll-style trailing slash (`/team/` → `team/index.html`).
- Always build internal links and asset URLs with `base`/`resolve` from
  `$app/paths`, never hardcode `/TravBhv`.

## Content pipeline (`src/lib/data/`)

The loaders read the **existing Jekyll content at the repo root** — the YAML
and Markdown files are not copied or duplicated.

- Path assumption: `process.cwd()` is `web/` during `vite dev`/`vite build`,
  so the repo root is `path.resolve(process.cwd(), '..')`. If you ever run
  the build from the repo root, set `REPO_ROOT=.` in the environment.
- `people.ts` — reads `_data/team_members.yml`, `_data/students.yml`,
  `_data/alumni.yml` (each `{ items: [...] }`) via `yaml`. Exports
  `getFaculty()`, `getStudents()`, `getAlumni()`, plus `isPlaceholder()`
  and `visiblePeople()`. The placeholder rule mirrors
  `_includes/person_flags.html`: hidden if the name is blank, the email
  contains `xxxxx` (case-insensitive), or the last name token is `X`/`x`.
- `posts.ts` — reads `_posts/*.md` via `gray-matter` + `marked`. Exports
  `getPosts()` (newest first; slug = filename minus the `YYYY-MM-DD-`
  prefix) and `getPost(slug)`. Note: post bodies contain Jekyll/Liquid
  syntax (`{{ ... }}`, `{% post_url %}`); when porting post pages you must
  strip or rewrite those tags before rendering.

Static assets (`images/`, `admin/`, `access-data/`, `leaflet/`,
`favicon.ico`) **are** copied into `web/static/` — keep them in sync with
the repo root if they change.

## Done so far

- Scaffold (minimal template, TypeScript, no add-ons) + static adapter.
- Content pipeline: `people.ts`, `posts.ts`, `site.ts` (Jekyll `_config.yml` +
  `_data/nav.yml`/`_data/extras.yml`), `news.ts` (incl. `news_link.html`
  linked-post resolution and news-date → ISO parsing).
- Design port: `css/tbrg.css` copied verbatim to `src/lib/styles/tbrg.css`
  (`css/main.scss` is an empty stub upstream — no Sass needed) and imported
  globally in `src/routes/+layout.svelte`. **It is a copy** — re-sync it if
  the repo-root CSS changes before cutover.
- Chrome: `Header.svelte` / `NavLink.svelte` / `Footer.svelte` (ports of
  `_includes/header|nav-link|footer.html`, incl. the mobile nav-toggle
  script behavior), wired in `src/routes/+layout.svelte` (=
  `_layouts/default.html`). Nav is data-driven from nav.yml + extras.yml.
- `/` home page fully ported (hero, access feature, pillars, people strip,
  news) — structurally identical to the live page.
- `/team/` page fully ported (`faculty-block`/`person-row` for faculty,
  `people-strip`/`person-card` for students, `person-card no-photo` for
  alumni) — `<main>` is byte-identical to the live page after whitespace
  normalization.
- SEO basics: page titles follow the Jekyll pattern
  (`Home: {title} | {tagline}`, other pages `{title} | {site title}`),
  meta description, favicon, Google Fonts in `app.html`.
- `paths.relative: false` in `svelte.config.js`, so links render as absolute
  `/TravBhv/...` URLs exactly like the live site (the adapter-static default
  would emit `./` / `../` relative URLs).

## Remaining migration checklist

Routes to port from `_pages/` (keep the same URLs):

- `/access/` — Leaflet map; logic in repo-root `js/access-map.js`,
  data in `access-data/`. Dynamic-import Leaflet inside `onMount`
  (it's client-only). Preserve the scroll-zoom-on-click behavior and the
  `prefers-reduced-motion` handling. The access-map CSS classes are already
  in the ported `tbrg.css`; also link `leaflet.css` from
  `web/static/leaflet/` (the Jekyll `head.html` does this when
  `page.map` is set).
- `/research/`, `/publications/`, `/notes/` (+ individual post pages from
  `_posts/` — see the Liquid-tag note above; news headlines and post indexes
  already link to Jekyll-style `/YYYY/MM/DD/slug.html` URLs via
  `getPostPath()`, so post pages must live at those URLs), `/apps/`,
  `/data/`, `/allnews/`, `/openings/`, `/aboutwebsite/`, and a proper 404
  page (`.not-found` styles are already in the CSS).
- The `homelay` and `gridlay` wrappers are inlined in the two existing
  routes (`<div class="home wrap">`, `<article class="page wrap wide">`);
  still to port as reusable layouts: `textlay` (`<article class="page
  wrap">`) and `embed` (iframe dashboards, `.embed-*` styles are in the CSS).

Decap CMS:

- Lives in `web/static/admin/` (copied from repo-root `admin/`) and edits
  the same `_data/*.yml` and `_posts/*.md` files at the repo root. The
  OAuth-backend note in repo-root `EDITING.md` still applies.

Cutover (when parity is reached):

- GitHub Actions, Node 20: `npm ci && npm run build` in `web/`, deploy
  `web/build` with `actions/deploy-pages`. Replace the Jekyll build.

Parity checklist before cutover:

- All URLs return 200 under `/TravBhv` (diff against the Jekyll `_site/`).
- `/team/` shows faculty + students + alumni with the placeholder rule applied.
- The access map works (layers, popups, scroll-zoom-on-click).
- `/admin/` round-trips an edit (edit via CMS → file changes on disk →
  rebuild shows it).
