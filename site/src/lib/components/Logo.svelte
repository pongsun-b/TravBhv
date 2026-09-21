<script>
  /**
   * TBRG logo. Renders from the same generated paths as the exported asset pack,
   * so site and downloads can never drift. Inherits currentColor.
   *
   * variant: 'horizontal' | 'stacked' | 'mark' | 'monogram'
   */
  import { mark, markSmall, wordmark, monogram } from '$lib/brand-paths.js';

  let { variant = 'horizontal', height = 26, small = false, showDescriptor = false } = $props();

  const M = $derived(small ? markSmall : mark);

  // The wordmark viewBox carries even padding, so cap height is 74 of its height.
  const vb = wordmark.viewBox.split(' ').map(Number);
  const wordH = $derived(height * (vb[3] / 74));
  const markH = $derived(height * 1.22);
  const gap = $derived(markH * 0.16);
</script>

{#if variant === 'mark'}
  <svg
    class="mk"
    viewBox={M.viewBox}
    width={height}
    height={height}
    fill="currentColor"
    stroke="currentColor"
    stroke-linejoin="round"
    role="img"
    aria-label="TBRG"
  >
    {@html M.paths}
  </svg>
{:else if variant === 'monogram'}
  <svg
    class="mk"
    viewBox={monogram.viewBox}
    width={height}
    height={height}
    role="img"
    aria-label="TBRG"
  >
    <path fill="currentColor" d={monogram.d} />
  </svg>
{:else if variant === 'stacked'}
  <span class="logo logo--stacked" style="--mark-h: {markH}px; --word-h: {wordH}px">
    <svg
      viewBox={M.viewBox}
      width={markH}
      height={markH}
      fill="currentColor"
      stroke="currentColor"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {@html M.paths}
    </svg>
    <svg
      class="logo__word"
      viewBox={wordmark.viewBox}
      width={wordH * (vb[2] / vb[3])}
      height={wordH}
      role="img"
      aria-label="TBRG"
    >
      <path fill="currentColor" d={wordmark.d} />
    </svg>
    {#if showDescriptor}
      <span class="logo__descriptor">Travel Behavior Research Group</span>
    {/if}
  </span>
{:else}
  <span class="logo" style="--mark-h: {markH}px; --word-h: {wordH}px; --gap: {gap}px">
    <svg
      viewBox={M.viewBox}
      width={markH}
      height={markH}
      fill="currentColor"
      stroke="currentColor"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {@html M.paths}
    </svg>
    <svg
      class="logo__word"
      viewBox={wordmark.viewBox}
      width={wordH * (vb[2] / vb[3])}
      height={wordH}
      role="img"
      aria-label="TBRG"
    >
      <path fill="currentColor" d={wordmark.d} />
    </svg>
  </span>
{/if}

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: var(--gap);
  }

  .logo svg {
    display: block;
    flex: 0 0 auto;
  }

  .logo--stacked {
    flex-direction: column;
    gap: calc(var(--mark-h) * 0.16);
    align-items: flex-start;
  }

  .logo__descriptor {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.7;
    margin-top: 0.35rem;
  }
</style>
