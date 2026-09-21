import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Static output: every route is prerendered to its own folder so the site
    // can be dropped on GitHub Pages, Netlify, S3, or opened straight from disk.
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      // All routes are prerendered; the fallback only supplies a styled 404 page.
      fallback: '404.html',
      precompress: false,
      strict: false
    }),
    // Relative asset paths keep the prerendered build portable across subpaths.
    paths: { relative: true },
    // `trailingSlash` is declared as a page option in src/routes/+layout.svelte.
    prerender: { entries: ['*'], handleHttpError: 'warn' }
  }
};

export default config;
