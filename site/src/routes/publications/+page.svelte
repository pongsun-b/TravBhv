<script>
  import { site } from '$lib/data/site.js';
  import { publications } from '$lib/data/publications.js';

  let activeTheme = $state('all');
  let q = $state('');

  const total = publications.reduce((sum, group) => sum + group.items.length, 0);
  const themes = publications.map((g) => g.theme);

  const flat = publications.flatMap((group) =>
    group.items.map((item) => ({ ...item, theme: group.theme }))
  );

  let filtered = $derived.by(() => {
    const needle = q.trim().toLowerCase();
    return flat.filter((item) => {
      if (activeTheme !== 'all' && item.theme !== activeTheme) return false;
      if (!needle) return true;
      return (
        item.title.toLowerCase().includes(needle) ||
        item.authors.toLowerCase().includes(needle) ||
        item.note.toLowerCase().includes(needle)
      );
    });
  });

  let groups = $derived.by(() => {
    const out = [];
    for (const theme of themes) {
      const items = filtered.filter((i) => i.theme === theme);
      if (items.length) out.push({ theme, items });
    }
    return out;
  });

  function reset() {
    activeTheme = 'all';
    q = '';
  }
</script>

<svelte:head>
  <title>Publications · TBRG</title>
  <meta
    name="description"
    content="Papers and book chapters from TBRG on transport, land use and ridership, electric vehicle adoption, environment, energy and the Thai economy."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Papers and chapters</p>
  <h1>Publications</h1>
  <p class="lede">
    {total} selected papers and chapters. For a full and current list, see
    <a href={site.contact.scholar} target="_blank" rel="noopener noreferrer">Google Scholar</a>.
  </p>
</section>

<section class="section section--flush">
  <div class="wrap">
    <div class="filters">
      <div class="chips" role="group" aria-label="Filter by theme">
        <button
          type="button"
          class="chip chip--btn"
          class:is-on={activeTheme === 'all'}
          aria-pressed={activeTheme === 'all'}
          onclick={() => (activeTheme = 'all')}>All themes</button
        >
        {#each themes as theme (theme)}
          <button
            type="button"
            class="chip chip--btn"
            class:is-on={activeTheme === theme}
            aria-pressed={activeTheme === theme}
            onclick={() => (activeTheme = theme)}>{theme}</button
          >
        {/each}
      </div>

      <div class="search">
        <label for="pub-search">Search</label>
        <input
          id="pub-search"
          type="search"
          bind:value={q}
          placeholder="Author, title or topic"
          aria-describedby="pub-count"
        />
      </div>
    </div>

    <p class="count" id="pub-count" role="status" aria-live="polite">
      {filtered.length}
      {filtered.length === 1 ? 'result' : 'results'}
      {#if activeTheme !== 'all'}in {activeTheme}{/if}
      {#if q.trim()}matching “{q.trim()}”{/if}
    </p>

    {#if groups.length === 0}
      <div class="empty">
        <h2>Nothing matches that search.</h2>
        <p>
          Try a shorter term, a different author surname, or clear the filters to see all {total}
          entries.
        </p>
        <button type="button" class="btn btn--outline" onclick={reset}>Clear filters</button>
      </div>
    {:else}
      {#each groups as group (group.theme)}
        <section class="group">
          <h2 class="theme">{group.theme}</h2>
          <ol class="pubs">
            {#each group.items as pub (pub.title)}
              <li>
                <h3>{pub.title}</h3>
                <p class="pubs__authors">{pub.authors}</p>
                <p class="pubs__note">{pub.note}</p>
                {#if pub.href}
                  <a class="pubs__ref" href={pub.href} target="_blank" rel="noopener noreferrer">
                    {pub.ref}
                  </a>
                {:else}
                  <span class="pubs__ref pubs__ref--plain">{pub.ref}</span>
                {/if}
              </li>
            {/each}
          </ol>
        </section>
      {/each}
    {/if}
  </div>
</section>

<style>
  .page-head {
    padding-block: clamp(3rem, 6vw, 5rem) var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .page-head h1 {
    font-size: var(--fs-display);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--line);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .chip--btn {
    cursor: pointer;
    font-family: var(--font-mono);
    transition: border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease),
      background-color var(--dur-fast) var(--ease);
  }

  .chip--btn:hover {
    border-color: var(--line-strong);
    color: var(--ink);
  }

  .chip--btn.is-on {
    color: var(--accent-ink);
    background: var(--accent-soft);
    border-color: var(--accent-line);
  }

  .search {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .search label {
    font-size: var(--fs-caption);
    font-weight: 600;
    color: var(--ink);
  }

  .search input {
    font-family: var(--font-body);
    font-size: var(--fs-sm);
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-control);
    padding: 0.5rem 0.7rem;
    min-width: 15rem;
  }

  .count {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.06em;
    color: var(--muted);
    margin: var(--space-md) 0 var(--space-xl);
  }

  .group {
    margin-bottom: var(--space-2xl);
  }

  .theme {
    font-size: clamp(1.35rem, 2.4vw, 1.8rem);
    margin-bottom: var(--space-md);
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--line-strong);
    max-width: none;
  }

  .pubs {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pubs li {
    padding-block: var(--space-lg);
    border-bottom: 1px solid var(--line);
    max-width: 82ch;
  }

  .pubs h3 {
    font-size: 1.1rem;
    line-height: 1.32;
    margin-bottom: 0.45rem;
  }

  .pubs__authors {
    font-size: var(--fs-sm);
    color: var(--ink-2);
    margin: 0 0 0.45rem;
  }

  .pubs__note {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin: 0 0 0.55rem;
  }

  .pubs__ref {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.04em;
    word-break: break-word;
  }

  .pubs__ref--plain {
    color: var(--muted);
    text-decoration: none;
  }

  .empty {
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    background: var(--surface);
    padding: var(--space-xl);
    max-width: 60ch;
  }

  .empty h2 {
    font-size: var(--fs-h2);
    margin-bottom: var(--space-sm);
  }

  .empty p {
    color: var(--muted);
    font-size: var(--fs-sm);
    margin-bottom: var(--space-lg);
  }

  @media (max-width: 700px) {
    .search input {
      min-width: 0;
      width: 100%;
    }

    .search {
      width: 100%;
    }
  }
</style>
