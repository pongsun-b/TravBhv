import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Kit configuration (adapter, paths.base, prerender) lives in svelte.config.js.
export default defineConfig({
	plugins: [sveltekit()]
});
