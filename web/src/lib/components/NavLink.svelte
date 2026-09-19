<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import type { NavItem } from '$lib/data/site';

	// Port of `_includes/nav-link.html`: URLs containing "://" are off-site
	// (new tab, aria-label note); internal URLs get paths.base and an
	// aria-current marker when they match the current page.
	let { item, label }: { item: NavItem; label?: string } = $props();

	const text = $derived(label || item.title);
	const offsite = $derived(item.url.includes('://'));
	const href = $derived(offsite ? item.url : `${base}${item.url}`);
	const current = $derived(!offsite && page.url.pathname === href);
</script>

{#if offsite}
	<a href={item.url} class="nav-offsite" target="_blank" rel="noopener noreferrer" aria-label="{text} (opens in a new tab)">{text}</a>
{:else}
	<a href={href} aria-current={current ? 'page' : undefined}>{text}</a>
{/if}
