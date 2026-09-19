<script lang="ts">
	import { base } from '$app/paths';
	import NavLink from './NavLink.svelte';
	import type { NavItem } from '$lib/data/site';

	// Port of `_includes/header.html`, including the mobile nav-toggle behavior
	// that lived in the `<script>` at the bottom of `_includes/footer.html`.
	let { items }: { items: NavItem[] } = $props();

	let open = $state(false);
	let navEl: HTMLElement;

	function setOpen(value: boolean) {
		open = value;
	}

	$effect(() => {
		document.body.classList.toggle('nav-open', open);

		// Close the menu when a nav link is clicked (delegated, as in the
		// Jekyll inline script).
		function onNavClick(e: MouseEvent) {
			if ((e.target as HTMLElement).closest('a')) setOpen(false);
		}
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') setOpen(false);
		}
		function onDocumentClick(e: MouseEvent) {
			if (!open) return;
			if (!(e.target as HTMLElement).closest('.site-header')) setOpen(false);
		}
		navEl.addEventListener('click', onNavClick);
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('click', onDocumentClick);
		return () => {
			document.body.classList.remove('nav-open');
			navEl.removeEventListener('click', onNavClick);
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('click', onDocumentClick);
		};
	});
</script>

<header class="site-header">
	<div class="wrap">
		<a class="brand" href="{base}/">
			<span class="brand-mark">TBRG</span>
			<span class="brand-name">Travel Behavior Research Group</span>
		</a>
		<button
			class="nav-toggle"
			type="button"
			aria-controls="site-nav"
			aria-expanded={open}
			onclick={() => setOpen(!open)}>Menu</button
		>
		<nav class="site-nav" class:is-open={open} id="site-nav" aria-label="Primary" bind:this={navEl}>
			<ul>
				{#each items as item}
					<li><NavLink {item} /></li>
				{/each}
			</ul>
		</nav>
	</div>
</header>
