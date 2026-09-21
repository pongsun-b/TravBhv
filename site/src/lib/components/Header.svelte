<script>
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
  import { site } from '$lib/data/site.js';
  import Logo from '$lib/components/Logo.svelte';

  let open = $state(false);
  let theme = $state('light');

  let path = $derived($page.url.pathname);

  function isActive(href) {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  }

  $effect(() => {
    theme = document.documentElement.getAttribute('data-theme') || 'light';
  });

  $effect(() => {
    path;
    open = false;
  });

  $effect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => {
      if (e.key === 'Escape') open = false;
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  });

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    theme = next;
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('alis-theme', next);
    } catch (e) {
      /* storage can be unavailable in private mode */
    }
  }
</script>

<header class="site-header">
  <div class="progress" aria-hidden="true"></div>
  <div class="wrap header-inner">
    <a class="brand" href={resolve('/')} aria-label="{site.name}, home">
      <Logo height={26} />
      <span class="brand__full">{site.fullName}</span>
    </a>

    <nav class="nav" aria-label="Primary">
      <ul>
        {#each site.nav as item (item.href)}
          <li>
            <a href={resolve(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="header-actions">
      <button
        type="button"
        class="icon-btn"
        onclick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {#if theme === 'dark'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.9 4.9l1.4 1.4" /><path d="M17.7 17.7l1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M4.9 19.1l1.4-1.4" /><path d="M17.7 6.3l1.4-1.4" /></svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.6A8.4 8.4 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" /></svg>
        {/if}
      </button>

      <a class="btn btn--primary header-cta" href={resolve(site.cta.href)}>{site.cta.label}</a>

      <button
        type="button"
        class="icon-btn nav-toggle"
        onclick={() => (open = !open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {#if open}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
        {:else}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>
        {/if}
      </button>
    </div>
  </div>

  {#if open}
    <div class="drawer" id="mobile-nav">
      <nav class="wrap" aria-label="Mobile">
        <ul>
          {#each [...site.nav, ...site.secondaryNav] as item (item.href)}
            <li>
              <a href={resolve(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
              </a>
            </li>
          {/each}
          <li><a href={resolve(site.cta.href)}>{site.cta.label}</a></li>
        </ul>
      </nav>
    </div>
  {/if}
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--paper) 88%, transparent);
    backdrop-filter: saturate(140%) blur(14px);
    -webkit-backdrop-filter: saturate(140%) blur(14px);
    border-bottom: 1px solid var(--line);
  }

  /* Reading progress. Pure CSS scroll-driven animation; silently absent where
     the browser does not support it. */
  .progress {
    position: absolute;
    left: 0;
    bottom: -1px;
    height: 2px;
    width: 100%;
    background: var(--accent);
    transform-origin: 0 50%;
    transform: scaleX(0);
  }

  @supports (animation-timeline: scroll()) {
    .progress {
      animation: grow linear;
      animation-timeline: scroll(root block);
    }
  }

  @keyframes grow {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .progress {
      animation: none;
      transform: scaleX(0);
    }
  }

  .header-inner {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    min-height: 70px;
    padding-block: var(--space-sm);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    text-decoration: none;
    color: var(--ink);
    flex: 0 0 auto;
  }

  .brand__full {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    padding-left: var(--space-sm);
    border-left: 1px solid var(--line-strong);
    line-height: 1.25;
    max-width: 9rem;
  }

  .nav {
    margin-left: auto;
  }

  .nav ul {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav a {
    font-size: var(--fs-xs);
    font-weight: 500;
    text-decoration: none;
    color: var(--ink-2);
    padding-bottom: 2px;
    border-bottom: 1.5px solid transparent;
    transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }

  .nav a:hover {
    color: var(--ink);
  }

  .nav a[aria-current='page'] {
    color: var(--ink);
    border-bottom-color: var(--accent);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex: 0 0 auto;
  }

  .icon-btn {
    display: inline-grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: var(--r-control);
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .icon-btn:hover {
    border-color: var(--line-strong);
    color: var(--accent-ink);
  }

  .nav-toggle {
    display: none;
  }

  .drawer {
    border-top: 1px solid var(--line);
    background: var(--surface);
    padding-block: var(--space-xs) var(--space-md);
    max-height: calc(100dvh - 70px);
    overflow-y: auto;
  }

  .drawer ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .drawer a {
    display: block;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--line);
    font-size: 1.05rem;
    text-decoration: none;
    color: var(--ink);
  }

  .drawer a[aria-current='page'] {
    color: var(--accent-ink);
  }

  @media (max-width: 1120px) {
    .nav {
      display: none;
    }

    .nav-toggle {
      display: inline-grid;
    }

    .header-inner {
      justify-content: space-between;
    }
  }

  @media (max-width: 720px) {
    .brand__full {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .header-cta {
      display: none;
    }
  }
</style>
