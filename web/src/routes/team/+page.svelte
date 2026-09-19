<script lang="ts">
	import { base } from '$app/paths';

	// Port of `_pages/team.html` on the `gridlay` wrapper
	// (`<article class="page wrap wide">`).
	let { data } = $props();

	function photoSrc(photo: string): string {
		return photo.includes('/') ? `${base}${photo}` : `${base}/images/teampic/${photo}`;
	}
</script>

<svelte:head>
	<title>People | Travel Behavior Research Group</title>
	<meta
		name="description"
		content="Faculty and researchers of the Travel Behavior Research Group."
	/>
</svelte:head>

<article class="page wrap wide">
	<p class="page-kicker">People</p>
	<h1>The group</h1>
	<p>The group is based in the Department of Civil Engineering at Chulalongkorn University.</p>

	<h2>Faculty</h2>
	{#if data.faculty.length === 0}
		<p class="empty-note">Faculty listings will appear here when they are added to the group data files.</p>
	{/if}
	{#each data.faculty as member}
		<div class="faculty-block">
			<article class="person-row">
				{#if member.photo}
					<img class="person-photo" src={photoSrc(member.photo)} alt={member.name} />
				{:else}
					<div class="person-fallback" aria-hidden="true">{member.name.slice(0, 1)}</div>
				{/if}
				<div>
					<h3>{member.name}</h3>
					{#if member.thai}<p class="person-role">{member.thai}</p>{/if}
					<p class="person-role">{member.info}</p>
					{#if member.email}
						<p class="person-meta">Email: <a href="mailto:{member.email}">{member.email}</a></p>
					{/if}
					{#if member.office}<p class="person-meta">Office: {member.office}</p>{/if}
					{#if member.phone}<p class="person-meta">Phone: {member.phone}</p>{/if}
					{#if member.scholar}
						<p class="person-meta">
							<a href={member.scholar} target="_blank" rel="noopener">Google Scholar</a>
						</p>
					{:else if member.email === data.site.email}
						<p class="person-meta">
							<a href={data.site.scholar_url} target="_blank" rel="noopener">Google Scholar</a>
						</p>
					{/if}
					{#if member.researchgate}
						<p class="person-meta">
							<a href={member.researchgate} target="_blank" rel="noopener">ResearchGate</a>
						</p>
					{/if}
					{#if member.department_page}
						<p class="person-meta">
							<a href={member.department_page} target="_blank" rel="noopener">Department profile</a>
						</p>
					{/if}
					{#if member.bio}<p class="person-bio">{member.bio}</p>{/if}
					{#if member.education}
						<ul class="person-educ">
							{#each member.education as ed}
								<li>{ed}</li>
							{/each}
						</ul>
					{/if}
					{#if member.interests}
						<p class="person-meta">Research: {member.interests.join('; ')}.</p>
					{/if}
				</div>
			</article>
		</div>
	{/each}

	<h2>Students</h2>
	{#if data.students.length === 0}
		<p class="empty-note">Students are listed here as they join the group.</p>
	{:else}
		<div class="people-strip">
			{#each data.students as member}
				<article class="person-card">
					{#if member.photo}
						<img class="person-photo" src={photoSrc(member.photo)} alt={member.name} />
					{:else}
						<div class="person-fallback" aria-hidden="true">{member.name.slice(0, 1)}</div>
					{/if}
					<div>
						<h3>{member.name}</h3>
						{#if member.research}<p class="person-meta">Research: {member.research}</p>{/if}
						{#if member.email}
							<p class="person-meta"><a href="mailto:{member.email}">{member.email}</a></p>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}

	{#if data.alumni.length > 0}
		<h2>Alumni</h2>
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
