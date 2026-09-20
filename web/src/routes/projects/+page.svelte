<script lang="ts">
	import { base } from '$app/paths';

	// Port of `_pages/projects.html` on the `gridlay` wrapper
	// (`<article class="page wrap wide">`).
	let { data } = $props();

	function photoSrc(photo: string): string {
		return photo.includes('/') ? `${base}${photo}` : `${base}/images/teampic/${photo}`;
	}
</script>

<svelte:head>
	<title>Projects | Travel Behavior Research Group</title>
	<meta
		name="description"
		content="Current research and completed theses of the Travel Behavior Research Group."
	/>
</svelte:head>

<article class="page wrap wide">
	<p class="page-kicker">Projects</p>
	<h1>What the group is working on</h1>
	<p>
		TBRG work runs from travel behavior surveys and mobile data analysis to planning tools for
		Bangkok and Thailand. Thesis topics below are listed with their researchers; current topics are
		from the group's active students.
	</p>

	<h2>Featured</h2>
	<figure class="access-feature">
		<a href="{base}/access/">
			<img
				src="{base}/access-data/access-16x9.jpg"
				width="1920"
				height="1080"
				alt="Map of Bangkok walk access to urban rail at a typical 4.0 km/h: white under 5 minutes, gold 5 to 10, orange 10 to 15, red beyond 15."
			/>
		</a>
		<figcaption>
			<strong>Walk access to urban rail.</strong> Network isochrones from station exits on the
			OpenStreetMap walk graph — 5, 10 and 15 minutes at a typical 4.0 km/h, with river and canal
			boat piers as an extra layer. <a href="{base}/access/">Open the map</a>.
		</figcaption>
	</figure>
	<p>
		<strong>Public Transport Accessibility Index (PTAI).</strong> A related lab project measuring
		demand-weighted generalized travel cost across 88 inner-Bangkok subdistricts. Enquiries:
		<a href="mailto:{data.site.email}">{data.site.email}</a>.
	</p>

	{#if data.students.length > 0}
		<h2>Current research</h2>
		<div class="people-strip">
			{#each data.students as member}
				<article class="person-card">
					{#if member.photo}
						<img class="person-photo" src={photoSrc(member.photo)} alt={member.name} />
					{:else}
						<div class="person-fallback" aria-hidden="true">{member.name.slice(0, 1)}</div>
					{/if}
					<div>
						<h3><a href="{base}/team/">{member.name}</a></h3>
						{#if member.research}<p class="person-meta">{member.research}</p>{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}

	{#if data.alumni.length > 0}
		<h2>Completed theses</h2>
		<div class="people-strip">
			{#each data.alumni as member}
				<article class="person-card no-photo">
					<div>
						<h3>{member.name}</h3>
						{#if member.year}<p class="person-role">Graduated {member.year}</p>{/if}
						{#if member.research}<p class="person-meta">{member.research}</p>{/if}
						{#if member.thesis}
							<p class="person-meta">
								<a href={member.thesis} target="_blank" rel="noopener">Thesis report</a>
							</p>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</article>
