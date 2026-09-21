<script>
  import { resolve, asset } from '$app/paths';
  import { site } from '$lib/data/site.js';
  import Logo from '$lib/components/Logo.svelte';

  let year = new Date().getFullYear();
</script>

<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="col">
      <a class="brand" href={resolve('/')} aria-label="{site.name}, home">
        <Logo variant="stacked" height={30} showDescriptor={false} />
      </a>
      <p class="addr">
        {site.fullName}<br />
        <a href={site.affiliation.deptUrl} target="_blank" rel="noopener noreferrer">
          {site.affiliation.dept}
        </a><br />
        <a href={site.affiliation.universityUrl} target="_blank" rel="noopener noreferrer">
          {site.affiliation.university}
        </a>
      </p>
    </div>

    <div class="col">
      <p class="meta">Address</p>
      <p class="addr">
        {#each site.contact.address as line, i}
          {line}{#if i < site.contact.address.length - 1}<br />{/if}
        {/each}
      </p>
      <p class="addr">
        <a href={site.contact.mapUrl} target="_blank" rel="noopener noreferrer">Find on the map</a>
      </p>
    </div>

    <div class="col">
      <p class="meta">Contact</p>
      <p class="addr">
        <a href="mailto:{site.contact.email}">{site.contact.email}</a><br />
        <a href="tel:{site.contact.phone.replace(/-/g, '')}">{site.contact.phone}</a><br />
        <a href={site.contact.scholar} target="_blank" rel="noopener noreferrer">Google Scholar</a>
      </p>
      <a
        class="lockup"
        href={site.affiliation.deptUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={asset('/media/chula-civil-engineering.png')}
          width="751"
          height="105"
          alt="Department of Civil Engineering, Faculty of Engineering, Chulalongkorn University"
          loading="lazy"
        />
      </a>
    </div>
  </div>

  <div class="wrap footer-base">
    <nav class="footer-nav" aria-label="Footer">
      {#each [...site.nav, ...site.secondaryNav] as item (item.href)}
        <a href={resolve(item.href)}>{item.label}</a>
      {/each}
    </nav>
    <p class="copyright">© {year} {site.fullName}</p>
  </div>
</footer>

<style>
  .site-footer {
    margin-top: auto;
    border-top: 1px solid var(--line);
    padding-block: var(--space-2xl) var(--space-lg);
    background: var(--surface);
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: var(--space-2xl) var(--space-2xl);
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .brand {
    text-decoration: none;
    color: var(--ink);
    align-self: flex-start;
  }

  .lockup {
    display: inline-block;
    align-self: flex-start;
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: var(--r-control);
    padding: 0.6rem 0.75rem;
    line-height: 0;
    text-decoration: none;
  }

  .lockup img {
    width: 176px;
  }

  .addr {
    font-size: var(--fs-xs);
    line-height: 1.65;
    color: var(--muted);
    margin: 0;
  }

  .footer-base {
    margin-top: var(--space-2xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md) var(--space-lg);
    flex-wrap: wrap;
  }

  .footer-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.1rem;
  }

  .footer-nav a {
    font-size: var(--fs-caption);
    text-decoration: none;
    color: var(--muted);
  }

  .footer-nav a:hover {
    color: var(--ink);
  }

  .copyright {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.06em;
    color: var(--muted);
    margin: 0;
  }

  @media (max-width: 820px) {
    .footer-grid {
      grid-template-columns: 1fr;
      gap: var(--space-xl);
    }
  }
</style>
