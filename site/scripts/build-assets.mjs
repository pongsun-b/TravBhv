/**
 * Renders the TBRG asset pack: PNGs, favicon set and social cards.
 *
 *   node scripts/build-assets.mjs
 *
 * Uses the locally installed Chrome via Playwright. Writes into brand/.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const brand = join(root, 'brand');

for (const d of ['png', 'favicon', 'social']) mkdirSync(join(brand, d), { recursive: true });

const ACCENT = '#2E6B57';
const INK = '#161A19';
const PAPER = '#F4F5F2';
const INK_DARK = '#0F1413';
const LIGHT = '#EEF2EF';

const svg = (f) => readFileSync(join(brand, 'svg', f), 'utf8');

/* Social cards use live text, so the two licensed faces are inlined. */
function fontFace(family, pkg, file, weight) {
  const b64 = readFileSync(
    join(root, 'node_modules/@fontsource', pkg, 'files', file)
  ).toString('base64');
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
}
const FONT_CSS = [
  fontFace('Instrument Sans', 'instrument-sans', 'instrument-sans-latin-500-normal.woff2', 500),
  fontFace('JetBrains Mono', 'jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2', 400)
].join('\n');

function sized(markup, w, h) {
  return markup.replace('<svg ', `<svg width="${w}" height="${h}" `);
}

function recolour(markup, from, to) {
  return markup.split(from).join(to);
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

async function shot(markupHtml, w, h, out, { transparent = true, bg = null } = {}) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:${bg ?? 'transparent'};}
      svg{display:block;}
    </style></head><body>${markupHtml}</body></html>`,
    { waitUntil: 'load' }
  );
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: transparent });
  console.log('  ' + out.replace(root + '/', ''));
}

console.log('Rendering PNG assets:');

const mark = svg('tbrg-mark.svg');
const markMono = svg('tbrg-mark-mono.svg');
const lockH = svg('tbrg-lockup-horizontal.svg');
const lockHAccent = recolour(lockH, 'currentColor', INK);
const lockHWhite = recolour(recolour(lockH, 'currentColor', LIGHT), ACCENT, LIGHT);
const lockStack = svg('tbrg-lockup-stacked.svg');
const lockStackAccent = recolour(lockStack, 'currentColor', INK);
const lockStackWhite = recolour(recolour(lockStack, 'currentColor', LIGHT), ACCENT, LIGHT);
const wordmark = svg('tbrg-wordmark.svg');
const wordmarkInk = recolour(wordmark, 'currentColor', INK);
const tile = svg('tbrg-tile.svg');

/* Marks */
for (const size of [256, 512, 1024]) {
  await shot(sized(mark, size, size), size, size, join(brand, 'png', `tbrg-mark-${size}.png`));
}
await shot(
  sized(markMono, 512, 512).replace(/currentColor/g, LIGHT),
  512,
  512,
  join(brand, 'png', 'tbrg-mark-white-512.png')
);
await shot(
  sized(markMono, 512, 512).replace(/currentColor/g, INK),
  512,
  512,
  join(brand, 'png', 'tbrg-mark-ink-512.png')
);

/* Lockups */
await shot(sized(lockHAccent, 1200, 372), 1200, 372, join(brand, 'png', 'tbrg-lockup-horizontal-1200.png'));
await shot(sized(lockHAccent, 2400, 744), 2400, 744, join(brand, 'png', 'tbrg-lockup-horizontal-2400.png'));
await shot(sized(lockHWhite, 1200, 372), 1200, 372, join(brand, 'png', 'tbrg-lockup-horizontal-white-1200.png'));
await shot(sized(lockStackAccent, 800, 620), 800, 620, join(brand, 'png', 'tbrg-lockup-stacked-800.png'));
await shot(sized(lockStackWhite, 800, 620), 800, 620, join(brand, 'png', 'tbrg-lockup-stacked-white-800.png'));
await shot(sized(wordmarkInk, 1200, 420), 1200, 420, join(brand, 'png', 'tbrg-wordmark-1200.png'));

/* Favicon and app icon set */
console.log('Rendering favicon set:');
for (const [size, name] of [
  [16, 'favicon-16.png'],
  [32, 'favicon-32.png'],
  [48, 'favicon-48.png'],
  [180, 'apple-touch-icon-180.png'],
  [192, 'android-chrome-192.png'],
  [512, 'android-chrome-512.png']
]) {
  await shot(sized(tile, size, size), size, size, join(brand, 'favicon', name), { transparent: false, bg: ACCENT });
}
writeFileSync(
  join(brand, 'favicon', 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'TBRG',
      short_name: 'TBRG',
      description: 'Travel Behavior Research Group',
      theme_color: ACCENT,
      background_color: PAPER,
      display: 'standalone',
      icons: [
        { src: 'android-chrome-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'android-chrome-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    null,
    2
  ) + '\n'
);
console.log('  brand/favicon/site.webmanifest');

/* Social cards */
console.log('Rendering social cards:');

function card({ dark, headline, kicker }) {
  const bg = dark ? INK_DARK : PAPER;
  const fg = dark ? LIGHT : INK;
  const sub = dark ? '#A9B3AC' : '#46504B';
  const lock = dark ? lockHWhite : lockHAccent;
  const markColour = dark ? LIGHT : ACCENT;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${FONT_CSS}
    html,body{margin:0;width:1200px;height:630px;background:${bg};font-family:'Instrument Sans',system-ui,sans-serif;}
    .card{position:relative;width:1200px;height:630px;overflow:hidden;}
    .arc{position:absolute;right:-190px;bottom:-250px;opacity:${dark ? 0.16 : 0.1};}
    .inner{position:absolute;inset:0;padding:60px 72px 66px;display:flex;flex-direction:column;justify-content:space-between;}
    .lock{height:52px;}
    .lock svg{height:52px;width:auto;}
    h1{margin:0;font-size:54px;line-height:1.07;letter-spacing:-0.03em;color:${fg};font-weight:500;max-width:16ch;}
    .kicker{font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:0.13em;text-transform:uppercase;color:${sub};margin:0 0 20px;}
    .rule{height:2px;width:88px;background:${markColour};margin:0 0 26px;border-radius:2px;}
  </style></head><body>
    <div class="card">
      <div class="arc">${sized(recolour(mark, ACCENT, markColour), 720, 720)}</div>
      <div class="inner">
        <div class="lock">${lock}</div>
        <div>
          <div class="rule"></div>
          <p class="kicker">${kicker}</p>
          <h1>${headline}</h1>
        </div>
      </div>
    </div>
  </body></html>`;
}

await shot(
  card({
    dark: false,
    kicker: 'TBRG · Travel Behavior Research Group',
    headline: 'Bangkok moves by a million small decisions.'
  }),
  1200,
  630,
  join(brand, 'social', 'og-image.png'),
  { transparent: false, bg: PAPER }
);
await shot(
  card({
    dark: true,
    kicker: 'TBRG · Travel Behavior Research Group',
    headline: 'Bangkok moves by a million small decisions.'
  }),
  1200,
  630,
  join(brand, 'social', 'og-image-dark.png'),
  { transparent: false, bg: INK_DARK }
);

await browser.close();
console.log('\nAsset pack complete.');
