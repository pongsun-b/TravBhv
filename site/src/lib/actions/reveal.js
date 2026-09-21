/**
 * Scroll-entry action. Attaches to the real element, so no wrapper is inserted and
 * scoped page styles keep working.
 *
 *   <article class="pillar" use:reveal>...</article>
 *   <article class="pillar" use:reveal={120}>...</article>   // stagger in ms
 *
 * Uses IntersectionObserver only (never a window scroll listener). If the visitor
 * prefers reduced motion, or the element already sits in view, nothing is hidden.
 */
export function reveal(node, delay = 0) {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return {};
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return {};

  if (delay) node.style.transitionDelay = `${delay}ms`;
  node.classList.add('reveal');

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add('is-in');
          io.unobserve(node);
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  io.observe(node);

  return {
    destroy() {
      io.disconnect();
    }
  };
}
