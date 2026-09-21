/**
 * Site verification: interactions, accessibility, responsiveness, link integrity
 * and performance. Writes reports/verification.json and prints a summary.
 *
 *   node scripts/verify.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:4180';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
mkdirSync(join(root, 'reports'), { recursive: true });

const ROUTES = [
  '/',
  '/about/',
  '/research/',
  '/projects/',
  '/publications/',
  '/people/',
  '/data/',
  '/access/',
  '/simulator/',
  '/news/',
  '/contact/',
  '/brand/'
];

const WIDTHS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1440, height: 900 }
];

const report = {
  base: BASE,
  generatedAt: new Date().toISOString(),
  routes: ROUTES,
  a11y: [],
  console: [],
  responsive: [],
  links: [],
  interactions: {},
  performance: []
};

const axeSource = readFileSync(join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');

const browser = await chromium.launch({ channel: 'chrome' });

/* ---------------------------------------------- console + a11y + perf ---- */

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));

  const t0 = Date.now();
  const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(500);

  // Sweep the page so every scroll-reveal element is in its final state before
  // it is measured; otherwise axe reads still-hidden elements.
  await page.evaluate(async () => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 45));
    }
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  });
  await page.waitForTimeout(700);

  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
    });
    return {
      violations: r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.help
      })),
      passes: r.passes.length,
      incomplete: r.incomplete.length
    };
  });

  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const bytes = res.reduce((n, r) => n + (r.transferSize || 0), 0);
    return {
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadMs: nav ? Math.round(nav.loadEventEnd) : null,
      transferKB: Math.round(bytes / 1024),
      requests: res.length
    };
  });

  report.a11y.push({
    route,
    status: resp?.status(),
    violations: axe.violations,
    violationCount: axe.violations.reduce((n, v) => n + v.nodes, 0),
    passes: axe.passes,
    incomplete: axe.incomplete
  });
  report.console.push({ route, errors });
  report.performance.push({ route, ...perf, measuredLoadMs: loadMs });
  await page.close();
}

/* --------------------------------------------------------- responsive ---- */

for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w.width, height: w.height } });
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(350);
    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      // Any element wider than the viewport that is not intentionally scrollable.
      let widest = 0;
      let culprit = '';
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > widest && r.width > de.clientWidth + 1) {
          widest = Math.round(r.width);
          culprit = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
        }
      }
      return { overflow, widest, culprit };
    });
    report.responsive.push({ width: w.name, px: w.width, route, ...info });
  }
  await page.close();
}

/* ------------------------------------------------------ link integrity ---- */

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const seen = new Map();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'load' });
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
    );
    for (const href of hrefs) {
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;
      if (href.startsWith('http') && !href.startsWith(BASE)) {
        seen.set(href, seen.get(href) ?? { external: true });
        continue;
      }
      const url = new URL(href, BASE + route).href;
      if (seen.has(url)) continue;
      const r = await page.request.get(url).catch(() => null);
      seen.set(url, { status: r ? r.status() : 0 });
    }
  }
  for (const [url, info] of seen) {
    report.links.push({ url: url.replace(BASE, '') || '/', ...info });
  }
  await page.close();
}

/* --------------------------------------------------------- interactions ---- */

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  const failures = [];

  /* Access map: canvas actually paints, and station search works. */
  await page.goto(BASE + '/access/', { waitUntil: 'load' });
  await page.waitForSelector('canvas', { timeout: 20000 });
  await page.waitForTimeout(3500);
  const painted = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const set = new Set();
    for (let i = 0; i < d.length; i += 4 * 97) {
      set.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
      if (set.size > 40) break;
    }
    return { distinctColours: set.size, width: c.width, height: c.height };
  });
  if (painted.distinctColours < 6) failures.push('access map canvas looks blank');

  await page.fill('#station-find', 'Ari');
  await page.click('form.finder button[type="submit"]');
  await page.waitForTimeout(400);
  const findMsg = await page.textContent('.finder__msg').catch(() => '');
  if (!findMsg || /no station/i.test(findMsg)) failures.push('station search did not resolve Ari');

  /* Layered views: switch to the station-count view. */
  await page.click('button:has-text("Stations in 15 min")');
  await page.waitForTimeout(1200);
  const legendSwitch = await page.textContent('.legend').catch(() => '');
  if (!/4 or more/.test(legendSwitch)) failures.push('station-count view legend did not switch');

  report.interactions.accessMap = { painted, stationSearch: findMsg.trim(), viewSwitch: /4 or more/.test(legendSwitch) };

  /* Publications filter. */
  await page.goto(BASE + '/publications/', { waitUntil: 'load' });
  const allCount = await page.textContent('#pub-count');
  await page.fill('#pub-search', 'zzzz-no-such-term');
  await page.waitForTimeout(250);
  const emptyVisible = await page.isVisible('.empty');
  await page.fill('#pub-search', 'ridership');
  await page.waitForTimeout(250);
  const ridershipCount = await page.textContent('#pub-count');
  await page.click('button:has-text("Clear filters")').catch(() => {});
  await page.fill('#pub-search', '');
  await page.waitForTimeout(200);
  if (!emptyVisible) failures.push('publications empty state did not appear');
  report.interactions.publications = {
    initial: allCount.trim(),
    noResultsState: emptyVisible,
    ridership: ridershipCount.trim()
  };

  /* Simulator reacts to a control change. */
  await page.goto(BASE + '/simulator/', { waitUntil: 'load' });
  const before = await page.textContent('.sim__summary');
  await page.click('button:has-text("Heavy rain")').catch(async () => {
    await page.click('label:has-text("Heavy rain")');
  });
  await page.waitForTimeout(400);
  const after = await page.textContent('.sim__summary');
  if (before === after) failures.push('simulator did not update on weather change');
  report.interactions.simulator = { before: before.trim(), after: after.trim() };

  /* Inquiry form: validation, then a real submission. */
  await page.goto(BASE + '/contact/', { waitUntil: 'load' });
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const validationShown = await page.isVisible('.field .err');
  const alertShown = await page.isVisible('.alert[role="alert"]');

  await page.fill('#inq-name', 'Verification Run');
  await page.fill('#inq-mail', 'not-an-email');
  await page.fill('#inq-message', 'Testing the enquiry pipeline end to end.');
  await page.selectOption('#inq-type', 'data-access');
  await page.check('#inq-consent');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const badEmailBlocked = await page.isVisible('#inq-mail-err');

  await page.fill('#inq-mail', 'verify@alis.test');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);
  const successVisible = await page.isVisible('.done[role="status"]');
  const reference = successVisible ? (await page.textContent('.done code')).trim() : '';

  report.interactions.inquiryForm = {
    validationShown,
    summaryAlertShown: alertShown,
    badEmailBlocked,
    successVisible,
    reference
  };
  if (!validationShown) failures.push('form did not show validation errors on empty submit');
  if (!badEmailBlocked) failures.push('form accepted an invalid email');
  if (!successVisible) failures.push('form submission did not reach the success state');

  report.interactions.failures = failures;
  await page.close();
}

await browser.close();

/* ------------------------------------------------------------- output ---- */

const worstA11y = report.a11y.map((a) => ({ route: a.route, nodes: a.violationCount, ids: a.violations.map((v) => v.id) }));
const overflow = report.responsive.filter((r) => r.overflow > 1);
const badLinks = report.links.filter((l) => !l.external && l.status !== 200);
const consoleErrors = report.console.filter((c) => c.errors.length);

report.summary = {
  routes: ROUTES.length,
  a11yViolationNodes: worstA11y.reduce((n, a) => n + a.nodes, 0),
  a11yRoutesWithViolations: worstA11y.filter((a) => a.nodes > 0).length,
  consoleErrors: consoleErrors.length,
  responsiveOverflow: overflow.length,
  brokenInternalLinks: badLinks.length,
  interactionFailures: report.interactions.failures.length,
  maxTransferKB: Math.max(...report.performance.map((p) => p.transferKB))
};

writeFileSync(join(root, 'reports/verification.json'), JSON.stringify(report, null, 2));

console.log('\n=== VERIFICATION SUMMARY ===');
console.log(JSON.stringify(report.summary, null, 2));
console.log('\nA11y violations by route:');
for (const a of worstA11y) console.log('  ' + a.route.padEnd(16) + a.nodes + '  ' + a.ids.join(', '));
console.log('\nConsole errors:');
for (const c of consoleErrors) console.log('  ' + c.route + ': ' + c.errors.join(' | '));
console.log('\nResponsive overflow:');
for (const o of overflow) console.log('  ' + o.width + ' ' + o.route + ' overflow=' + o.overflow + ' culprit=' + o.culprit);
console.log('\nBroken internal links:');
for (const l of badLinks) console.log('  ' + l.url + ' -> ' + l.status);
console.log('\nInteractions:');
console.log(JSON.stringify(report.interactions, null, 2));
console.log('\nPerformance (transfer KB per route):');
for (const p of report.performance) console.log('  ' + p.route.padEnd(16) + p.transferKB + ' KB, ' + p.requests + ' requests, load ' + p.loadMs + ' ms');
