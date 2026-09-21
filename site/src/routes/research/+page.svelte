<script>
  import { asset, resolve } from '$app/paths';
  import { labWork, site } from '$lib/data/site.js';
  import { researchNotes } from '$lib/data/news.js';
  import {
    researchIntro,
    facultyInterests,
    walkAccessFeature,
    walkAccessMethod,
    ptaNote
  } from '$lib/data/research.js';
  import { reveal } from '$lib/actions/reveal.js';
  import SectionHead from '$lib/components/SectionHead.svelte';
</script>

<svelte:head>
  <title>Research · TBRG</title>
  <meta
    name="description"
    content="How movement becomes evidence: travel behavior surveys and analysis, transportation engineering, planning, and first-mile walk access to urban rail in Bangkok."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">{researchIntro.kicker}</p>
  <h1>How movement becomes evidence</h1>
  <p class="lede">{researchIntro.lede}</p>
</section>

<section class="section">
  <div class="wrap two-col">
    <div>
      <h2>Lines of work</h2>
      <ul class="lines">
        {#each labWork as line (line.id)}
          <li>
            <h3>{line.title}</h3>
            <p>{line.summary}</p>
          </li>
        {/each}
      </ul>
    </div>
    <figure class="fig" use:reveal>
      <img
        src={asset('/media/research-venn.png')}
        width="975"
        height="742"
        alt="Diagram of the group's working vocabulary, showing where transportation engineering, travel behavior analysis, and transportation planning overlap."
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        Working vocabulary for the group. Not every project uses every method in the diagram.
      </figcaption>
    </figure>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead
      title="How the walk-access layers are built"
      action={{ label: 'Open the map', href: '/access/' }}
    />
    <dl class="deflist">
      {#each walkAccessMethod as item (item.term)}
        <div class="deflist__row">
          <dt>{item.term}</dt>
          <dd>{item.detail}</dd>
        </div>
      {/each}
    </dl>
    <p class="aside">{ptaNote}</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="faculty-band">
      <div>
        <h2>Faculty research</h2>
        <p>
          From the department staff page for Asst. Prof. Pongsun Bunditsakulchai, the standing
          research interests behind the group's teaching and supervision.
        </p>
      </div>
      <ul class="interests">
        {#each facultyInterests as interest (interest)}
          <li>{interest}</li>
        {/each}
      </ul>
    </div>
    <p class="aside">
      Published papers also cover mass-transit ridership and land use in Bangkok, electric
      vehicle adoption, car-sharing scenarios, and related economic work. See
      <a href={resolve('/publications/')}>publications</a> or
      <a href={site.contact.scholar} target="_blank" rel="noopener noreferrer">Google Scholar</a>.
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Notes" action={{ label: 'All news and notes', href: '/news/' }} />
    <ol class="notes">
      {#each researchNotes as note (note.slug)}
        <li>
          <time datetime={note.date}>{note.display}</time>
          <div>
            <h3><a href={resolve(`/notes/${note.slug}/`)}>{note.title}</a></h3>
            <p>{note.summary}</p>
          </div>
        </li>
      {/each}
    </ol>
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

  .page-head h1 {
    max-width: 24ch;
  }

  .two-col {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    gap: clamp(2rem, 5vw, 4rem);
    align-items: start;
  }

  .lines {
    list-style: none;
    margin: 1.5rem 0 0;
    padding: 0;
  }

  .lines li {
    padding-block: 1.2rem;
    border-top: 1px solid var(--line);
  }

  .lines h3 {
    margin-bottom: 0.35rem;
  }

  .lines p {
    font-size: 0.95rem;
    color: var(--muted);
    margin: 0;
  }

  .fig {
    margin: 0;
  }

  .fig img {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    background: var(--surface);
  }

  .fig figcaption {
    font-size: 0.85rem;
    color: var(--muted);
    margin-top: 0.7rem;
  }

  .deflist {
    margin: 0;
    border-top: 1px solid var(--line);
  }

  .deflist__row {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: 1.5rem;
    padding-block: 1.1rem;
    border-bottom: 1px solid var(--line);
  }

  .deflist dt {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    padding-top: 0.2rem;
  }

  .deflist dd {
    margin: 0;
    font-size: 0.96rem;
    color: var(--ink-2);
    max-width: 72ch;
  }

  .faculty-band {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(1.75rem, 4vw, 3.5rem);
    align-items: start;
  }

  .faculty-band h2 {
    margin-bottom: 0.7rem;
  }

  .faculty-band p {
    color: var(--muted);
    font-size: 0.96rem;
  }

  .interests {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .interests li {
    padding-block: 0.85rem;
    border-bottom: 1px solid var(--line);
    font-size: 0.98rem;
    color: var(--ink-2);
  }

  .aside {
    margin-top: 2rem;
    font-size: 0.95rem;
    color: var(--muted);
    max-width: 68ch;
  }

  .notes {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .notes li {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: 1.5rem;
    padding-block: 1.4rem;
    border-bottom: 1px solid var(--line);
  }

  .notes time {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    color: var(--muted);
    padding-top: 0.25rem;
  }

  .notes h3 {
    font-size: 1.08rem;
    margin-bottom: 0.35rem;
  }

  .notes p {
    font-size: 0.95rem;
    color: var(--muted);
    margin: 0;
    max-width: 68ch;
  }

  @media (max-width: 900px) {
    .two-col,
    .faculty-band {
      grid-template-columns: 1fr;
    }

    .deflist__row,
    .notes li {
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }
  }
</style>
