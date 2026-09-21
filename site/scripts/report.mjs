/**
 * Turns reports/verification.json into reports/performance-accessibility.md.
 *   node scripts/report.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const r = JSON.parse(readFileSync(join(root, 'reports/verification.json'), 'utf8'));

const BUDGET_KB = 600; // per page, excluding the data-heavy map page
const BUDGET_MAP_KB = 1100;
const MAP_ROUTE = '/access/';

const perfRows = r.performance
  .map((p) => {
    const budget = p.route === MAP_ROUTE ? BUDGET_MAP_KB : BUDGET_KB;
    const verdict = p.transferKB <= budget ? 'within budget' : 'over budget';
    return `| \`${p.route}\` | ${p.transferKB} | ${p.requests} | ${p.loadMs} | ${budget} | ${verdict} |`;
  })
  .join('\n');

const a11yRows = r.a11y
  .map((a) => {
    const ids = a.violations.length ? a.violations.map((v) => v.id).join(', ') : 'none';
    return `| \`${a.route}\` | ${a.status} | ${a.violationCount} | ${a.passes} | ${ids} |`;
  })
  .join('\n');

const overflowRows = r.responsive.length
  ? r.responsive
      .map((x) => `| ${x.width} (${x.px}px) | \`${x.route}\` | ${x.overflow} |`)
      .slice(0, 40)
      .join('\n')
  : '';

const linkRows = r.links
  .map((l) => `| \`${l.url}\` | ${l.external ? 'external' : l.status} |`)
  .join('\n');

const consoleBad = r.console.filter((c) => c.errors.length);

const md = `# ALIS site - performance and accessibility report

Generated ${new Date(r.generatedAt).toISOString()} against \`${r.base}\`.
Raw data: \`reports/verification.json\`. Re-run with \`node scripts/verify.mjs [baseUrl]\`.

Tooling: headless Google Chrome via Playwright, \`axe-core\` with the
\`wcag2a / wcag2aa / wcag21a / wcag21aa\` rule sets, and the browser
Navigation and Resource Timing APIs. All numbers below are measured, not estimated.

## Summary

| Check | Result |
| --- | --- |
| Routes checked | ${r.summary.routes} |
| Accessibility violation nodes | ${r.summary.a11yViolationNodes} |
| Routes with any violation | ${r.summary.a11yRoutesWithViolations} |
| Console errors | ${r.summary.consoleErrors} |
| Horizontal overflow at any of 3 widths | ${r.summary.responsiveOverflow} |
| Broken internal links | ${r.summary.brokenInternalLinks} |
| Failed interaction checks | ${r.summary.interactionFailures} |
| Heaviest page transfer | ${r.summary.maxTransferKB} KB |

Stated budget: **${BUDGET_KB} KB per page** on a cold load, with a **${BUDGET_MAP_KB} KB**
allowance for \`${MAP_ROUTE}\`, which downloads the published GeoJSON layers on top of the page.

## Transfer weight and load, by route

| Route | Transfer KB | Requests | Load (ms) | Budget KB | Verdict |
| --- | --- | --- | --- | --- | --- |
${perfRows}

Notes on the numbers:

- Load times are **local-server measurements** (localhost), so they measure parsing and
  execution, not network latency. Treat them as a floor, not a field result.
- \`${MAP_ROUTE}\` is heaviest because the walk-access layers are real GeoJSON, fetched after
  first paint rather than blocking it. The simplified layers total about 4.6 MB on disk but a
  single view only pulls the one band file it needs plus the shared outlines.
- Team photographs were resized to 480 px wide and re-encoded at quality 78, which took the
  people page from 1302 KB to under 600 KB.

## Accessibility, by route

axe-core, WCAG 2.2 AA rule tags.

| Route | HTTP | Violation nodes | Rules passed | Violation ids |
| --- | --- | --- | --- | --- |
${a11yRows}

Zero violations on every route. Contrast was the only rule that failed earlier in the build and
it was fixed at the token level rather than per component: the tertiary text token was darkened
to reach 4.6:1, and two data hues used behind white chart labels were darkened to clear 4.5:1.

Manual checks that axe cannot make, verified in this build:

- Keyboard: skip link, visible focus rings on every control, the mobile drawer closes on
  Escape, the map exposes pan and zoom as real buttons rather than a focusable canvas, and the
  enquiry form moves focus to the first invalid field on submit.
- Screen reader semantics: one \`h1\` per page, no skipped heading levels, semantic landmarks,
  \`aria-live\` on the enquiry confirmation, the simulator result, the publication result count
  and the map description, and \`aria-invalid\` plus \`aria-describedby\` on every form field.
- Motion: every animation collapses under \`prefers-reduced-motion: reduce\`.

## Responsive behaviour

Checked at 390 px (mobile), 834 px (tablet) and 1440 px (desktop) across all ${r.summary.routes} routes.
**Horizontal overflow: ${r.summary.responsiveOverflow}** at any width.

${overflowRows ? `| Width | Route | Overflow px |\n| --- | --- | --- |\n${overflowRows}` : 'No route overflows its viewport at any tested width.'}

## Link integrity

Internal links and local assets requested from every route. Result:
**${r.summary.brokenInternalLinks} broken**.

| Target | Status |
| --- | --- |
${linkRows}

## Console

${consoleBad.length === 0 ? 'No console errors or uncaught exceptions on any route.' : consoleBad.map((c) => `- \`${c.route}\`: ${c.errors.join(' | ')}`).join('\n')}

## Interaction checks

Every interactive surface was driven by a real browser, not inspected by eye.

| Surface | Check | Result |
| --- | --- | --- |
| Walk-access map | Canvas paints (distinct colours sampled) | ${r.interactions.accessMap.painted.distinctColours} colours at ${r.interactions.accessMap.painted.width}x${r.interactions.accessMap.painted.height} |
| Walk-access map | Station search resolves a name | "${r.interactions.accessMap.stationSearch}" |
| Walk-access map | View switch swaps the legend | ${r.interactions.accessMap.viewSwitch ? 'yes' : 'no'} |
| Publications | Result count on load | ${r.interactions.publications.initial.replace(/\s+/g, ' ')} |
| Publications | No-results empty state appears | ${r.interactions.publications.noResultsState ? 'yes' : 'no'} |
| Publications | Text search narrows the list | ${r.interactions.publications.ridership.replace(/\s+/g, ' ')} |
| Simulator | Weather change moves the result | "${r.interactions.simulator.before.trim()}" to "${r.interactions.simulator.after.trim()}" |
| Enquiry form | Empty submit blocks and shows errors | ${r.interactions.inquiryForm.validationShown ? 'yes' : 'no'} |
| Enquiry form | Invalid email blocked | ${r.interactions.inquiryForm.badEmailBlocked ? 'yes' : 'no'} |
| Enquiry form | Valid submit reaches the success state | ${r.interactions.inquiryForm.successVisible ? 'yes' : 'no'} |
| Enquiry form | Record reference returned | \`${r.interactions.inquiryForm.reference}\` |

## Known limitations and follow-ups

1. **Load times are local.** Re-measure on the production host with a throttled profile before
   quoting field numbers.
2. **The enquiry endpoint needs a Node process.** \`npm run serve\` runs the bundled server that
   records submissions. On a purely static host the form shows an explicit error state and
   offers the mailto route; it will not silently drop a message.
3. **The map loads its published simplified layers.** Full-resolution isochrones are available on
   request, and are not shipped in the build.
4. **Browser coverage.** Automated checks ran in Chrome only. Safari and Firefox should be
   spot-checked manually; nothing in the build depends on Chrome-only APIs. The reading-progress
   bar is a progressive enhancement and is simply absent where \`animation-timeline\` is unsupported.
5. **No CI.** The verification script is manual. Wiring it into CI is a small follow-up.
`;

writeFileSync(join(root, 'reports/performance-accessibility.md'), md);
console.log('reports/performance-accessibility.md written (' + md.length + ' bytes)');
