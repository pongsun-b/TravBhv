<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import NavLink from './NavLink.svelte';
	import type { NavItem, SiteConfig } from '$lib/data/site';

	// Port of `_includes/footer.html` (markup only; the nav-toggle script moved
	// into Header.svelte).
	let {
		site,
		links,
		showApps
	}: {
		site: SiteConfig;
		links: { item: NavItem; label?: string }[];
		showApps: boolean;
	} = $props();

	const appsCurrent = $derived(page.url.pathname === `${base}/apps/`);
</script>

<footer class="site-footer">
	<div class="wrap">
		<div class="footer-grid">
			<div>
				<p class="footer-kicker">Affiliation</p>
				<p class="footer-lockup">
					<a href={site.department_url} target="_blank" rel="noopener">
						<img
							src="{base}/images/logopic/logo-civil-engineering.png"
							width="751"
							height="105"
							alt="Department of Civil Engineering, Faculty of Engineering, Chulalongkorn University"
						/>
					</a>
				</p>
				<p>
					Travel Behavior Research Group<br />
					<a href={site.university_url} target="_blank" rel="noopener">Chulalongkorn University</a>
				</p>
				<p class="footer-links">
					{#each links as { item, label }}
						<NavLink {item} {label} />
					{/each}
					{#if showApps}
						<a href="{base}/apps/" aria-current={appsCurrent ? 'page' : undefined}>Apps</a>
					{/if}
				</p>
			</div>
			<div>
				<p class="footer-kicker">Address</p>
				<p>
					254 Phayathai Rd<br />
					Pathumwan, Bangkok 10330<br />
					Thailand<br />
					{#if site.office}{site.office}<br />{/if}
					<a href={site.maps_url} target="_blank" rel="noopener">Map</a>
				</p>
			</div>
			<div>
				<p class="footer-kicker">Contact</p>
				<p>
					<a href="mailto:{site.email}">{site.email}</a><br />
					{#if site.phone}{site.phone}<br />{/if}
					<a href={site.scholar_url} target="_blank" rel="noopener">Google Scholar</a>
				</p>
			</div>
		</div>
		<p class="copyright">&copy; 2026 Travel Behavior Research Group</p>
	</div>
</footer>
