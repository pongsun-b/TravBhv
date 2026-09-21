/**
 * Exports src/lib/tokens.css to design-tokens.json.
 *
 * tokens.css is the single source of truth. This script only mirrors it for
 * tooling and for the guidelines document, so the JSON can never drift.
 *
 *   node scripts/tokens-export.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const css = readFileSync(join(root, 'src/lib/tokens.css'), 'utf8');

function block(selector) {
  const start = css.indexOf(selector);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function parse(body) {
  const out = {};
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(body))) {
    out[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  }
  return out;
}

const light = parse(block(':root {'));
const dark = parse(block("[data-theme='dark'] {"));

const order = [
  'colour',
  'typography',
  'space',
  'radius',
  'elevation',
  'motion',
  'focus'
];

const groups = {
  colour: (k) =>
    /^--(paper|surface|surface-2|surface-3|ink|ink-2|muted|faint|line|line-strong|accent|accent-ink|accent-soft|accent-line|ok|warn|danger|hue-[1-5]|cat-|band-|primal-|map-)/.test(
      k
    ),
  typography: (k) => /^--(font|fs|lh|tracking)/.test(k),
  space: (k) => /^--(space|wrap|measure|section-y)/.test(k),
  radius: (k) => /^--(radius|r-)/.test(k),
  elevation: (k) => /^--shadow/.test(k),
  motion: (k) => /^--(dur|ease|reveal)/.test(k),
  focus: (k) => /^--focus/.test(k)
};

const grouped = {};
for (const name of order) {
  const pick = groups[name];
  const entries = Object.entries(light).filter(([k]) => pick(k));
  if (entries.length) grouped[name] = Object.fromEntries(entries);
}

const payload = {
  name: 'ALIS design tokens',
  version: '1.0.0',
  source: 'src/lib/tokens.css',
  note: 'Generated file. Edit src/lib/tokens.css and re-run scripts/tokens-export.mjs.',
  generatedFrom: order,
  count: { light: Object.keys(light).length, dark: Object.keys(dark).length },
  light,
  dark,
  grouped
};

writeFileSync(join(root, 'design-tokens.json'), JSON.stringify(payload, null, 2) + '\n');
console.log(
  `design-tokens.json written: ${payload.count.light} light tokens, ${payload.count.dark} dark overrides`
);
