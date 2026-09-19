<script lang="ts">
	import { base } from '$app/paths';

	let { data } = $props();

	function photoUrl(filename?: string): string | undefined {
		return filename ? `${base}/images/teampic/${filename}` : undefined;
	}
</script>

<svelte:head>
	<title>Team — Travel Behavior Research Group</title>
</svelte:head>

<h1>Team</h1>

<section>
	<h2>Faculty</h2>
	<ul>
		{#each data.faculty as member}
			<li>
				{#if photoUrl(member.photo)}
					<img src={photoUrl(member.photo)} alt={member.name} width="120" />
				{/if}
				<h3>{member.name}</h3>
				{#if member.info}<p>{member.info}</p>{/if}
				{#if member.email}<p><a href="mailto:{member.email}">{member.email}</a></p>{/if}
			</li>
		{/each}
	</ul>
</section>

<section>
	<h2>Students</h2>
	<ul>
		{#each data.students as member}
			<li>
				{#if photoUrl(member.photo)}
					<img src={photoUrl(member.photo)} alt={member.name} width="120" />
				{/if}
				<h3>{member.name}</h3>
				{#if member.research}<p>{member.research}</p>{/if}
				{#if member.email}<p><a href="mailto:{member.email}">{member.email}</a></p>{/if}
			</li>
		{/each}
	</ul>
</section>

<section>
	<h2>Alumni</h2>
	<ul>
		{#each data.alumni as member}
			<li>
				<h3>{member.name}</h3>
				{#if member.year}<p>Graduated {member.year}</p>{/if}
				{#if member.research}<p>{member.research}</p>{/if}
				{#if member.thesis}
					<p><a href={member.thesis} target="_blank" rel="noopener">Thesis</a></p>
				{/if}
			</li>
		{/each}
	</ul>
</section>
