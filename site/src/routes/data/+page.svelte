<script>
  import { asset, resolve } from '$app/paths';
  import { dataset, dataPolicy } from '$lib/data/datasets.js';
  import { site } from '$lib/data/site.js';
  import { reveal } from '$lib/actions/reveal.js';
  import SectionHead from '$lib/components/SectionHead.svelte';
</script>

<svelte:head>
  <title>Data · Transportation Behavior Lab</title>
  <meta
    name="description"
    content="Open data from the Transportation Behavior Lab: walk-access isochrones to urban rail in Bangkok, station exits, district boundaries and a 16:9 poster."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Open data</p>
  <h1>Data and tools</h1>
  <p class="lede">
    Research data is shared when privacy and project agreements allow. Everything published here
    ships with the context needed to reuse it.
  </p>
</section>

<section class="section">
  <div class="wrap dataset">
    <div class="dataset__figure" use:reveal>
      <img
        src={asset(dataset.poster)}
        width="1920"
        height="1080"
        alt="Poster map of Bangkok walk access to urban rail: white under 5 minutes, gold 5 to 10, orange 10 to 15, red beyond 15 at 4.0 km/h."
        decoding="async"
      />
    </div>
    <div class="dataset__body">
      <h2>{dataset.title}</h2>
      <p>{dataset.summary}</p>
      <p class="cite">{dataset.citation}</p>
      <div class="actions">
        <a class="btn btn--primary" href={resolve('/access/')}>Open the interactive map</a>
        <a class="btn btn--outline" href="mailto:{site.contact.email}?subject=Data%20access%20request">
          Ask about data access
        </a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Files" />
    <!-- The wrapper carries a tabindex on purpose: a horizontally scrollable region must be
         reachable by keyboard (WCAG 2.1.1), so it is a focusable, named region. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="table-scroll" role="region" aria-label="Dataset files" tabindex="0">
    <table class="data-table">
      <caption>Walk-access to urban rail, by file</caption>
      <thead>
        <tr>
          <th scope="col">File</th>
          <th scope="col">What it holds</th>
        </tr>
      </thead>
      <tbody>
        {#each dataset.files as file (file.name)}
          <tr>
            <th scope="row" class="fname">{file.name}</th>
            <td>{file.detail}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    </div>
    <p class="aside">
      Geometry is EPSG:4326 GeoJSON. Built from OpenStreetMap, licensed ODbL. The copies bundled
      with this site are simplified to about 55 m for display on the web; full-resolution isochrones
      are available on request. If you are not sure which layer answers your question, write first
      and describe the use.
    </p>
    <ul class="downloads">
      {#each dataset.files.filter((f) => f.name.endsWith('.geojson') || f.name.endsWith('.json')) as file (file.name)}
        <li>
          <a href={asset('/geo/' + file.name)} download={file.name}>{file.name}</a>
          <span>{file.detail}</span>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="How we treat data" />
    <dl class="policy">
      {#each dataPolicy as item (item.term)}
        <div class="policy__row">
          <dt>{item.term}</dt>
          <dd>{item.detail}</dd>
        </div>
      {/each}
    </dl>
    <p class="aside">
      For other datasets held by the lab, write with your name, affiliation, and what you intend
      to use them for.
    </p>
  </div>
</section>

<style>
  .page-head {
    padding-block: clamp(3rem, 6vw, 5rem) 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .dataset {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: clamp(1.75rem, 4vw, 3.25rem);
    align-items: center;
  }

  .dataset__figure img {
    width: 100%;
    border-radius: var(--r-surface);
    border: 1px solid var(--line);
    background: var(--surface);
  }

  .dataset__body h2 {
    margin-bottom: 0.8rem;
  }

  .dataset__body p {
    font-size: 0.97rem;
    color: var(--ink-2);
  }

  .actions {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin-top: var(--space-sm);
  }

  .cite {
    font-size: 0.88rem !important;
    color: var(--muted) !important;
    border-left: 2px solid var(--accent-line);
    padding-left: 0.9rem;
  }

  .fname {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    font-weight: 400;
    color: var(--ink);
    white-space: nowrap;
  }

  .policy {
    margin: 0;
    border-top: 1px solid var(--line);
  }

  .policy__row {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: 1.5rem;
    padding-block: 1.05rem;
    border-bottom: 1px solid var(--line);
  }

  .policy dt {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    padding-top: 0.2rem;
  }

  .policy dd {
    margin: 0;
    font-size: 0.96rem;
    color: var(--ink-2);
    max-width: 70ch;
  }

  .aside {
    margin-top: 1.8rem;
    font-size: 0.94rem;
    color: var(--muted);
    max-width: 68ch;
  }

  .downloads {
    list-style: none;
    margin: var(--space-lg) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 var(--space-xl);
    border-top: 1px solid var(--line);
  }

  .downloads li {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding-block: var(--space-sm);
    border-bottom: 1px solid var(--line);
  }

  .downloads a {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.04em;
  }

  .downloads span {
    font-size: var(--fs-caption);
    color: var(--muted);
  }

  @media (max-width: 700px) {
    .downloads {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .dataset {
      grid-template-columns: 1fr;
    }

    .policy__row {
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }
  }
</style>
