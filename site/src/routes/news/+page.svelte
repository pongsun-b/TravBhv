<script>
  import { news, researchNotes } from '$lib/data/news.js';
  import { resolve } from '$app/paths';
  import SectionHead from '$lib/components/SectionHead.svelte';
</script>

<svelte:head>
  <title>News · Transportation Behavior Lab</title>
  <meta
    name="description"
    content="Group news and research notes from the Transportation Behavior Lab, including the walk-access map to urban rail and highway safety collaboration."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Group news</p>
  <h1>News</h1>
</section>

<section class="section section--flush">
  <div class="wrap">
    <ol class="feed">
      {#each news as item (item.title)}
        <li>
          <time datetime={item.date}>{item.display}</time>
          <div>
            <h2>
              {#if item.href}
                <a href={resolve(item.href)}>{item.title}</a>
              {:else}
                {item.title}
              {/if}
            </h2>
          </div>
        </li>
      {/each}
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Notes" />
    <ol class="feed">
      {#each researchNotes as note (note.title)}
        <li>
          <time datetime={note.date}>{note.display}</time>
          <div>
            <h2>{note.title}</h2>
            <p>{note.body}</p>
          </div>
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .page-head {
    padding-block: clamp(3rem, 6vw, 5rem) 0;
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
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    color: var(--muted);
    padding-top: 0.35rem;
  }

  .feed h2 {
    font-size: 1.3rem;
    line-height: 1.25;
    max-width: 40ch;
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
    font-size: 0.95rem;
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
