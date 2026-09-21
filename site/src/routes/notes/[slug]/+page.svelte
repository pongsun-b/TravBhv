<script>
  import { resolve } from '$app/paths';

  let { data } = $props();
  const note = $derived(data.note);
</script>

<svelte:head>
  <title>{note.title} · Notes · TBRG</title>
  <meta name="description" content={note.summary} />
</svelte:head>

<article class="wrap note">
  <p class="crumb"><a href={resolve('/notes/')}>Notes</a></p>
  <h1>{note.title}</h1>
  <p class="when"><time datetime={note.date}>{note.display}</time></p>
  <div class="prose">{@html note.body}</div>
  <p class="back"><a href={resolve('/notes/')}>All notes</a></p>
</article>

<style>
  .note {
    padding-block: clamp(2.5rem, 6vw, 4.5rem) var(--space-3xl);
    max-width: 74ch;
  }

  .crumb,
  .back {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0;
  }

  .crumb {
    margin-bottom: var(--space-lg);
  }

  .back {
    margin-top: var(--space-2xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--line);
  }

  .when {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 0.6rem 0 var(--space-2xl);
  }

  .note h1 {
    font-size: var(--fs-h1);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
    margin: 0;
  }

  /* The body is authored HTML, so its children need global selectors. */
  .prose :global(p),
  .prose :global(ul),
  .prose :global(ol) {
    font-size: var(--fs-body);
    line-height: 1.65;
    color: var(--ink-2);
    margin: 0 0 var(--space-lg);
  }

  .prose :global(strong) {
    color: var(--ink);
  }

  .prose :global(em) {
    font-style: italic;
  }

  .prose :global(a) {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--accent-line);
    text-underline-offset: 0.18em;
  }

  .prose :global(a:hover) {
    color: var(--accent-ink);
  }

  .prose :global(code) {
    font-family: var(--font-mono);
    font-size: 0.88em;
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-radius: var(--radius-xs);
    padding: 0.1rem 0.35rem;
  }

  .prose :global(.cite) {
    font-size: var(--fs-sm);
    color: var(--muted);
  }

  .prose :global(.table-scroll) {
    margin: 0 0 var(--space-xl);
  }
</style>
