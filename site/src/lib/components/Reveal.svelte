<script>
  /**
   * Optional wrapper form of the scroll-entry effect.
   *
   * Prefer the action (`use:reveal` from `$lib/actions/reveal.js`) on the real
   * element. Reach for this component only when a wrapper element is acceptable,
   * since it inserts one extra node into the layout.
   */
  import { reveal } from '$lib/actions/reveal.js';

  let { tag = 'div', delay = 0, children } = $props();
</script>

<svelte:element this={tag} use:reveal={delay}>
  {@render children()}
</svelte:element>
