#!/usr/bin/env node
/**
 * Repository guard for the published site.
 *
 * Checks the two things that must never silently regress once this repository is on GitHub:
 *
 *   1. No AI agent / identity artefact is tracked. Those files are local working notes and must
 *      never be published (they are listed in .gitignore).
 *   2. Every file the site needs is tracked. A build never fails because of a missing file that
 *      only exists locally, because the clean-clone and CI builds would be the first to notice.
 *
 * Run from anywhere:   node scripts/check-repo-hygiene.mjs
 * Or via npm:          npm run verify:repo
 *
 * Exits non-zero with a readable list if anything is wrong. No dependencies.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

function tracked() {
  return execFileSync('git', ['-C', repoRoot, 'ls-files'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

/** Assistant artefacts. Mirrors the patterns in .gitignore. */
const ARTEFACT = new RegExp(
  [
    '(^|/)(AGENTS|SOUL|IDENTITY|USER|TOOLS|HEARTBEAT|BOOTSTRAP|MEMORY|CLAUDE|GEMINI|COPILOT)\\.md$',
    '(^|/)[^/]*\\.agent\\.md$',
    '^\\.agents/',
    '^\\.claude/',
    '^\\.openclaw',
    '^\\.cluster/',
    '^memory/',
    '^prompts/',
    '^\\.cursor',
    '^\\.windsurf/',
    '^\\.clinerules$',
    '^\\.aider',
    '^\\.continue/',
    '^\\.codex/',
    '^\\.gemini/',
    '^DELIVERY/'
  ].join('|'),
  'i'
);

/** Everything the published site is built from. Kept as an explicit list so a rename is caught. */
const REQUIRED = [
  '.github/workflows/pages.yml',
  '.gitignore',
  '_config.yml',
  'README.md',
  'site/package.json',
  'site/package-lock.json',
  'site/svelte.config.js',
  'site/vite.config.js',
  'site/jsconfig.json',
  'site/.gitignore',
  'site/README.md',
  'site/HANDOFF.md',
  'site/docs/brand-guidelines.md',
  'site/static/.nojekyll',
  'site/server/inquiries.mjs',
  'site/scripts/fix-fallback-paths.mjs',
  'site/scripts/verify.mjs',
  'site/src/app.html',
  'site/src/app.css',
  'site/src/lib/tokens.css',
  'site/src/lib/brand-paths.js',
  'site/src/lib/actions/reveal.js',
  'site/src/lib/components/Header.svelte',
  'site/src/lib/components/Footer.svelte',
  'site/src/lib/components/Logo.svelte',
  'site/src/lib/components/Icon.svelte',
  'site/src/lib/components/Reveal.svelte',
  'site/src/lib/components/SectionHead.svelte',
  'site/src/lib/components/AccessMap.svelte',
  'site/src/lib/components/InquiryForm.svelte',
  'site/src/lib/components/ModeChoiceSimulator.svelte',
  'site/src/lib/data/site.js',
  'site/src/lib/data/research.js',
  'site/src/lib/data/people.js',
  'site/src/lib/data/publications.js',
  'site/src/lib/data/projects.js',
  'site/src/lib/data/datasets.js',
  'site/src/lib/data/news.js',
  'site/src/routes/+layout.svelte',
  'site/src/routes/+layout.js',
  'site/src/routes/+error.svelte'
];

/** Directories where at least one file must be tracked. */
const REQUIRED_DIRS = [
  ['site/static/geo', 13, 'walk-access GeoJSON layers'],
  ['site/static/media', 10, 'poster, portraits and affiliation logo'],
  ['site/src/routes', 12, 'one +page.svelte per published route'],
  ['site/brand', 20, 'exported identity pack']
];

/**
 * Every kind of path the ignore rules are allowed to hide. Anything else means a rule is too broad
 * and is probably swallowing something the site needs.
 */
const ALLOWED_IGNORED = new RegExp(
  [
    '^\\.openclaw', //                  assistant runtime and scratch
    '^\\.cluster/',
    '^\\.agents/',
    '^\\.claude/',
    '^\\.cursor',
    '^\\.windsurf/',
    '^\\.continue/',
    '^\\.codex/',
    '^\\.gemini/',
    '^\\.aider',
    '^\\.clinerules$',
    '^memory/',
    '^prompts/',
    '^DELIVERY/', //                     local delivery folder
    '^site/(build|node_modules|\\.svelte-kit|data)/', // build output and the enquiry ledger
    '^web/(build|node_modules|\\.svelte-kit)/',
    '^_site/',
    '^\\.jekyll-cache/',
    '^\\.jekyll-metadata$',
    '^\\.sass-cache/',
    '^scripts/access/(\\.venv|cache)/',
    '^vendor/bundle/',
    '^\\.bundle/',
    '^__pycache__/',
    '.*\\.pyc$',
    '.*\\.agent\\.md$',
    '^AGENTS\\.md$',
    '^SOUL\\.md$',
    '^IDENTITY\\.md$',
    '^USER\\.md$',
    '^TOOLS\\.md$',
    '^HEARTBEAT\\.md$',
    '^BOOTSTRAP\\.md$',
    '^MEMORY\\.md$',
    '^CLAUDE(\\.local)?\\.md$',
    '^GEMINI\\.md$',
    '^NOTES\\.local\\.md$',
    '\\.env(\\..*)?$',
    '^\\.DS_Store$'
  ].join('|')
);

/** Paths that must never be ignored, whatever the rules say. */
const NEVER_IGNORED = /^(site\/(src|static|scripts|server|docs|reports|brand)\/|site\/[^/]+$|\.github\/|_config\.yml$|README\.md$|EDITING\.md$|Gemfile(\.lock)?$|LICENSE$)/;

const files = tracked();
const problems = [];

const offenders = files.filter((f) => ARTEFACT.test(f));
if (offenders.length) {
  problems.push(
    ['An AI agent / identity file is tracked and would be published:']
      .concat(offenders.map((f) => '    ' + f))
      .concat(['    Fix without deleting your local copy: git rm --cached <path>'])
  );
}

const missing = REQUIRED.filter((f) => !files.includes(f));
if (missing.length) {
  problems.push(
    ['A file the site needs is not tracked:']
      .concat(missing.map((f) => '    ' + f))
      .concat(['    Add it with: git add <path>'])
  );
}

const counts = [];
for (const [dir, min, what] of REQUIRED_DIRS) {
  const n = files.filter((f) => f.startsWith(dir + '/')).length;
  counts.push(`  ${dir.padEnd(22)} ${String(n).padStart(3)}  (>= ${min} expected — ${what})`);
  if (n < min) problems.push([`Only ${n} tracked files under ${dir}/ (expected at least ${min}) — ${what}`]);
}

const ignoredLedger = files.filter((f) => f.startsWith('site/data/') || f.startsWith('site/build/'));
if (ignoredLedger.length) {
  problems.push(
    ['Build output or the enquiry ledger is tracked (it must stay local):'].concat(
      ignoredLedger.map((f) => '    ' + f)
    )
  );
}

// --- the ignore rules must not be too broad --------------------------------------------
function git(args) {
  return execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8' }).split('\n').filter(Boolean);
}

// A tracked file that .gitignore would also match means someone force-added it.
const trackedButIgnored = git(['ls-files', '-ci', '--exclude-standard']);
if (trackedButIgnored.length) {
  problems.push(
    ['A tracked file is also matched by .gitignore (force-added?):'].concat(
      trackedButIgnored.map((f) => '    ' + f)
    )
  );
}

// Every ignored path must be a category we intend to hide, and never site source.
const ignoredPaths = git(['ls-files', '--others', '--ignored', '--exclude-standard']);
const strayIgnored = ignoredPaths.filter((f) => !ALLOWED_IGNORED.test(f));
const ignoredSource = ignoredPaths.filter((f) => NEVER_IGNORED.test(f));
if (ignoredSource.length) {
  problems.push(
    ['An ignore rule is hiding something the site needs:'].concat(
      ignoredSource.slice(0, 20).map((f) => '    ' + f),
      ignoredSource.length > 20 ? [`    ...and ${ignoredSource.length - 20} more`] : []
    )
  );
}
if (strayIgnored.length) {
  problems.push(
    ['Ignored path does not fall into any expected category (rule may be too broad):'].concat(
      strayIgnored.slice(0, 20).map((f) => '    ' + f),
      strayIgnored.length > 20 ? [`    ...and ${strayIgnored.length - 20} more`] : []
    )
  );
}

const branch = execFileSync('git', ['-C', repoRoot, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
const head = execFileSync('git', ['-C', repoRoot, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();

console.log(`Repository guard — ${repoRoot}`);
console.log(`  branch ${branch} at ${head}, ${files.length} tracked files`);
console.log('  tracked file counts:');
for (const line of counts) console.log(line);
console.log(`  ignored paths: ${ignoredPaths.length} — all in expected categories: ${strayIgnored.length === 0}`);
console.log(`  tracked files also matched by .gitignore: ${trackedButIgnored.length}`);

if (problems.length) {
  console.log('');
  for (const block of problems) console.log('FAIL: ' + block.join('\n'));
  console.log('\nGuard failed.');
  process.exit(1);
}

console.log('\nGuard passed: no assistant artefact is tracked, every file the site needs is committed, and no ignore rule hides site source.');

// If a build is present, also confirm the artifact's entry point is intact.
const build = path.join(repoRoot, 'site', 'build');
if (fs.existsSync(path.join(build, 'index.html'))) {
  console.log('Build present: site/build/index.html exists (run scripts/verify.mjs for the full check).');
}
