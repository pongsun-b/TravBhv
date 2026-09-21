# ALIS - handoff

Everything produced for the ALIS identity and site restyle, where it lives, how to change it, and
how to put it live or roll it back.

Read this first, then `README.md` to run the project and `docs/brand-guidelines.md` for the identity
rules. The visual version of the guidelines is the `/brand/` page on the site itself.

---

## 1. What was delivered

| # | Deliverable | Where |
| --- | --- | --- |
| 1 | Identity: mark, monogram, wordmark, two lockups, clear space, minimum sizes, correct/incorrect use | `brand/svg/`, rules in `docs/brand-guidelines.md`, live on `/brand/` |
| 2 | Colour and type system with accessible pairings and licensing | `src/lib/tokens.css`, `docs/brand-guidelines.md`, measured ratios on `/brand/` |
| 3 | Design tokens as a single source of truth | `src/lib/tokens.css` plus generated `design-tokens.json` |
| 4 | Restyled site: home, about, research, projects, publications, people, data, access, simulator, news, contact, brand | `src/routes/` |
| 5 | Reusable component set | `src/lib/components/` |
| 6 | Before and after evidence, desktop and mobile | `reports/before-after/` |
| 7 | Brand and site guidelines | `docs/brand-guidelines.md` and `/brand/` |
| 8 | Exported asset pack | `brand/svg/`, `brand/png/`, `brand/favicon/`, `brand/social/` |
| 9 | Performance and accessibility report with raw numbers | `reports/performance-accessibility.md` |
| 10 | Deployable site and rollback procedure | `build/`, section 5 below |

## 2. Project map

```
alis/
├── README.md                     run, change, deploy
├── HANDOFF.md                    this file
├── docs/brand-guidelines.md      identity rules in writing
├── design-tokens.json            generated mirror of tokens.css
├── src/
│   ├── lib/tokens.css            THE source of truth for colour, type, space, radius, motion
│   ├── lib/brand-paths.js        generated logo paths, used by the site
│   ├── lib/actions/reveal.js     scroll-entry action
│   ├── lib/components/           Header, Footer, Logo, SectionHead, Icon, Reveal,
│   │                             ModeChoiceSimulator, AccessMap, InquiryForm
│   ├── lib/data/                 all site copy and content, one file per section
│   └── routes/                   one folder per page
├── static/
│   ├── geo/                      walk-access GeoJSON layers
│   ├── media/                    poster, team photos, affiliation logo, social cards
│   └── favicon.*, site.webmanifest
├── server/inquiries.mjs          enquiry endpoint and static server
├── scripts/                      build-brand, build-assets, tokens-export, verify, report,
│                                 capture-before-after, mark-candidates
├── brand/                        the exported identity asset pack
├── reports/                      verification.json, the report, before/after evidence
└── build/                        the deployable static site (generated)
```

## 3. Daily changes

| I want to change | Edit |
| --- | --- |
| Any colour, type size, spacing, radius, shadow or duration | `src/lib/tokens.css`, then `npm run tokens` |
| Lab name, navigation, contact details | `src/lib/data/site.js` |
| Research lines, method notes, faculty interests | `src/lib/data/research.js` |
| People, roles, emails, thesis titles, photos | `src/lib/data/people.js` |
| Publications | `src/lib/data/publications.js` |
| Featured projects and thesis lists | `src/lib/data/projects.js` |
| Dataset files, citation, data policy, access metadata | `src/lib/data/datasets.js` |
| News and notes | `src/lib/data/news.js` |
| One page's layout | that page's `src/routes/<page>/+page.svelte` |
| The simulator's parameters | `src/lib/components/ModeChoiceSimulator.svelte` (`VOT`, `WEATHER`, `specs`) |
| The logo | `scripts/build-brand.mjs`, then `npm run brand` |
| Team photos and the map poster | `static/media/` then `npm run build` |

Never edit `src/lib/brand-paths.js`, `design-tokens.json` or anything in `brand/` by hand. They are
generated; edit the script or the tokens and regenerate.

## 4. Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site into build/
npm run serve      # http://localhost:4180, serves build/ AND records enquiries
```

`npm run serve` is the one to use in production: it is the only mode in which the enquiry form can
store a submission.

## 5. Going live, and coming back

**Preview first.** Run `npm run build && npm run serve`, check every page, submit one test enquiry,
confirm it lands in `data/inquiries.jsonl`, then delete the test row.

**Then publish.** The build in `build/` is static. Copy it to the existing host. The enquiry
endpoint needs a long-running Node process, so either:

- run `npm run serve` behind the existing reverse proxy (simplest), or
- keep the static host and point the form at a separate small service that exposes the same
  `POST /api/inquiries` contract, or
- if neither is possible, the form degrades to an explicit error state with a mailto link and
  **does not silently lose the message**.

**Rollback.** Before publishing, take a copy of what is currently live:

```bash
cp -R /path/to/live/site /path/to/backups/site-$(date +%Y%m%d)
```

To roll back, restore that directory. For the enquiry ledger, back up `data/inquiries.jsonl` as
well; submissions received after launch only exist in that file.

The pre-restyle site is also preserved at `https://pongsun-b.github.io/TravBhv/` and its content is
mirrored in this repository's `src/lib/data/`, so the previous content is never more than a redeploy
away.

## 6. Enquiry ledger

- Written to `data/inquiries.jsonl`, one JSON object per line, append-only.
- Fields: `id`, `receivedAt` (ISO 8601 UTC), `source` (the page the form was on), `name`, `email`,
  `organisation`, `enquiryType`, `enquiryTypeLabel`, `message`, `consent` (boolean), `consentText`,
  `status`, `userAgent`.
- Export: `GET /api/inquiries.csv` (opens as a download) or `GET /api/inquiries` for JSON.
- A real captured record is kept at `reports/inquiry-ledger-sample.json` as evidence. The live
  ledger was cleared after verification so production starts empty.
- `data/` is git-ignored. It must be backed up separately; it is the only place a submission exists.

## 7. Verification, and how to repeat it

```bash
npm run build
npm run serve &
node scripts/verify.mjs         # writes reports/verification.json
node scripts/report.mjs         # rewrites reports/performance-accessibility.md
node scripts/capture-before-after.mjs
```

Last run, against the local server: 12 routes, **0 accessibility violation nodes, 0 console errors,
0 horizontal overflow at three widths, 0 broken internal links, 0 failed interaction checks**. Full
numbers in `reports/performance-accessibility.md`.

## 8. Assumptions made, and things to confirm

These were inferred to keep the work moving. Each is a one-line fix if the assumption is wrong.

1. **"ALIS" is the lab's name** and "Transportation Behavior Lab" is its descriptor. The expansion
   of the acronym is not recorded anywhere; add it to `docs/brand-guidelines.md` section 1 and to the
   stacked lockup descriptor when confirmed.
2. **Content was preserved, not rewritten.** Research, people, publications, projects and datasets
   carry over from the previous site. Headings on the new pages are new copy.
3. **The previous site's crimson palette is retired.** If it needed to survive for an existing
   sub-brand, the accent token is the single place to re-point.
4. **Team photographs and the walk-access poster are the lab's own assets** and are shipped locally.
   No stock imagery was introduced, and no new photography was commissioned.
5. **Simplified GeoJSON ships with the site** (about 55 m tolerance) so the map loads fast.
   Full-resolution isochrones are offered on request rather than bundled.
6. **The site is English-only**, as before.
7. **Publishing to the real domain, and any redirect work, is yours to run**: this environment has
   no access to the production host.

## 9. Known follow-ups

1. Re-measure load performance on the production host; the numbers here are localhost.
2. Spot-check Safari and Firefox by hand. Nothing depends on Chrome-only APIs, but only Chrome was
   automated.
3. The 16 px monogram still closes its counter slightly; if that matters at favicon scale, add a
   dedicated 16 px two-colour bitmap.
4. Wire `scripts/verify.mjs` into CI so the accessibility and link checks run on every change.
5. Replace the placeholder-free but thin news feed as the lab publishes more.
