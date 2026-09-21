# TBRG

Identity and website for **TBRG**, the Travel Behavior Research Group, Department of Civil
Engineering, Chulalongkorn University.

A restyle of the lab's existing public site: the content, people, publications, projects and
datasets carry over, while the identity, layout, component structure and visual system are new, and
two interactive research tools are included.

---

## Run it

```bash
npm install
npm run dev        # dev server, http://localhost:5173
npm run build      # static site into build/ (plus the 404 base-path fix)
npm run preview    # serve the built site, http://localhost:4173
npm run serve      # built site plus the enquiry endpoint, http://localhost:4180
npm run brand      # regenerate the identity asset pack
npm run tokens     # regenerate design-tokens.json from tokens.css
npm run check      # svelte-check
npm run verify:repo  # fail if an agent/identity file is tracked or a required file is uncommitted
```

Node 20 or newer. `npm run serve` is the only mode in which the enquiry form can store a
submission; see `HANDOFF.md` section 6.

## Deploy

This repository publishes the site with **GitHub Actions** to a GitHub Pages *project* page at
<https://pongsun-b.github.io/TravBhv/>. Nothing needs building by hand: pushing to `main` runs
`.github/workflows/pages.yml`, which installs, builds and deploys `build/`. Setup and troubleshooting
are in the [repository README](../README.md).

The same `build/` output also drops straight onto Netlify, Cloudflare Pages or any static host.

Three things to know:

- **The enquiry form needs the Node process.** `npm run serve` (or an equivalent service implementing
  `POST /api/inquiries`) is required for the contact form to record submissions. The Pages workflow
  therefore builds with `VITE_ENQUIRY_MODE=mailto`: on a purely static host the form validates, then
  hands the finished enquiry to the visitor's own email app and says so plainly on the page, rather
  than showing an error after the fact. Nothing is lost silently.
- **Subpath deploys** work as-is. Asset and link paths in the prerendered pages are relative, so the
  site can sit at a domain root or under a subdirectory without changes.
- **The 404 fallback is adjusted after build.** SvelteKit writes `build/404.html` with root-absolute
  asset references because a fallback page can be served from any depth. On a project page those
  must carry the base path, so `npm run build` finishes with `scripts/fix-fallback-paths.mjs`, which
  reads `PAGES_BASE_PATH` (set from `steps.pages.outputs.base_path` in CI, e.g. `/TravBhv`) and
  rewrites them. Without that variable it is a no-op, which is correct for a root deploy.

## Design system

All values live in **`src/lib/tokens.css`**. Nothing downstream hard-codes a colour, size, radius,
shadow or duration. `npm run tokens` mirrors it to `design-tokens.json` for tooling.

- Canvas is a warm neutral in light, a deep neutral in dark. Dark mode is re-tuned, not inverted.
- One accent (`--accent`). Body links are ink with a tinted underline, so the accent stays for
  primary actions, active navigation and chart marks.
- Two typefaces, both open source and self-hosted: Instrument Sans (display and interface) and
  JetBrains Mono (data and metadata).
- Shape lock: surfaces 20 px, controls 10 px, chips fully rounded.
- Structure is hairlines; cards appear only where elevation carries meaning.

The full rules, with measured contrast ratios, are on the `/brand/` page and in
`docs/brand-guidelines.md`.

## Structure

```
src/
├── app.html                    document shell, favicons, social meta, pre-paint theme script
├── app.css                     base layer and primitives, all values from tokens
├── lib/
│   ├── tokens.css              the single source of truth
│   ├── brand-paths.js          generated logo paths
│   ├── actions/reveal.js       scroll-entry action, used as use:reveal
│   ├── components/             Header, Footer, Logo, SectionHead, Icon,
│   │                           ModeChoiceSimulator, AccessMap, InquiryForm
│   └── data/                   site.js, research.js, people.js, publications.js,
│                               projects.js, datasets.js, news.js
└── routes/
    ├── +layout.svelte          shell and font imports
    ├── +page.svelte            home
    ├── about/                  mission, principles, milestones
    ├── research/               lines of work and method
    ├── projects/               featured work, current and completed theses
    ├── publications/           filterable paper list
    ├── people/                 faculty, researchers, alumni
    ├── data/                   datasets, files, citation, policy
    ├── access/                 interactive walk-access map
    ├── simulator/              interactive mode-choice simulator
    ├── news/                   news and research notes
    ├── contact/                enquiry form and details
    ├── brand/                  the living brand guide
    └── +error.svelte           404 and error state
```

`server/`, `scripts/` and `brand/` sit alongside `src/`: the enquiry endpoint, the build and
verification tooling, and the exported identity pack.

## Where to change things

| I want to change | Edit |
| --- | --- |
| Colours, type, spacing, radius, motion | `src/lib/tokens.css` then `npm run tokens` |
| Lab name, nav, contact details | `src/lib/data/site.js` |
| Research content | `src/lib/data/research.js` |
| People and alumni | `src/lib/data/people.js` |
| Publications | `src/lib/data/publications.js` |
| Projects and theses | `src/lib/data/projects.js` |
| Datasets and metadata | `src/lib/data/datasets.js` |
| News and notes | `src/lib/data/news.js` |
| A page layout | that page's `+page.svelte` |
| Simulator parameters | `src/lib/components/ModeChoiceSimulator.svelte` |
| The logo | `scripts/build-brand.mjs`, then `npm run brand` |

## Quality

Recorded in `reports/performance-accessibility.md` and re-runnable with `node scripts/verify.mjs`.

- **Accessibility:** WCAG 2.2 AA via axe-core across all 12 routes, 0 violation nodes. Skip link,
  visible focus, keyboard-operable map controls, labelled form fields with `aria-invalid` and
  `aria-describedby`, live regions on dynamic results, reduced-motion support throughout.
- **Responsive:** verified at 390, 834 and 1440 px with 0 horizontal overflow.
- **States:** the map has loading and error states; the simulator has per-mode unavailable states,
  reset and copy feedback; the enquiry form has untouched, invalid, submitting, success and error
  states; publications has an explicit no-results state; there is a styled 404.
- **Integrity:** 0 broken internal links or missing assets.
- **Motion:** one orchestrated entrance per page, staggered, all of it collapsing under
  `prefers-reduced-motion`.

## Content and licensing

Site copy, people, publications and thesis titles come from the lab's previous public site.
Walk-access geometry is derived from OpenStreetMap (ODbL). Instrument Sans and JetBrains Mono are
licensed under the SIL Open Font License 1.1 and self-hosted; the logo ships as outlines and carries
no font dependency.

See `HANDOFF.md` for deployment, rollback, the enquiry ledger, the assumptions made, and follow-ups.
