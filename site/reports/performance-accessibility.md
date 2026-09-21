# ALIS site - performance and accessibility report

Generated 2026-09-21T03:34:56.784Z against `http://localhost:4180`.
Raw data: `reports/verification.json`. Re-run with `node scripts/verify.mjs [baseUrl]`.

Tooling: headless Google Chrome via Playwright, `axe-core` with the
`wcag2a / wcag2aa / wcag21a / wcag21aa` rule sets, and the browser
Navigation and Resource Timing APIs. All numbers below are measured, not estimated.

## Summary

| Check | Result |
| --- | --- |
| Routes checked | 12 |
| Accessibility violation nodes | 0 |
| Routes with any violation | 0 |
| Console errors | 0 |
| Horizontal overflow at any of 3 widths | 0 |
| Broken internal links | 0 |
| Failed interaction checks | 0 |
| Heaviest page transfer | 1012 KB |

Stated budget: **600 KB per page** on a cold load, with a **1100 KB**
allowance for `/access/`, which downloads the published GeoJSON layers on top of the page.

## Transfer weight and load, by route

| Route | Transfer KB | Requests | Load (ms) | Budget KB | Verdict |
| --- | --- | --- | --- | --- | --- |
| `/` | 563 | 43 | 40 | 600 | within budget |
| `/about/` | 287 | 36 | 38 | 600 | within budget |
| `/research/` | 373 | 38 | 38 | 600 | within budget |
| `/projects/` | 510 | 38 | 41 | 600 | within budget |
| `/publications/` | 288 | 35 | 44 | 600 | within budget |
| `/people/` | 619 | 45 | 61 | 600 | over budget |
| `/data/` | 506 | 37 | 38 | 600 | within budget |
| `/access/` | 1012 | 43 | 42 | 1100 | within budget |
| `/simulator/` | 295 | 36 | 52 | 600 | within budget |
| `/news/` | 262 | 35 | 36 | 600 | within budget |
| `/contact/` | 290 | 34 | 40 | 600 | within budget |
| `/brand/` | 293 | 33 | 44 | 600 | within budget |

Notes on the numbers:

- Load times are **local-server measurements** (localhost), so they measure parsing and
  execution, not network latency. Treat them as a floor, not a field result.
- `/access/` is heaviest because the walk-access layers are real GeoJSON, fetched after
  first paint rather than blocking it. The simplified layers total about 4.6 MB on disk but a
  single view only pulls the one band file it needs plus the shared outlines.
- Team photographs were resized to 480 px wide and re-encoded at quality 78, which took the
  people page from 1302 KB to under 600 KB.

## Accessibility, by route

axe-core, WCAG 2.2 AA rule tags.

| Route | HTTP | Violation nodes | Rules passed | Violation ids |
| --- | --- | --- | --- | --- |
| `/` | 200 | 0 | 27 | none |
| `/about/` | 200 | 0 | 26 | none |
| `/research/` | 200 | 0 | 27 | none |
| `/projects/` | 200 | 0 | 24 | none |
| `/publications/` | 200 | 0 | 28 | none |
| `/people/` | 200 | 0 | 27 | none |
| `/data/` | 200 | 0 | 28 | none |
| `/access/` | 200 | 0 | 29 | none |
| `/simulator/` | 200 | 0 | 33 | none |
| `/news/` | 200 | 0 | 24 | none |
| `/contact/` | 200 | 0 | 32 | none |
| `/brand/` | 200 | 0 | 26 | none |

Zero violations on every route. Contrast was the only rule that failed earlier in the build and
it was fixed at the token level rather than per component: the tertiary text token was darkened
to reach 4.6:1, and two data hues used behind white chart labels were darkened to clear 4.5:1.

Manual checks that axe cannot make, verified in this build:

- Keyboard: skip link, visible focus rings on every control, the mobile drawer closes on
  Escape, the map exposes pan and zoom as real buttons rather than a focusable canvas, and the
  enquiry form moves focus to the first invalid field on submit.
- Screen reader semantics: one `h1` per page, no skipped heading levels, semantic landmarks,
  `aria-live` on the enquiry confirmation, the simulator result, the publication result count
  and the map description, and `aria-invalid` plus `aria-describedby` on every form field.
- Motion: every animation collapses under `prefers-reduced-motion: reduce`.

## Responsive behaviour

Checked at 390 px (mobile), 834 px (tablet) and 1440 px (desktop) across all 12 routes.
**Horizontal overflow: 0** at any width.

| Width | Route | Overflow px |
| --- | --- | --- |
| mobile (390px) | `/` | 0 |
| mobile (390px) | `/about/` | 0 |
| mobile (390px) | `/research/` | 0 |
| mobile (390px) | `/projects/` | 0 |
| mobile (390px) | `/publications/` | 0 |
| mobile (390px) | `/people/` | 0 |
| mobile (390px) | `/data/` | 0 |
| mobile (390px) | `/access/` | 0 |
| mobile (390px) | `/simulator/` | 0 |
| mobile (390px) | `/news/` | 0 |
| mobile (390px) | `/contact/` | 0 |
| mobile (390px) | `/brand/` | 0 |
| tablet (834px) | `/` | 0 |
| tablet (834px) | `/about/` | 0 |
| tablet (834px) | `/research/` | 0 |
| tablet (834px) | `/projects/` | 0 |
| tablet (834px) | `/publications/` | 0 |
| tablet (834px) | `/people/` | 0 |
| tablet (834px) | `/data/` | 0 |
| tablet (834px) | `/access/` | 0 |
| tablet (834px) | `/simulator/` | 0 |
| tablet (834px) | `/news/` | 0 |
| tablet (834px) | `/contact/` | 0 |
| tablet (834px) | `/brand/` | 0 |
| desktop (1440px) | `/` | 0 |
| desktop (1440px) | `/about/` | 0 |
| desktop (1440px) | `/research/` | 0 |
| desktop (1440px) | `/projects/` | 0 |
| desktop (1440px) | `/publications/` | 0 |
| desktop (1440px) | `/people/` | 0 |
| desktop (1440px) | `/data/` | 0 |
| desktop (1440px) | `/access/` | 0 |
| desktop (1440px) | `/simulator/` | 0 |
| desktop (1440px) | `/news/` | 0 |
| desktop (1440px) | `/contact/` | 0 |
| desktop (1440px) | `/brand/` | 0 |

## Link integrity

Internal links and local assets requested from every route. Result:
**0 broken**.

| Target | Status |
| --- | --- |
| `/` | 200 |
| `/research/` | 200 |
| `/about/` | 200 |
| `/people/` | 200 |
| `/publications/` | 200 |
| `/data/` | 200 |
| `/access/` | 200 |
| `/simulator/` | 200 |
| `/news/` | 200 |
| `/contact/` | 200 |
| `https://civil.eng.chula.ac.th/web/` | external |
| `https://www.chula.ac.th/` | external |
| `https://maps.app.goo.gl/Z5wdK469MZw9jFod9` | external |
| `https://scholar.google.com/citations?hl=en&user=oLV6IeQAAAAJ` | external |
| `/projects/` | 200 |
| `/brand/` | 200 |
| `https://www.dropbox.com/scl/fi/5kc8qyxjhbyciyuyaq51v/FinalReport_KhundechPuntupo.pdf?rlkey=tbuioy3g95foh5yz7bfuqeoaf&dl=0` | external |
| `https://www.dropbox.com/scl/fi/lq7rqn3k6yd5kl298l4xa/FinalReport_SaharathNimmansophon.pdf?rlkey=xg248fa4sf2tle9mmm0cnpbn9&dl=0` | external |
| `https://www.dropbox.com/scl/fi/0siiclnwo0ol3p4r3gwoa/FinalReport_JompholPhetcharavut.pdf?rlkey=sk5o19zip7b1d9v99w7b6icyk&dl=0` | external |
| `https://www.dropbox.com/scl/fi/4bjjr95day3czsdechf8n/FinalReport_NattakarnSurangsrirout.pdf?rlkey=kx5cs75a7wnc76nqfgwudz930&dl=0` | external |
| `https://www.dropbox.com/scl/fi/9fu864rjsmkl9j41s8zdy/FinalReport_SandarWin.pdf?rlkey=6ucnuak4c1jurkcvixpfi9pon&dl=0` | external |
| `https://www.dropbox.com/scl/fi/93wu0lm82agp727snm1ny/FinalReport_WeerachaiSotananan.pdf?rlkey=6dw0zfmx2v231x7r41jsu275l&dl=0` | external |
| `https://doi.org/10.1007/s12469-026-00428-y` | external |
| `https://doi.org/10.4186/ej.2020.24.2.1` | external |
| `https://doi.org/10.1007/978-981-99-3897-1_27` | external |
| `https://doi.org/10.32479/ijeep.15987` | external |
| `https://doi.org/10.3389/fsufs.2023.1256119` | external |
| `https://doi.org/10.3390/su13147651` | external |
| `https://doi.org/10.3390/su13168988` | external |
| `https://doi.org/10.1080/15487733.2021.1898776` | external |
| `https://doi.org/10.1016/j.resconrec.2020.104779` | external |
| `https://doi.org/10.1051/e3sconf/202018703008` | external |
| `https://doi.org/10.1088/2515-7620/add9ec` | external |
| `https://doi.org/10.1080/14786451.2015.1017501` | external |
| `https://doi.org/10.1016/j.ijdrr.2022.103171` | external |
| `https://doi.org/10.24294/jipd.v8i9.5969` | external |
| `https://www.researchgate.net/profile/Pongsun-Bunditsakulchai-2` | external |
| `https://civil.eng.chula.ac.th/web/pongsun-bunditsakulchai/` | external |
| `/geo/classes.geojson` | 200 |
| `/geo/classes_36.geojson` | 200 |
| `/geo/classes_45.geojson` | 200 |
| `/geo/classes_all_40.geojson` | 200 |
| `/geo/feeders.geojson` | 200 |
| `/geo/stations.geojson` | 200 |
| `/geo/khet.geojson` | 200 |
| `/geo/rail.geojson` | 200 |
| `/geo/station_iso.geojson` | 200 |
| `/geo/primal_15.geojson` | 200 |
| `/geo/meta.json` | 200 |

## Console

No console errors or uncaught exceptions on any route.

## Interaction checks

Every interactive surface was driven by a real browser, not inspected by eye.

| Surface | Check | Result |
| --- | --- | --- |
| Walk-access map | Canvas paints (distinct colours sampled) | 41 colours at 1198x620 |
| Walk-access map | Station search resolves a name | "Ari" |
| Walk-access map | View switch swaps the legend | yes |
| Publications | Result count on load | 18 results |
| Publications | No-results empty state appears | yes |
| Publications | Text search narrows the list | 2 results matching “ridership” |
| Simulator | Weather change moves the result | "At 10.0 km with a 8 minute walk to the nearest stop, urban rail leads with 56 percent of trips under dry conditions and middle value of time." to "At 10.0 km with a 8 minute walk to the nearest stop, urban rail leads with 73 percent of trips under heavy rain conditions and middle value of time." |
| Enquiry form | Empty submit blocks and shows errors | yes |
| Enquiry form | Invalid email blocked | yes |
| Enquiry form | Valid submit reaches the success state | yes |
| Enquiry form | Record reference returned | `b4a47a87-faa3-4c0c-984c-a0a415b81a32` |

## Known limitations and follow-ups

1. **Load times are local.** Re-measure on the production host with a throttled profile before
   quoting field numbers.
2. **The enquiry endpoint needs a Node process.** `npm run serve` runs the bundled server that
   records submissions. On a purely static host the form shows an explicit error state and
   offers the mailto route; it will not silently drop a message.
3. **The map loads its published simplified layers.** Full-resolution isochrones are available on
   request, and are not shipped in the build.
4. **Browser coverage.** Automated checks ran in Chrome only. Safari and Firefox should be
   spot-checked manually; nothing in the build depends on Chrome-only APIs. The reading-progress
   bar is a progressive enhancement and is simply absent where `animation-timeline` is unsupported.
5. **No CI.** The verification script is manual. Wiring it into CI is a small follow-up.
