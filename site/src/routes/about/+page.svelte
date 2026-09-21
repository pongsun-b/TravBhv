<script>
  import { resolve } from '$app/paths';
  import { site, labWork } from '$lib/data/site.js';
  import { researchIntro, facultyInterests } from '$lib/data/research.js';
  import SectionHead from '$lib/components/SectionHead.svelte';

  const principles = [
    {
      term: 'Evidence before opinion',
      detail:
        'Every claim on this site traces to a survey, a network model, or a published paper. Where a number is illustrative, we say so on the page.'
    },
    {
      term: 'The walk is part of the trip',
      detail:
        'A journey starts before the train. First-mile access decides whether a service is usable, so we measure it from the station exit outward.'
    },
    {
      term: 'Publish what can be reused',
      detail:
        'Data is shared with documentation and a citation whenever privacy and agreements allow, so others can build on the work.'
    },
    {
      term: 'Explain the method in public',
      detail:
        'Method notes, limits and known gaps are written for a reader who is not a modeller. Understanding should not require a subscription.'
    }
  ];

  const timeline = [
    { year: '2023', text: 'The group forms within Transportation Engineering at Chulalongkorn University.' },
    { year: '2024', text: 'Highway safety collaboration with HTOC and KMITL.' },
    { year: '2026', text: 'Walk-access isochrones to urban rail published as open data and an interactive map.' }
  ];
</script>

<svelte:head>
  <title>About · TBRG</title>
  <meta
    name="description"
    content="TBRG is the Travel Behavior Research Group in the Department of Civil Engineering at Chulalongkorn University. What the lab studies, how it works, and what it stands for."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">About the lab</p>
  <h1>We study the decisions inside a journey.</h1>
  <p class="lede">
    TBRG is the Travel Behavior Research Group, based in the {site.affiliation.dept} at {site.affiliation
      .university}. Work runs from travel decisions outward: surveys and models of how people move,
    then engineering and planning that can act on that evidence.
  </p>
</section>

<section class="section section--flush">
  <div class="wrap">
    <div class="mission">
      <div>
        <h2>Why the lab exists</h2>
        <p>
          A city's transport system is the sum of a million small choices made by people who are
          tired, in a hurry, or standing in the rain. Those choices are measurable, and once they
          are measured they can be designed for.
        </p>
        <p>
          The lab sits close to that seam. We run travel-behavior surveys and analyse mobile and
          GPS traces, build network models of how far people can actually reach, and translate the
          results into something a planner or a policy team can use.
        </p>
      </div>
      <dl class="facts">
        <div>
          <dt>Founded</dt>
          <dd>2023</dd>
        </div>
        <div>
          <dt>Division</dt>
          <dd>Transportation Engineering</dd>
        </div>
        <div>
          <dt>Faculty</dt>
          <dd>1</dd>
        </div>
        <div>
          <dt>Researchers</dt>
          <dd>8 current, 6 alumni</dd>
        </div>
        <div>
          <dt>Focus city</dt>
          <dd>Bangkok and the Bangkok Metropolitan Region</dd>
        </div>
        <div>
          <dt>Open data</dt>
          <dd>Walk-access isochrones to urban rail</dd>
        </div>
      </dl>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="What we work on" action={{ label: 'All research', href: '/research/' }} />
    <ul class="lines">
      {#each labWork as line (line.id)}
        <li>
          <h3>{line.title}</h3>
          <p>{line.summary}</p>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="How we work" />
    <dl class="principles">
      {#each principles as item (item.term)}
        <div>
          <dt>{item.term}</dt>
          <dd>{item.detail}</dd>
        </div>
      {/each}
    </dl>
  </div>
</section>

<section class="section">
  <div class="wrap two-col">
    <div>
      <h2>Where we sit</h2>
      <p>{researchIntro.lede}</p>
      <p>
        The group works in the Transportation Engineering division, alongside the department's
        wider research on logistics, economics and sustainable urban development.
      </p>
      <p>
        Standing research interests across the division:
      </p>
      <ul class="interests">
        {#each facultyInterests as interest (interest)}
          <li>{interest}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h2>Milestones</h2>
      <ol class="timeline">
        {#each timeline as item (item.year)}
          <li>
            <span class="timeline__year">{item.year}</span>
            <span class="timeline__text">{item.text}</span>
          </li>
        {/each}
      </ol>
      <div class="cta">
        <h3>Work with the lab</h3>
        <p>
          Collaboration, data access and graduate supervision enquiries all start in one place.
        </p>
        <a class="btn btn--primary" href={resolve('/contact/')}>Contact and join</a>
      </div>
    </div>
  </div>
</section>

<style>
  .page-head {
    padding-block: clamp(3rem, 6vw, 5rem) var(--space-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .page-head h1 {
    max-width: 22ch;
    font-size: var(--fs-display);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }

  .mission {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: var(--space-2xl) var(--space-3xl);
    align-items: start;
  }

  .mission h2 {
    margin-bottom: var(--space-md);
  }

  .facts {
    margin: 0;
    border-top: 1px solid var(--line);
  }

  .facts > div {
    display: grid;
    grid-template-columns: 8.5rem minmax(0, 1fr);
    gap: var(--space-md);
    padding-block: 0.7rem;
    border-bottom: 1px solid var(--line);
  }

  .facts dt {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    padding-top: 0.15rem;
  }

  .facts dd {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--ink);
  }

  .lines {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 var(--space-2xl);
  }

  .lines li {
    padding-block: var(--space-lg);
    border-bottom: 1px solid var(--line);
  }

  .lines h3 {
    margin-bottom: 0.35rem;
    font-size: var(--fs-h4);
    letter-spacing: 0;
  }

  .lines p {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin: 0;
  }

  .principles {
    margin: 0;
    border-top: 1px solid var(--line);
  }

  .principles > div {
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    gap: var(--space-lg);
    padding-block: var(--space-lg);
    border-bottom: 1px solid var(--line);
  }

  .principles dt {
    font-family: var(--font-display);
    font-size: var(--fs-h4);
    font-weight: 600;
    color: var(--ink);
  }

  .principles dd {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--ink-2);
    max-width: 68ch;
  }

  .two-col {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-2xl) var(--space-3xl);
    align-items: start;
  }

  .two-col h2 {
    margin-bottom: var(--space-md);
  }

  .interests {
    list-style: none;
    margin: var(--space-md) 0 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .interests li {
    padding-block: 0.6rem;
    border-bottom: 1px solid var(--line);
    font-size: var(--fs-sm);
    color: var(--ink-2);
  }

  .timeline {
    list-style: none;
    margin: 0 0 var(--space-xl);
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .timeline li {
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr);
    gap: var(--space-md);
    padding-block: 0.85rem;
    border-bottom: 1px solid var(--line);
  }

  .timeline__year {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.08em;
    color: var(--accent-ink);
    padding-top: 0.2rem;
  }

  .timeline__text {
    font-size: var(--fs-sm);
    color: var(--ink-2);
  }

  .cta {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    padding: var(--space-lg);
    box-shadow: var(--shadow-1);
  }

  .cta h3 {
    margin-bottom: 0.4rem;
  }

  .cta p {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin-bottom: var(--space-md);
  }

  @media (max-width: 900px) {
    .mission,
    .two-col,
    .lines {
      grid-template-columns: 1fr;
    }

    .principles > div {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }
</style>
