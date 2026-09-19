<script lang="ts">
	import '$lib/styles/tbrg.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Port of `_layouts/default.html`: skip link, header, main, footer.
	let { data, children } = $props();
</script>

<a class="skip-link" href="#main">Skip to content</a>
<Header items={data.headerNav} />
<main id="main">
	{@render children()}
</main>
<Footer site={data.site} links={data.footerLinks} showApps={data.showApps} />
