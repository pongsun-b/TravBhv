<script>
  import { resolve } from '$app/paths';
  import AccessMap from '$lib/components/AccessMap.svelte';
  import SectionHead from '$lib/components/SectionHead.svelte';
  import { walkAccessMethod, ptaNote } from '$lib/data/research.js';
  import { accessMeta, dataset } from '$lib/data/datasets.js';

  const stats = [
    { value: accessMeta.stations, label: 'urban-rail stations' },
    { value: accessMeta.exits, label: 'mapped station exits' },
    { value: accessMeta.feeders, label: 'boat piers' },
    { value: accessMeta.study.split(' plus ')[0], label: 'districts in the study area', wide: true }
  ];
</script>

<svelte:head>
  <title>Walk access to urban rail · ALIS</title>
  <meta
    name="description"
    content="Interactive map of walk access to urban rail in Bangkok: 5, 10 and 15 minutes from a station exit at 3.6, 4.0 and 4.5 km/h, built on the OpenStreetMap walk graph."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Interactive map</p>
  <h1>How far is the walk to urban rail?</h1>
  <p class="lede">
    Network isochrones from station exits on the OpenStreetMap walk graph: 5, 10 and 15 minutes at a
    typical 4.0 km/h, with river and canal boat piers as an extra layer. Drag to pan, scroll to zoom,
    and switch the walking speed to see how quickly reach shrinks.
  </p>
</section>

<section class="section section--flush">
  <div class="wrap">
    <AccessMap />
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="stats">
      {#each stats as stat (stat.label)}
        <div class="stat" class:stat--wide={stat.wide}>
          <span class="stat__value">{stat.value}</span>
          <span class="stat__label">{stat.label}</span>
        </div>
      {/each}
      <div class="stat">
        <span class="stat__value">{accessMeta.walkSpeedKmh.toFixed(1)}</span>
        <span class="stat__label">km/h default walking speed</span>
      </div>
    </div>
    <p class="note">
      OpenStreetMap last pulled {accessMeta.osmPulled}. Layers are {accessMeta.crs}. Study area:
      {accessMeta.study}. Lines: {accessMeta.lines}.
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="How it is built" action={{ label: 'The dataset', href: '/data/' }} />
    <dl class="method">
      {#each walkAccessMethod as item (item.term)}
        <div>
          <dt>{item.term}</dt>
          <dd>{item.detail}</dd>
        </div>
      {/each}
    </dl>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="related">
      <h2>Related lab work</h2>
      <p>{ptaNote}</p>
      <p class="note">
        Cite the map as: {dataset.citation}
      </p>
      <div class="related__actions">
        <a class="btn btn--outline" href={resolve('/data/')}>Download the layers</a>
        <a class="btn btn--ghost" href={resolve('/research/')}>Read the research</a>
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
    font-size: var(--fs-display);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
    max-width: 20ch;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-lg);
    border-top: 1px solid var(--line);
    padding-top: var(--space-lg);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .stat__value {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2.1rem);
    font-weight: 500;
    color: var(--ink);
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }

  .stat--wide .stat__value {
    font-size: clamp(1.1rem, 2vw, 1.35rem);
  }

  .stat__label {
    font-size: var(--fs-caption);
    color: var(--muted);
  }

  .note {
    font-size: var(--fs-xs);
    color: var(--muted);
    margin-top: var(--space-lg);
    max-width: 82ch;
  }

  .method {
    margin: 0;
    border-top: 1px solid var(--line);
  }

  .method > div {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: var(--space-lg);
    padding-block: var(--space-md);
    border-bottom: 1px solid var(--line);
  }

  .method dt {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    padding-top: 0.2rem;
  }

  .method dd {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--ink-2);
    max-width: 74ch;
  }

  .related {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    padding: var(--space-xl);
    box-shadow: var(--shadow-1);
    max-width: 82ch;
  }

  .related h2 {
    margin-bottom: var(--space-md);
  }

  .related p {
    font-size: var(--fs-sm);
    color: var(--ink-2);
  }

  .related__actions {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin-top: var(--space-lg);
  }

  @media (max-width: 900px) {
    .stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .method > div {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }
</style>
