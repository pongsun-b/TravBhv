<script>
  import { notes } from '$lib/data/notes.js';
  import { resolve } from '$app/paths';
  import SectionHead from '$lib/components/SectionHead.svelte';
</script>

<svelte:head>
  <title>Notes · TBRG</title>
  <meta
    name="description"
    content="Writing from the lab: walk access to urban rail, primal and dual access, and how PTAI differs from the walk-access map."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Writing</p>
  <h1>Notes</h1>
  <p class="lede">
    Longer pieces on method and interpretation, carried over from the group's previous site. Written
    for someone who wants the reasoning, not just the map.
  </p>
</section>

<section class="section section--flush">
  <div class="wrap">
    <SectionHead title="All notes" />
    <ol class="feed">
      {#each notes as note (note.slug)}
        <li>
          <time datetime={note.date}>{note.display}</time>
          <div>
            <h2><a href={resolve(`/notes/${note.slug}/`)}>{note.title}</a></h2>
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
    gap: var(--space-md);
    align-items: flex-start;
  }

  .feed {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .feed li {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: 1.5rem;
    padding-block: 1.6rem;
    border-bottom: 1px solid var(--line);
  }

  .feed time {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.06em;
    color: var(--muted);
    padding-top: 0.35rem;
  }

  .feed h2 {
    font-size: var(--fs-h3);
    line-height: 1.25;
    max-width: 40ch;
    margin: 0;
  }

  .feed h2 a {
    text-decoration: none;
    color: var(--ink);
  }

  .feed h2 a:hover {
    color: var(--accent-ink);
    text-decoration: underline;
  }

  .feed p {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin: 0.55rem 0 0;
    max-width: 68ch;
  }

  @media (max-width: 820px) {
    .feed li {
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }

    .feed time {
      padding-top: 0;
    }
  }
</style>
