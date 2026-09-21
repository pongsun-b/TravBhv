# ALIS — Transportation Behavior Lab

Public website of the Transportation Behavior Lab (ALIS), Department of Civil Engineering,
Faculty of Engineering, Chulalongkorn University.

**Published site:** <https://pongsun-b.github.io/TravBhv/>

> This is a **project page**, so the site lives under the `/TravBhv/` subpath, not at the domain
> root. Every asset and link in the site is written to work under that subpath. If the repository
> is ever renamed, the URL and the subpath change with it — see
> [Publishing](#publishing-to-github-pages).

The published site is the ALIS site in **[`site/`](site/)** — a SvelteKit app that prerenders to
plain static files. It is deployed to GitHub Pages by
**[`.github/workflows/pages.yml`](.github/workflows/pages.yml)**.

---

## Publishing to GitHub Pages

Everything needed to publish is already in the repository, and the work is committed on `main`
(commit `Publish the ALIS site`, still unpushed). All you have to do is push:

```bash
git checkout main
git push origin main
```

The `origin` remote is `https://github.com/pongsun-b/TravBhv.git` and the branch is `main`.

If you edit anything first, commit it too:

```bash
git add -A && git commit -m "Describe your change" && git push origin main
```

Then, once per repository (not once per push):

1. Open the repository on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

   Do *not* choose "Deploy from a branch". The site is built from source by the workflow; the
   branch does not contain finished HTML.

3. Push (or run the workflow once by hand: **Actions → Deploy site to Pages → Run workflow**).

When the run turns green, the site is at:

```
https://pongsun-b.github.io/TravBhv/
```

The workflow does three things on every push to `main`:

| Step | What it does |
| --- | --- |
| `npm ci` + `npm run build` in `site/` | Builds the prerendered static site into `site/build/` |
| `configure-pages` | Reports the base path (`/TravBhv`) so the 404 fallback can resolve its assets |
| `upload-pages-artifact` + `deploy-pages` | Publishes `site/build/` to GitHub Pages |

### If you change the repository name

The base path is taken from `steps.pages.outputs.base_path`, so the 404 fallback is corrected
automatically. Nothing else in the site needs editing: the pages themselves use relative paths.

### Two front-end details worth knowing

- **The enquiry form does not record submissions on GitHub Pages.** A static host cannot receive
  `POST /api/inquiries`. The Pages build therefore compiles in `VITE_ENQUIRY_MODE=mailto`: the form
  validates as usual, then hands the finished enquiry to the visitor's own email app, and says so on
  the page. Nothing is silently dropped. To record enquiries in the lab ledger instead, run the site
  with `npm run serve` on a host that can run Node — see [`site/README.md`](site/README.md).
- **The 404 page is corrected for the subpath after build** by
  `site/scripts/fix-fallback-paths.mjs`, which runs as part of `npm run build`.

---

## What is in this repository

| Path | What it is |
| --- | --- |
| `site/` | **The published site.** SvelteKit source, brand assets, data files, build tooling |
| `site/src/lib/tokens.css` | Single source of truth for colour, type, spacing, radius, motion |
| `site/src/lib/data/` | All site copy: research, people, publications, projects, datasets, news |
| `site/static/geo/` | Walk-access GeoJSON layers for the interactive map |
| `site/brand/` | Exported identity pack: SVG, PNG, favicon, social cards |
| `site/docs/brand-guidelines.md` | The written identity rules |
| `site/reports/` | Verified accessibility and performance results |
| `.github/workflows/pages.yml` | Builds and deploys the site to GitHub Pages |
| `_data/`, `_pages/`, `_layouts/`, `_includes/`, `_posts/`, `css/`, `js/`, `images/`, `access-data/` | The **previous** Jekyll site. Kept as the content of record. Also `EDITING.md`, `admin/` |

## Editing the site

Content lives in one file per section, so nothing has to be edited inside page markup:

| I want to change | Edit |
| --- | --- |
| Colours, type, spacing, radius, motion | `site/src/lib/tokens.css`, then `npm run tokens` |
| Lab name, navigation, contact details | `site/src/lib/data/site.js` |
| Research lines and method notes | `site/src/lib/data/research.js` |
| People, roles, emails, thesis titles | `site/src/lib/data/people.js` |
| Publications | `site/src/lib/data/publications.js` |
| Featured projects and thesis lists | `site/src/lib/data/projects.js` |
| Datasets, citation, data policy | `site/src/lib/data/datasets.js` |
| News and research notes | `site/src/lib/data/news.js` |
| One page's layout | that page's `site/src/routes/<page>/+page.svelte` |

Full instructions, including how to run and verify locally, are in
**[`site/README.md`](site/README.md)** and **[`site/HANDOFF.md`](site/HANDOFF.md)**.

## Running it locally

```bash
cd site
npm install
npm run dev        # dev server, http://localhost:5173
npm run build      # static site into site/build
npm run preview    # serve the built site, http://localhost:4173
npm run serve      # built site plus the enquiry endpoint, http://localhost:4180
```

Two checks you can run at any time:

- `npm run verify:repo` — fails if an AI agent/identity file is ever tracked, or if a file the site
  needs has been left uncommitted. No dependencies, safe to run in CI.
- `node scripts/verify.mjs` — the full suite: accessibility, links, responsive overflow and form
  interaction across all 12 routes (needs `npm run serve` running, and Google Chrome).

Node 20 or newer. See [`site/README.md`](site/README.md) for the verification scripts.

---

## Legacy: the original Jekyll site

This repository used to publish a Jekyll site from the repository root. That source is still
here and still builds, but it is **no longer what GitHub Pages serves**:

- `.github/workflows/jekyll.yml` is now **manual only** (`workflow_dispatch`). Its push trigger was
  removed so that two workflows cannot race for the same Pages deployment.
- `_config.yml` excludes `site/` so a Jekyll build ignores the new site.

The group's editing instructions for the old tooling are in [`EDITING.md`](EDITING.md). If you want
to retire the Jekyll source entirely, delete the root directories listed above and
`.github/workflows/jekyll.yml` together with `Gemfile`, `Gemfile.lock` and `_config.yml`.

---

## Local assistant files are not published

Files written by the AI assistant that maintains this repository — `AGENTS.md`, `SOUL.md`,
`IDENTITY.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`, `MEMORY.md`, `CLAUDE.md`, tool-rule
directories such as `.agents/`, `.cursor/`, `.openclaw/`, and local scratch directories — are listed
in `.gitignore` and are deliberately **never** committed or pushed. They stay on the machine they
were written on.

## License

Site content © 2026 Travel Behavior Research Group. Code is released under the MIT License (see
[`LICENSE`](LICENSE)).
