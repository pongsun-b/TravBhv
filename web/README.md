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
  `paths.base = '/TravBhv'` (must stay in sync with `baseurl` in the
  repo-root `_config.yml`).
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
- Content pipeline: `people.ts`, `posts.ts`.
- `/team/` proof page (faculty / students / alumni, placeholder rule applied).
- `/` stub home page.

## Remaining migration checklist

Routes to port from `_pages/` (keep the same URLs):

- `/access/` — Leaflet map; logic in repo-root `js/access-map.js`,
  data in `access-data/`. Dynamic-import Leaflet inside `onMount`
  (it's client-only). Preserve the scroll-zoom-on-click behavior and the
  `prefers-reduced-motion` handling.
- `/research/`, `/publications/`, `/notes/` (+ individual post pages from
  `_posts/` — see the Liquid-tag note above), `/apps/`, `/data/`,
  `/allnews/`, `/openings/`, `/aboutwebsite/`, and a proper 404 page.
- Home: replace the stub with the real Jekyll home page (`_pages/home.html`
  + `_layouts/homelay.html` + `_includes/home-people.html`).

Layouts & components:

- Port `_layouts/` (default, homelay, gridlay, textlay, embed) to Svelte
  layouts; `_includes/header.html`, `footer.html`, `nav-link.html` to
  components (nav structure comes from `_data/nav.yml`).
- Port styles from `css/main.scss` and `css/tbrg.css`.

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
