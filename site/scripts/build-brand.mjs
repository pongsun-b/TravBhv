/**
 * Builds the ALIS identity assets.
 *
 * The wordmark is outlined from Instrument Sans (SIL OFL 1.1) so the shipped
 * logo does not depend on the font being installed. The mark is pure geometry.
 *
 *   node scripts/build-brand.mjs
 *
 * Writes into brand/svg/.
 */
import opentype from 'opentype.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'brand/svg');
mkdirSync(outDir, { recursive: true });

/* ---------------------------------------------------------------- font ---- */

function loadFont(file) {
  const buf = readFileSync(join(root, 'node_modules/@fontsource/instrument-sans/files', file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/**
 * opentype.js cannot run this font's GSUB table, so lay the string out glyph by
 * glyph and apply our own tracking. Kerning pairs in "ALIS" are negligible.
 */
function outline(font, text, { size = 100, tracking = 0, kerns = {} } = {}) {
  const scale = size / font.unitsPerEm;
  const chars = [...text];
  const glyphs = chars.map((ch) => font.charToGlyph(ch));
  let x = 0;
  const parts = [];
  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const p = glyph.getPath(x, 0, size);
    for (const cmd of p.commands) parts.push(cmd);
    const gb = p.getBoundingBox();
    if (Number.isFinite(gb.x1)) {
      box.x1 = Math.min(box.x1, gb.x1);
      box.y1 = Math.min(box.y1, gb.y1);
      box.x2 = Math.max(box.x2, gb.x2);
      box.y2 = Math.max(box.y2, gb.y2);
    }
    x += glyph.advanceWidth * scale + tracking * size;
    const pair = chars[i] + (chars[i + 1] ?? '');
    if (kerns[pair]) x += kerns[pair] * scale;
  }
  if (tracking) x -= tracking * size;

  const path = new opentype.Path();
  path.commands = parts;
  return { d: path.toPathData(2), width: x, box };
}

const semibold = loadFont('instrument-sans-latin-600-normal.woff');
const bold = loadFont('instrument-sans-latin-700-normal.woff');
const regular = loadFont('instrument-sans-latin-400-normal.woff');

/* Pair kerning evens out the A-L air that a geometric A leaves behind. */
const WORD = outline(semibold, 'ALIS', {
  size: 100,
  tracking: 0.045,
  kerns: { 'A-L': -30, 'L-I': -15, 'I-S': -17 }
});
const DESCRIPTOR = outline(regular, 'TRANSPORTATION BEHAVIOR LAB', { size: 100, tracking: 0.16 });
/* Secondary mark: the monogram. Carries the identity at 16 px, where no
   abstract mark survives. */
const MONO = outline(bold, 'A', { size: 100 });

const ACCENT = '#2E6B57';

/* ---------------------------------------------------------------- mark ---- */
/* A node on a ring: a closed circular route with one stop, the ring opened
   just enough that the node never merges with the stroke at favicon sizes.
   A slight down-left optical shift counterweights the node in the upper-right.
   Two weights: the display mark, and a heavier cut for 16-24 px. */

/* Display cut: 80 degree opening, node sits with clear air on both sides. */
const MARK_BIG = `
    <g transform="translate(-0.25 0.25)">
      <path d="M19.39 11.61A7.4 7.4 0 1 1 12.39 4.61" fill="none" stroke-width="2.9" stroke-linecap="butt" />
      <circle cx="17.23" cy="6.77" r="2.95" stroke="none" />
    </g>`;

/* Small cut for 24-32 px: heavier stroke, wider opening, larger node. */
const MARK_SMALL = `
    <g transform="translate(-0.25 0.25)">
      <path d="M19.37 12.65A7.4 7.4 0 1 1 11.36 4.63" fill="none" stroke-width="3.6" stroke-linecap="butt" />
      <circle cx="17.23" cy="6.77" r="3.5" stroke="none" />
    </g>`;

const markSvg = (body, stroke, fill, size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="ALIS mark">
  <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="${fill}">${body}
  </g>
</svg>
`;

/* 16-20 px form: the monogram on the accent tile. */
const tileSvg = (size = 32) => {
  const capH = MONO.box.y2 - MONO.box.y1;
  const target = 22.5;
  const scale = target / capH;
  const x = (32 - (MONO.box.x2 - MONO.box.x1) * scale) / 2 - MONO.box.x1 * scale;
  /* A triangular letter needs optical, not geometric, vertical centring. */
  const y = (32 - capH * scale) / 2 - MONO.box.y1 * scale - 0.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" role="img" aria-label="ALIS">
  <rect width="32" height="32" rx="9" fill="${ACCENT}"/>
  <g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})">
    <path fill="#FFFFFF" d="${MONO.d}"/>
  </g>
</svg>
`;
};

/* -------------------------------------------------------------- files ---- */

function write(name, content) {
  writeFileSync(join(outDir, name), content);
  console.log('  brand/svg/' + name);
}

console.log('Writing identity SVG assets:');

write('alis-mark.svg', markSvg(MARK_BIG, ACCENT, ACCENT));
write('alis-mark-small.svg', markSvg(MARK_SMALL, ACCENT, ACCENT));
write('alis-mark-mono.svg', markSvg(MARK_BIG, 'currentColor', 'currentColor'));
write('alis-monogram.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(MONO.box.x1 - 4).toFixed(2)} ${(
  MONO.box.y1 - 4
).toFixed(2)} ${(MONO.box.x2 - MONO.box.x1 + 8).toFixed(2)} ${(MONO.box.y2 - MONO.box.y1 + 8).toFixed(
  2
)}" role="img" aria-label="ALIS monogram">
  <path fill="currentColor" d="${MONO.d}"/>
</svg>
`.trimStart());
write('alis-tile.svg', tileSvg());

/* Wordmark only. */
const pad = 6;
write(
  'alis-wordmark.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(WORD.box.x1 - pad).toFixed(2)} ${(
    WORD.box.y1 - pad
  ).toFixed(2)} ${(WORD.box.x2 - WORD.box.x1 + pad * 2).toFixed(2)} ${(
    WORD.box.y2 - WORD.box.y1 + pad * 2
  ).toFixed(2)}" role="img" aria-label="ALIS">
  <path fill="currentColor" d="${WORD.d}"/>
</svg>
`
);

/* Horizontal lockup: mark, then wordmark. Mark is 1.6x the cap height. */
const capH = WORD.box.y2 - WORD.box.y1;
/* Drawn diameter of the mark is 0.74 of its 24-unit box, so a 1.22 box
   height lands the ring just under the cap height of the wordmark. */
const markH = capH * 1.22;
const gap = markH * 0.16;
const totalW = markH + gap + WORD.width;
const lockupH = Math.max(markH, capH);
const wmScale = 1;
const wmX = markH + gap;
const wmY = (lockupH - capH) / 2 - WORD.box.y1;

write(
  'alis-lockup-horizontal.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(totalW + 8).toFixed(
    2
  )} ${(lockupH + 8).toFixed(2)}" role="img" aria-label="ALIS">
  <g transform="translate(4 4)">
    <g transform="translate(0 ${((lockupH - markH) / 2).toFixed(2)}) scale(${(markH / 24).toFixed(
      4
    )})" stroke="${ACCENT}" stroke-linecap="round" stroke-linejoin="round" fill="${ACCENT}">${MARK_BIG}
    </g>
    <g transform="translate(${wmX.toFixed(2)} ${wmY.toFixed(2)}) scale(${wmScale})">
      <path fill="currentColor" d="${WORD.d}"/>
    </g>
  </g>
</svg>
`
);

/* Stacked lockup: mark above the wordmark, descriptor underneath. */
const stackMarkH = capH * 1.34;
const descScale = (capH * 0.3) / 100;
const descW = DESCRIPTOR.width * descScale;
const stackW = Math.max(stackMarkH, WORD.width, descW);
write(
  'alis-lockup-stacked.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(stackW + 8).toFixed(2)} ${(
    stackMarkH +
    8 +
    capH +
    capH * 0.55
  ).toFixed(2)}" role="img" aria-label="ALIS, Transportation Behavior Lab">
  <g transform="translate(4 4)">
    <g transform="scale(${(stackMarkH / 24).toFixed(4)})" stroke="${ACCENT}" stroke-linecap="round" stroke-linejoin="round" fill="${ACCENT}">${MARK_BIG}
    </g>
    <g transform="translate(0 ${(stackMarkH + 8 - WORD.box.y1).toFixed(2)})">
      <path fill="currentColor" d="${WORD.d}"/>
    </g>
    <g transform="translate(0 ${(stackMarkH + 8 + capH + capH * 0.38 - DESCRIPTOR.box.y1).toFixed(
      2
    )}) scale(${descScale.toFixed(5)})">
      <path fill="currentColor" opacity="0.62" d="${DESCRIPTOR.d}"/>
    </g>
  </g>
</svg>
`
);

/* The descriptor on its own, for the guidelines page. */
write(
  'alis-descriptor.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(DESCRIPTOR.box.x1 - 4).toFixed(2)} ${(
    DESCRIPTOR.box.y1 - 4
  ).toFixed(2)} ${(DESCRIPTOR.box.x2 - DESCRIPTOR.box.x1 + 8).toFixed(2)} ${(
    DESCRIPTOR.box.y2 -
    DESCRIPTOR.box.y1 +
    8
  ).toFixed(2)}" role="img" aria-label="Transportation Behavior Lab">
  <path fill="currentColor" d="${DESCRIPTOR.d}"/>
</svg>
`
);

write(
  '_mark-pathdata.json',
  JSON.stringify({ display: MARK_BIG.trim(), small: MARK_SMALL.trim(), accent: ACCENT }, null, 2)
);

/* ------------------------------------------------- shared brand module ---- */

const wordVb = `${(WORD.box.x1 - pad).toFixed(2)} ${(WORD.box.y1 - pad).toFixed(2)} ${(
  WORD.box.x2 -
  WORD.box.x1 +
  pad * 2
).toFixed(2)} ${(WORD.box.y2 - WORD.box.y1 + pad * 2).toFixed(2)}`;
const monoVb = `${(MONO.box.x1 - 4).toFixed(2)} ${(MONO.box.y1 - 4).toFixed(2)} ${(
  MONO.box.x2 -
  MONO.box.x1 +
  8
).toFixed(2)} ${(MONO.box.y2 - MONO.box.y1 + 8).toFixed(2)}`;

const module = `/* Generated by scripts/build-brand.mjs - do not edit by hand.
   The site and the exported asset pack render from these exact paths. */

export const ACCENT = '${ACCENT}';

export const mark = {
  viewBox: '0 0 24 24',
  paths:
    ${JSON.stringify(MARK_BIG.trim())}
};

export const markSmall = {
  viewBox: '0 0 24 24',
  paths:
    ${JSON.stringify(MARK_SMALL.trim())}
};

export const wordmark = {
  viewBox: '${wordVb}',
  d: ${JSON.stringify(WORD.d)}
};

export const monogram = {
  viewBox: '${monoVb}',
  d: ${JSON.stringify(MONO.d)}
};

export const metrics = {
  wordmarkAspect: ${(WORD.width / capH).toFixed(3)},
  capHeight: ${capH.toFixed(2)},
  wordmarkWidth: ${WORD.width.toFixed(2)}
};
`;

writeFileSync(join(root, 'src/lib/brand-paths.js'), module);
console.log('  src/lib/brand-paths.js');

console.log('\nWordmark metrics (font units at size 100):');
console.log('  advance width:', WORD.width.toFixed(2));
console.log('  cap height   :', capH.toFixed(2));
console.log('  aspect ratio :', (WORD.width / capH).toFixed(3));
