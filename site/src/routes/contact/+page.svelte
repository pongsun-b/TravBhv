<script>
  import { site } from '$lib/data/site.js';
  import InquiryForm from '$lib/components/InquiryForm.svelte';

  const reasons = [
    {
      name: 'Data access',
      detail:
        'Walk-access layers and other lab datasets. Include your name, affiliation, and intended use.'
    },
    {
      name: 'Collaboration',
      detail:
        'Joint projects on travel behavior, accessibility, or transport planning in Thailand and the region.'
    },
    {
      name: 'Study with the group',
      detail:
        'Graduate supervision in the Transportation Engineering division of the Department of Civil Engineering.'
    },
    {
      name: 'Media and public enquiries',
      detail: 'Questions about the walk-access map, mode choice, or how the lab reads Bangkok travel.'
    }
  ];
</script>

<svelte:head>
  <title>Contact and join · ALIS</title>
  <meta
    name="description"
    content="Contact ALIS, the Transportation Behavior Lab at Chulalongkorn University. Data access, collaboration, graduate study, and media enquiries."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Get in touch</p>
  <h1>Contact and join</h1>
  <p class="lede">
    One form for data access, collaboration, graduate study and media enquiries. Every submission is
    recorded with a timestamp and the page it came from, and answered by a person.
  </p>
</section>

<section class="section section--flush">
  <div class="wrap contact">
    <div class="contact__form">
      <h2>Send an enquiry</h2>
      <InquiryForm email={site.contact.email} source="/contact/" />
    </div>

    <aside class="contact__side">
      <h2>Direct</h2>
      <dl class="facts">
        <div>
          <dt>Email</dt>
          <dd><a href="mailto:{site.contact.email}">{site.contact.email}</a></dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd><a href="tel:{site.contact.phone.replace(/-/g, '')}">{site.contact.phone}</a></dd>
        </div>
        <div>
          <dt>Office</dt>
          <dd>CE Building, Room 527</dd>
        </div>
        <div>
          <dt>Post</dt>
          <dd>
            {#each site.contact.address as line, i}
              {line}{#if i < site.contact.address.length - 1}<br />{/if}
            {/each}
          </dd>
        </div>
      </dl>
      <a
        class="btn btn--outline"
        href={site.contact.mapUrl}
        target="_blank"
        rel="noopener noreferrer">Open in maps</a
      >

      <h2 class="sub">What to write about</h2>
      <dl class="reasons">
        {#each reasons as reason (reason.name)}
          <div>
            <dt>{reason.name}</dt>
            <dd>{reason.detail}</dd>
          </div>
        {/each}
      </dl>

      <p class="aside">
        Faculty profile and citation record:
        <a href={site.contact.scholar} target="_blank" rel="noopener noreferrer">Google Scholar</a>
        and the
        <a
          href="https://civil.eng.chula.ac.th/web/pongsun-bunditsakulchai/"
          target="_blank"
          rel="noopener noreferrer">department page</a
        >.
      </p>
    </aside>
  </div>
</section>

<style>
  .page-head {
    padding-block: clamp(3rem, 6vw, 5rem) var(--space-2xl);
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

  .contact {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: var(--space-3xl);
    align-items: start;
  }

  .contact__form h2,
  .contact__side h2 {
    margin-bottom: var(--space-lg);
  }

  .contact__side .sub {
    margin-top: var(--space-2xl);
  }

  .facts,
  .reasons {
    margin: 0 0 var(--space-lg);
    border-top: 1px solid var(--line);
  }

  .facts > div,
  .reasons > div {
    padding-block: 0.75rem;
    border-bottom: 1px solid var(--line);
  }

  .facts dt {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.25rem;
  }

  .reasons dt {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 0.25rem;
  }

  .facts dd,
  .reasons dd {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--ink-2);
    max-width: 52ch;
  }

  .aside {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  @media (max-width: 900px) {
    .contact {
      grid-template-columns: 1fr;
      gap: var(--space-2xl);
    }

    .contact__form {
      order: -1;
    }
  }
</style>
