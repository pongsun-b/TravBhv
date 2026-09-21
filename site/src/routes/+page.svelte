<script>
  import { resolve, asset } from '$app/paths';
  import { site, labWork } from '$lib/data/site.js';
  import { researchNotes } from '$lib/data/news.js';
  import { faculty, students } from '$lib/data/people.js';
  import { featured } from '$lib/data/projects.js';
  import { publications } from '$lib/data/publications.js';
  import { accessMeta } from '$lib/data/datasets.js';
  import SectionHead from '$lib/components/SectionHead.svelte';
  import { reveal } from '$lib/actions/reveal.js';

  let walk = featured[0];
  let notes = researchNotes.slice(0, 3);
  let pubTotal = publications.reduce((n, g) => n + g.items.length, 0);

  let latest = publications
    .flatMap((g) => g.items)
    .filter((p) => p.href)
    .slice(0, 3);

  const stats = [
    { value: accessMeta.stations, label: 'urban-rail stations mapped' },
    { value: students.length, label: 'graduate researchers' },
    { value: pubTotal, label: 'papers and chapters' },
    { value: '3.6–4.5', label: 'km/h walk speeds modelled' }
  ];

  const tools = [
    {
      title: 'Walk access to urban rail',
      body: 'Pan and zoom the isochrones, change the walking speed, and see how fast reach collapses beyond 15 minutes.',
      href: '/access/',
      cta: 'Open the access map'
    },
    {
      title: 'Mode-choice simulator',
      body: 'Set distance, first-mile walk, weather and value of time, and watch the share move between rail, bus, motorcycle taxi, car and walking.',
      href: '/simulator/',
      cta: 'Open the simulator'
    }
  ];
</script>

<svelte:head>
  <title>ALIS · Transportation Behavior Lab</title>
  <meta
    name="description"
    content="ALIS studies how people move through Bangkok and what those choices mean for transport systems, planning, and policy."
  />
</svelte:head>

<section class="hero">
  <div class="wrap">
    <p class="meta">{site.fullName} · Department of Civil Engineering, Chulalongkorn University</p>
    <h1>Bangkok moves by a million small decisions.</h1>

    <div class="hero__split">
      <div class="hero__text">
        <p class="lede">
          We study how people choose to travel, and what those choices mean for the city and the
          systems that serve it.
        </p>
        <div class="hero__actions">
          <a class="btn btn--primary" href={resolve('/research/')}>Explore the research</a>
          <a class="btn btn--outline" href={resolve('/access/')}>Open the access map</a>
        </div>
      </div>

      <figure class="hero__figure" use:reveal>
        <img
          src={asset(walk.image)}
          width="1920"
          height="1080"
          alt={walk.imageAlt}
          fetchpriority="high"
          decoding="async"
        />
        <figcaption>
          Walk access to urban rail at 4.0 km/h: 5, 10 and 15 minutes from a station exit.
          <a href={resolve('/access/')}>Open the interactive version</a>.
        </figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <dl class="stats">
      {#each stats as stat (stat.label)}
        <div>
          <dt>{stat.value}</dt>
          <dd>{stat.label}</dd>
        </div>
      {/each}
    </dl>
  </div>
</section>

<section class="section section--flush">
  <div class="wrap">
    <SectionHead title="Lines of work" action={{ label: 'All research', href: '/research/' }} />
    <div class="pillars">
      {#each labWork as pillar, i (pillar.id)}
        <article class="pillar" use:reveal={i * 70}>
          <h3>
            {#if pillar.href}
              <a href={resolve(pillar.href)}>{pillar.title}</a>
            {:else}
              {pillar.title}
            {/if}
          </h3>
          <p>{pillar.summary}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Two things you can move yourself" />
    <div class="tools">
      {#each tools as tool, i (tool.href)}
        <article class="tool" use:reveal={i * 90}>
          <h3>{tool.title}</h3>
          <p>{tool.body}</p>
          <a class="tool__cta" href={resolve(tool.href)}>
            {tool.cta}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13" /><path d="M13 6l6 6-6 6" /></svg>
          </a>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Latest papers" action={{ label: 'All publications', href: '/publications/' }} />
    <ul class="papers">
      {#each latest as paper, i (paper.title)}
        <li use:reveal={i * 70}>
          <h3>{paper.title}</h3>
          <p class="papers__meta">{paper.authors}</p>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="People" action={{ label: 'Full directory', href: '/people/' }} />
    <div class="people">
      <article class="person" use:reveal>
        <img
          src={asset(faculty.photo)}
          width="512"
          height="512"
          alt={faculty.name}
          loading="lazy"
          decoding="async"
        />
        <div>
          <h3>{faculty.name}</h3>
          <p class="person__role">{faculty.role}</p>
          <p class="person__meta">
            <a href="mailto:{faculty.email}">{faculty.email}</a>
          </p>
        </div>
      </article>
      <div class="people__note">
        <p>
          Eight current graduate researchers and six completed theses sit behind the work on this
          site, from mobile-data origin-destination estimation to bus service quality and flood
          exposure on the transit network.
        </p>
        <a class="btn btn--outline" href={resolve('/people/')}>Meet the group</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="News and notes" action={{ label: 'All news', href: '/news/' }} />
    <ol class="news">
      {#each notes as note, i (note.title)}
        <li use:reveal={i * 70}>
          <time datetime={note.date}>{note.display}</time>
          <div>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </div>
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .hero {
    padding-block: clamp(2.75rem, 6vw, 4.5rem) clamp(2.5rem, 5vw, 4rem);
  }

  .hero h1 {
    max-width: 20ch;
    font-size: var(--fs-display);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
    margin-top: var(--space-md);
  }

  .hero__split {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: clamp(1.75rem, 4vw, 3.5rem);
    align-items: end;
    margin-top: clamp(1.5rem, 3vw, 2.5rem);
  }

  .hero__text .lede {
    margin-bottom: var(--space-lg);
  }

  .hero__actions {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    align-items: center;
  }

  .hero__figure {
    margin: 0;
  }

  .hero__figure img {
    width: 100%;
    border-radius: var(--r-surface);
    border: 1px solid var(--line);
    background: var(--surface);
    box-shadow: var(--shadow-2);
  }

  .hero__figure figcaption {
    font-size: var(--fs-xs);
    color: var(--muted);
    line-height: 1.55;
    margin: 0.7rem 0 0;
    max-width: 62ch;
  }

  .band {
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: var(--surface);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-lg);
    margin: 0;
    padding-block: var(--space-lg);
  }

  .stats dt {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 500;
    color: var(--ink);
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }

  .stats dd {
    margin: 0.25rem 0 0;
    font-size: var(--fs-caption);
    color: var(--muted);
  }

  .pillars {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    border-top: 1px solid var(--line);
  }

  .pillar {
    padding: var(--space-lg) var(--space-xl) var(--space-lg) 0;
    border-bottom: 1px solid var(--line);
  }

  .pillar:nth-child(even) {
    padding-left: var(--space-xl);
    border-left: 1px solid var(--line);
  }

  .pillar h3 {
    margin-bottom: var(--space-xs);
    font-size: var(--fs-h3);
  }

  .pillar h3 a {
    text-decoration: none;
    color: var(--ink);
  }

  .pillar h3 a:hover {
    color: var(--accent-ink);
  }

  .pillar p {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin: 0;
  }

  .tools {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-lg);
  }

  .tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    padding: var(--space-xl);
    box-shadow: var(--shadow-1);
    transition: box-shadow var(--dur-base) var(--ease), transform var(--dur-base) var(--ease);
  }

  .tool:hover {
    box-shadow: var(--shadow-2);
    transform: translateY(-2px);
  }

  .tool h3 {
    margin: 0;
  }

  .tool p {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin: 0;
    flex: 1;
  }

  .tool__cta {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: var(--fs-sm);
    font-weight: 500;
    text-decoration: none;
    color: var(--ink);
    align-self: flex-start;
  }

  .tool__cta :global(svg) {
    transition: transform var(--dur-base) var(--ease);
  }

  .tool__cta:hover :global(svg) {
    transform: translateX(3px);
  }

  .papers {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .papers li {
    padding-block: var(--space-lg);
    border-bottom: 1px solid var(--line);
    max-width: 84ch;
  }

  .papers h3 {
    font-size: 1.05rem;
    margin-bottom: 0.35rem;
  }

  .papers__meta {
    font-size: var(--fs-caption);
    color: var(--muted);
    margin: 0;
  }

  .people {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-xl) var(--space-3xl);
    align-items: center;
  }

  .person {
    display: flex;
    gap: var(--space-md);
    align-items: center;
  }

  .person img {
    width: 84px;
    height: 84px;
    object-fit: cover;
    border-radius: var(--r-control);
    border: 1px solid var(--line);
    flex: 0 0 auto;
  }

  .person h3 {
    font-size: var(--fs-h4);
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .person__role {
    font-size: var(--fs-sm);
    color: var(--ink-2);
    margin: 0.25rem 0 0.15rem;
  }

  .person__meta {
    font-size: var(--fs-caption);
    margin: 0;
  }

  .people__note p {
    font-size: var(--fs-sm);
    color: var(--ink-2);
    margin-bottom: var(--space-md);
  }

  .news {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .news li {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: var(--space-lg);
    padding-block: var(--space-lg);
    border-bottom: 1px solid var(--line);
  }

  .news time {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.06em;
    color: var(--muted);
    padding-top: 0.25rem;
  }

  .news h3 {
    font-size: 1.05rem;
    margin-bottom: 0.35rem;
  }

  .news p {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin: 0;
  }

  @media (max-width: 940px) {
    .hero__split,
    .people,
    .tools {
      grid-template-columns: 1fr;
    }

    .hero__split {
      align-items: start;
    }

    .pillars {
      grid-template-columns: 1fr;
    }

    .pillar:nth-child(even) {
      padding-left: 0;
      border-left: 0;
    }

    .stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .news li {
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }
  }
</style>
