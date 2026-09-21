/**
 * Fix the SvelteKit fallback page (404.html) for project-page deploys.
 *
 * `paths: { relative: true }` relativizes the prerendered route pages, but the fallback page is
 * written for a domain root: its asset references are root-absolute (`/_app/...`) and its inline
 * bootstrap declares `base: ""`. A fallback can be served from any depth, so page-relative paths
 * cannot be used there; instead the published base path has to be baked in.
 *
 * On a GitHub Pages *project* site the site lives under a base path such as /TravBhv, so:
 *   - `href="/x"` / `src="/x"`            -> `href="/TravBhv/x"`
 *   - `import("/_app/...")`               -> `import("/TravBhv/_app/...")`
 *   - `base: ""`                          -> `base: "/TravBhv"`   (so hydrated links resolve)
 *
 * Usage: node scripts/fix-fallback-paths.mjs [--base /TravBhv]
 * The base can also be supplied through PAGES_BASE_PATH, which is what
 * actions/configure-pages@v5 reports as steps.pages.outputs.base_path.
 * Without a base the script is a no-op, which is correct for a root deploy.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'build', '404.html');

const args = process.argv.slice(2);
const baseArgIndex = args.indexOf('--base');
const rawBase = (baseArgIndex !== -1 ? args[baseArgIndex + 1] : process.env.PAGES_BASE_PATH) || '';

if (!rawBase.trim() || rawBase.trim() === '/') {
  console.log('fix-fallback-paths: no base path given (root deploy) - 404.html left as built.');
  process.exit(0);
}

// Normalize to a single leading slash and no trailing slash.
const base = '/' + rawBase.trim().replace(/^\/+|\/+$/g, '');

let html = await readFile(file, 'utf8');

if (html.includes(`href="${base}/_app/`) && html.includes(`base: "${base}"`)) {
  console.log(`fix-fallback-paths: 404.html already carries the ${base} base - nothing to do.`);
  process.exit(0);
}

let touched = 0;
html = html
  // Attribute references: href="/x" and src="/x", but not protocol-relative "//x".
  .replace(/((?:href|src)\s*=\s*")\/(?!\/)/g, (_m, attr) => {
    touched++;
    return `${attr}${base}/`;
  })
  // Dynamic imports inside the inline bootstrap: import("/_app/...").
  .replace(/(import\(\s*["'])\/(?!\/)/g, (_m, prefix) => {
    touched++;
    return `${prefix}${base}/`;
  })
  // The client router's base, so hydrated links and fetches stay under the subpath.
  .replace(/(\bbase\s*:\s*)(["'])\2/g, (_m, prefix, quote) => {
    touched++;
    return `${prefix}${quote}${base}${quote}`;
  });

await writeFile(file, html);
console.log(`fix-fallback-paths: rewrote ${touched} references in 404.html to the ${base} base.`);
