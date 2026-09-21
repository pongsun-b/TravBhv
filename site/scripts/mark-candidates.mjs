/**
 * Renders mark candidates at display and small sizes for a side-by-side call.
 *   node scripts/mark-candidates.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
mkdirSync(join(root, '.openclaw-tmp'), { recursive: true });

const ACCENT = '#2E6B57';

/* C1 - tangent-matched S with two nodes. */
const C1 = `
  <path d="M6.5 18.5Q6.5 12.5 12 12Q17.5 11.5 17.5 5.5" fill="none" stroke-width="2.9"/>
  <circle cx="6.5" cy="18.5" r="2.8" stroke="none"/>
  <circle cx="17.5" cy="5.5" r="2.8" stroke="none"/>`;

/* C2 - three motion bars, left aligned, descending. */
const C2 = `
  <path d="M5 6H19" fill="none" stroke-width="3.2"/>
  <path d="M5 12H14.5" fill="none" stroke-width="3.2"/>
  <path d="M5 18H10.5" fill="none" stroke-width="3.2"/>`;

/* C3 - closed ring with a node sitting on it. */
const C3 = `
  <circle cx="12" cy="12" r="7.6" fill="none" stroke-width="2.9"/>
  <circle cx="17.6" cy="6.4" r="3.2" stroke="none"/>`;

const candidates = [
  { id: 'C1', label: 'S trace', body: C1 },
  { id: 'C2', label: 'Motion bars', body: C2 },
  { id: 'C3', label: 'Node on ring', body: C3 }
];

function mark(body, colour, size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" stroke="${colour}" fill="${colour}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function tile(body, size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}"><rect width="32" height="32" rx="9" fill="${ACCENT}"/><g transform="translate(4 4)" stroke="#fff" fill="#fff" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

const rows = candidates
  .map(
    (c) => `
  <div class="row">
    <div class="name">${c.id} · ${c.label}</div>
    <div class="cell big">${mark(c.body, ACCENT, 96)}</div>
    <div class="cell">${mark(c.body, ACCENT, 48)}</div>
    <div class="cell">${mark(c.body, ACCENT, 32)}</div>
    <div class="cell">${mark(c.body, ACCENT, 24)}</div>
    <div class="cell">${mark(c.body, ACCENT, 16)}</div>
    <div class="cell">${tile(c.body, 48)}</div>
    <div class="cell">${tile(c.body, 24)}</div>
    <div class="cell">${tile(c.body, 16)}</div>
  </div>`
  )
  .join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#F4F5F2;font-family:-apple-system,system-ui,sans-serif;}
  .sheet{width:1180px;padding:28px 32px 34px;}
  h1{font-size:20px;margin:0 0 4px;color:#161A19;}
  .sub{font-size:13px;color:#5F6864;margin:0 0 22px;}
  .head,.row{display:grid;grid-template-columns:170px 120px 80px 70px 60px 52px 80px 60px 52px;align-items:center;}
  .head{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5F6864;padding-bottom:8px;border-bottom:1px solid #E2E5DF;}
  .row{border-bottom:1px solid #E2E5DF;padding:16px 0;}
  .name{font-size:14px;color:#161A19;font-weight:500;}
  .cell{display:flex;align-items:center;}
  .head span{display:block;}
</style></head><body><div class="sheet">
  <h1>ALIS mark - candidate comparison</h1>
  <p class="sub">Display size, then 48 / 32 / 24 / 16 px, then the same three inside a tile at 48 / 24 / 16 px.</p>
  <div class="head"><span>Candidate</span><span>96 px</span><span>48</span><span>32</span><span>24</span><span>16</span><span>tile 48</span><span>tile 24</span><span>tile 16</span></div>
  ${rows}
</div></body></html>`;

const out = join(root, '.openclaw-tmp/mark-candidates.png');
writeFileSync(join(root, '.openclaw-tmp/mark-candidates.html'), html);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1180, height: 620 } });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('wrote', out);
