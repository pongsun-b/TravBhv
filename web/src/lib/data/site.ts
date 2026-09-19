import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// Same cwd assumption as people.ts: cwd is `web/` during dev/build, so the
// Jekyll files live one level up. Override with REPO_ROOT.
const REPO_ROOT = process.env.REPO_ROOT ?? path.resolve(process.cwd(), '..');

export interface SiteConfig {
	title: string;
	short_title?: string;
	tagline?: string;
	description?: string;
	email?: string;
	phone?: string;
	office?: string;
	maps_url?: string;
	scholar_url?: string;
	department_url?: string;
	faculty_url?: string;
	university_url?: string;
	[key: string]: unknown;
}

export interface NavItem {
	title: string;
	url: string;
	nav?: boolean;
	footer?: boolean;
	footer_title?: string;
}

function readYaml<T>(rel: string): T {
	return parse(fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8')) as T;
}

let siteCache: SiteConfig | null = null;

/** Parsed repo-root `_config.yml` (Jekyll site config). */
export function getSite(): SiteConfig {
	if (!siteCache) siteCache = readYaml<SiteConfig>('_config.yml');
	return siteCache;
}

function items(file: string): NavItem[] {
	const doc = readYaml<{ items?: NavItem[] } | null>(path.join('_data', file));
	return (doc?.items ?? []).filter((i) => i.title && i.url);
}

/** `_data/nav.yml` items — the stable core menu. */
export function getNav(): NavItem[] {
	return items('nav.yml');
}

/** `_data/extras.yml` items — extra pages/dashboards. */
export function getExtras(): NavItem[] {
	return items('extras.yml');
}

/**
 * Top-menu links, mirroring `_includes/header.html`:
 * all nav items, then extras unless `nav: false`.
 */
export function getHeaderNav(): NavItem[] {
	return [...getNav(), ...getExtras().filter((e) => e.nav !== false)];
}

/**
 * Footer links, mirroring `_includes/footer.html`:
 * nav/extras items flagged `footer: true`, plus an "Apps" link when any
 * extras exist.
 */
export function getFooterNav(): { links: { item: NavItem; label?: string }[]; showApps: boolean } {
	const flagged = (list: NavItem[]) =>
		list.filter((i) => i.footer).map((item) => ({ item, label: item.footer_title }));
	return {
		links: [...flagged(getNav()), ...flagged(getExtras())],
		showApps: getExtras().length > 0
	};
}
