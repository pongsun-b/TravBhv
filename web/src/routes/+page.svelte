<script lang="ts">
	import { base } from '$app/paths';

	// Port of `_pages/home.html` (+ `_includes/home-people.html` and
	// `_includes/news.html`) on the `homelay` wrapper (`<div class="home wrap">`).
	let { data } = $props();

	function photoSrc(photo: string): string {
		return photo.includes('/') ? `${base}${photo}` : `${base}/images/teampic/${photo}`;
	}
</script>

<svelte:head>
	<title>Travel Behavior Research Group | Research on travel behavior, mobility systems, and transportation planning in Bangkok and beyond.</title>
	<meta
		name="description"
		content="The Travel Behavior Research Group studies how people move through Bangkok and what those choices mean for transport systems, planning, and policy."
	/>
</svelte:head>

<div class="home wrap">
	<section class="hero">
		<p class="page-kicker">Travel Behavior Research Group · Bangkok</p>
		<h1>Bangkok moves by a million small decisions.</h1>
		<p class="lede">
			TBRG studies how people choose to travel, and what those choices mean for the city and the
			systems that serve it.
		</p>
		<p class="hero-meta">Department of Civil Engineering · Chulalongkorn University</p>
	</section>

	<figure class="access-feature">
		<a href="{base}/access/">
			<img
				src="{base}/access-data/access-16x9.jpg"
				width="1920"
				height="1080"
				alt="Map of Bangkok walk access to urban rail at a typical 4.0 km/h: white under 5 minutes, gold 5 to 10, orange 10 to 15, red beyond 15."
				decoding="async"
				fetchpriority="high"
			/>
		</a>
		<figcaption>
			<a href="{base}/access/">Walk access to urban rail</a>
			— 5, 10 and 15 minutes from a station exit at a typical 4.0 km/h walk. Open the interactive map.
		</figcaption>
	</figure>

	<p>
		The group is based in the
		<a href="https://civil.eng.chula.ac.th/web/">Department of Civil Engineering</a> at
		<a href="https://www.chula.ac.th/">Chulalongkorn University</a>. Work sits at the overlap of
		engineering, surveys, and planning: why a trip is made, how it is made, and what the network
		should do next.
	</p>

	<div class="section-head">
		<h2>Lines of work</h2>
	</div>
	<div class="pillars">
		<article class="pillar">
			<span class="pillar-num">01</span>
			<h3>Transportation Engineering</h3>
			<p>
				Design and operation of systems that move people and goods, with safety and efficiency as
				the baseline.
			</p>
		</article>
		<article class="pillar">
			<span class="pillar-num">02</span>
			<h3>Travel Behavior Surveys &amp; Analysis</h3>
			<p>How people travel: mode, time, purpose, and what those patterns imply for policy.</p>
		</article>
		<article class="pillar">
			<span class="pillar-num">03</span>
			<h3>Transportation Planning</h3>
			<p>Current networks, future demand, and projects that improve access.</p>
		</article>
		<article class="pillar">
			<span class="pillar-num">04</span>
			<h3>Walk access</h3>
			<p>
				How far is the walk to urban rail?
				<a href="{base}/access/">5, 10 and 15 minutes from a station exit across Bangkok</a>.
			</p>
		</article>
	</div>

	<div class="section-head">
		<h2>People</h2>
		<a href="{base}/team/">Directory</a>
	</div>
	<div class="people-strip">
		{#each data.faculty as member}
			<article class="person-card">
				{#if member.photo}
					<img class="person-photo" src={photoSrc(member.photo)} alt={member.name} />
				{:else}
					<div class="person-fallback" aria-hidden="true">{member.name.slice(0, 1)}</div>
				{/if}
				<div>
					<h3>{member.name}</h3>
					<p class="person-role">{member.info}</p>
					{#if member.email}
						<p class="person-meta"><a href="mailto:{member.email}">{member.email}</a></p>
					{/if}
				</div>
			</article>
		{/each}
	</div>

	<section class="news-block" aria-labelledby="news-heading">
		<div class="section-head">
			<h2 id="news-heading">News</h2>
			<a href="{base}/news/">All news</a>
		</div>
		<ol class="news-list">
			{#each data.news as article}
				<li class="news-item">
					<time class="news-date" datetime={article.iso}>{article.date}</time>
					{#if article.postPath}
						<p class="news-headline"><a href="{base}{article.postPath}">{article.headline}</a></p>
					{:else}
						<p class="news-headline">{article.headline}</p>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
</div>
