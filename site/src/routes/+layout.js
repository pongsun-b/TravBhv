// Page options must live at module scope. Prerendering every route is what turns
// this SvelteKit app into a plain multi-page static site.
export const prerender = true;
export const trailingSlash = 'always';
