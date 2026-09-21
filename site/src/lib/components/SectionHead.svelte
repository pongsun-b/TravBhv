<script>
  import { resolve } from '$app/paths';

  let { title, id = undefined, action = null, meta = null, level = 2 } = $props();
  let Tag = $derived(level === 2 ? 'h2' : 'h3');
</script>

<header class="head">
  <div class="head__main">
    {#if meta}
      <p class="meta">{meta}</p>
    {/if}
    <svelte:element this={Tag} id={id}>{title}</svelte:element>
  </div>
  {#if action}
    <a class="head__action" href={resolve(action.href)}>
      {action.label}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13" /><path d="M13 6l6 6-6 6" /></svg>
    </a>
  {/if}
</header>

<style>
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.5rem 2rem;
    flex-wrap: wrap;
    margin-bottom: 2.2rem;
  }

  .head__main {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    max-width: 42ch;
  }

  .head__action {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    color: var(--ink);
    white-space: nowrap;
  }

  .head__action:hover {
    color: var(--accent-ink);
  }

  .head__action :global(svg) {
    transition: transform 200ms var(--ease);
  }

  .head__action:hover :global(svg) {
    transform: translateX(3px);
  }
</style>
