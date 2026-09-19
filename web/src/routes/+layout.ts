import { getFooterNav, getHeaderNav, getSite } from '$lib/data/site';

// Prerender every route at build time (static hosting on GitHub Pages).
export const prerender = true;

// Jekyll-style URLs end in `/`; emit team/index.html rather than team.html
// so GitHub Pages serves the same URLs as the old site.
export const trailingSlash = 'always';

export function load() {
	const footer = getFooterNav();
	return {
		site: getSite(),
		headerNav: getHeaderNav(),
		footerLinks: footer.links,
		showApps: footer.showApps
	};
}
