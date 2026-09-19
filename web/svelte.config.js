import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter({
			// SPA-style fallback so unknown URLs serve the prerendered 404 page
			// (GitHub Pages serves 404.html for missing paths automatically).
			fallback: '404.html'
		}),
		paths: {
			// Must match `baseurl` in the Jekyll _config.yml at the repo root.
			base: '/TravBhv'
		},
		prerender: {
			entries: ['*']
		}
	}
};

export default config;
