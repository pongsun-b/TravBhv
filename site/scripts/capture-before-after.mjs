/**
 * Captures full-page "before" screenshots of the live pre-restyle site and
 * matching "after" screenshots of the restyled site, at desktop and mobile
 * widths, then composes side-by-side comparison sheets.
 *
 *   node scripts/capture-before-after.mjs [afterBase]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const AFTER = process.argv[2] || 'http://localhost:4180';
const BEFORE = 'https://pongsun-b.github.io/TravBhv';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(root, 'reports/before-after');
mkdirSync(out, { recursive: true });

const PAIRS = [
  { key: 'home', label: 'Home', before: BEFORE + '/', after: AFTER + '/' },
  { key: 'research', label: 'Research', before: BEFORE + '/research/', after: AFTER + '/research/' },
  { key: 'projects', label: 'Projects', before: BEFORE + '/projects/', after: AFTER + '/projects/' },
  { key: 'people', label: 'People', before: BEFORE + '/team/', after: AFTER + '/people/' },
  {
    key: 'publications',
    label: 'Publications',
    before: BEFORE + '/publications/',
    after: AFTER + '/publications/'
  },
  { key: 'access', label: 'Access map', before: BEFORE + '/access/', after: AFTER + '/access/' }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

const browser = await chromium.launch({ channel: 'chrome' });
const shots = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  for (const pair of PAIRS) {
    for (const side of ['before', 'after']) {
      const url = pair[side];
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        // Let lazy images settle and give the map time to paint.
        await page.evaluate(async () => {
          const h = document.body.scrollHeight;
          for (let y = 0; y < h; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(vp.name === 'desktop' ? 2200 : 1500);

        // If the page carries a canvas (the access map), wait until it has
        // actually painted before capturing.
        try {
          await page.waitForFunction(
            () => {
              const c = document.querySelector('canvas');
              if (!c) return true;
              const ctx = c.getContext('2d');
              const d = ctx.getImageData(0, 0, c.width, c.height).data;
              const set = new Set();
              for (let i = 0; i < d.length; i += 4 * 61) {
                set.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
                if (set.size > 8) return true;
              }
              return false;
            },
            { timeout: 25000 }
          );
        } catch (e) {
          /* capture anyway */
        }
        await page.waitForTimeout(400);

        // Capture with a tall viewport rather than fullPage: Chromium composites
        // canvas layers blankly when it stitches a page taller than the viewport.
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.setViewportSize({
          width: vp.width,
          height: Math.min(Math.max(pageHeight, vp.height), 7000)
        });
        await page.waitForTimeout(1800);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);

        const file = join(out, `${pair.key}-${side}-${vp.name}.png`);
        await page.screenshot({ path: file });
        shots.push(file);
        console.log('captured', file.replace(root + '/', ''));
      } catch (e) {
        console.log('FAILED', pair.key, side, vp.name, '-', e.message.split('\n')[0]);
      }
    }
  }
  await page.close();
}

await browser.close();

/* Compose side-by-side sheets with Pillow. */
const py = `
from PIL import Image, ImageDraw
import os
out = ${JSON.stringify(out)}
PAGES = ['home','research','projects','people','publications','access']
BG = (244,245,242)

# Per-page full-length comparison.
PANEL = 640
for vp in ['desktop', 'mobile']:
    for key in PAGES:
        b = os.path.join(out, f'{key}-before-{vp}.png')
        a = os.path.join(out, f'{key}-after-{vp}.png')
        if not (os.path.exists(b) and os.path.exists(a)):
            continue
        def load(p, w):
            im = Image.open(p).convert('RGB')
            return im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)
        ib, ia = load(b, PANEL), load(a, PANEL)
        h = max(ib.height, ia.height)
        sheet = Image.new('RGB', (PANEL*2 + 36, h + 58), BG)
        d = ImageDraw.Draw(sheet)
        d.text((4, 12), f'BEFORE  ·  pre-restyle  ·  {key}  ·  {vp}', fill=(70,80,75))
        d.text((PANEL+40, 12), f'AFTER  ·  TBRG  ·  {key}  ·  {vp}', fill=(46,107,87))
        sheet.paste(ib, (0, 48))
        sheet.paste(ia, (PANEL+36, 48))
        d.line([(PANEL+16, 48), (PANEL+16, h+48)], fill=(210,214,206), width=1)
        sheet.save(os.path.join(out, f'compare-{key}-{vp}.png'))
        print('composed compare-%s-%s.png (%dx%d)' % (key, vp, sheet.width, sheet.height))

# Desktop overview: 3 pages across, 2 rows.
COLS, ROWS = 3, 2
TW, TH = 560, 420
cellw = TW*2 + 20
sheet = Image.new('RGB', (COLS*cellw + 40, ROWS*(TH+56) + 60), BG)
d = ImageDraw.Draw(sheet)
d.text((16, 12), 'TBRG restyle - before / after, desktop 1440 px, top of each page', fill=(22,26,25))
d.text((16, 30), 'left = pre-restyle live site, right = TBRG. Full-length comparisons are in the compare-*.jpg files.', fill=(95,104,100))
for i, key in enumerate(PAGES):
    cx = 16 + (i % COLS) * cellw
    cy = 60 + (i // COLS) * (TH + 56)
    d.text((cx, cy), key.upper(), fill=(46,107,87))
    for j, side in enumerate(['before','after']):
        p = os.path.join(out, f'{key}-{side}-desktop.png')
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGB')
        im = im.resize((TW, max(1, round(im.height*TW/im.width))), Image.LANCZOS)
        if im.height > TH: im = im.crop((0,0,TW,TH))
        sheet.paste(im, (cx + j*(TW+20), cy+16))
sheet.save(os.path.join(out, 'overview.png'))
print('overview.png', sheet.size)

# Mobile overview: 2 pages across, 3 rows, taller crops so type is readable.
MCOLS, MROWS = 2, 3
MW, MH = 470, 700
cellw = MW*2 + 20
sheet2 = Image.new('RGB', (MCOLS*cellw + 40, MROWS*(MH+56) + 60), BG)
d2 = ImageDraw.Draw(sheet2)
d2.text((16, 12), 'TBRG restyle - before / after, mobile 390 px', fill=(22,26,25))
for i, key in enumerate(PAGES):
    cx = 16 + (i % MCOLS) * cellw
    cy = 60 + (i // MCOLS) * (MH + 56)
    d2.text((cx, cy), key.upper(), fill=(46,107,87))
    for j, side in enumerate(['before','after']):
        p = os.path.join(out, f'{key}-{side}-mobile.png')
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGB')
        im = im.resize((MW, max(1, round(im.height*MW/im.width))), Image.LANCZOS)
        if im.height > MH: im = im.crop((0,0,MW,MH))
        sheet2.paste(im, (cx + j*(MW+20), cy+16))
sheet2.save(os.path.join(out, 'overview-mobile.png'))
print('overview-mobile.png', sheet2.size)
`;
execFileSync('python3', ['-c', py], { stdio: 'inherit' });

console.log('\nCaptured', shots.length, 'screenshots');
