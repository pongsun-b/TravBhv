<script>
  import { asset } from '$app/paths';
  import { faculty, students, alumni } from '$lib/data/people.js';
  import { site } from '$lib/data/site.js';
  import { reveal } from '$lib/actions/reveal.js';
  import SectionHead from '$lib/components/SectionHead.svelte';
</script>

<svelte:head>
  <title>People · Transportation Behavior Lab</title>
  <meta
    name="description"
    content="Faculty, current graduate researchers, and alumni of the Transportation Behavior Lab, Department of Civil Engineering, Chulalongkorn University."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">The group</p>
  <h1>People</h1>
  <p class="lede">
    The group is based in the {site.affiliation.dept} at {site.affiliation.university}.
  </p>
</section>

<section class="section">
  <div class="wrap faculty-wrap">
    <img
      class="faculty__photo"
      src={asset(faculty.photo)}
      width="512"
      height="512"
      alt={faculty.name}
      decoding="async"
    />
    <div class="faculty__body">
      <h2>{faculty.name}</h2>
      <p class="faculty__thai" lang="th">{faculty.nameThai}</p>
      <p class="faculty__role">{faculty.role}</p>
      <p class="faculty__bio">{faculty.bio}</p>

      <dl class="facts">
        <div>
          <dt>Email</dt>
          <dd><a href="mailto:{faculty.email}">{faculty.email}</a></dd>
        </div>
        <div>
          <dt>Office</dt>
          <dd>{faculty.office}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd><a href="tel:{faculty.phone.replace(/-/g, '')}">{faculty.phone}</a></dd>
        </div>
        <div>
          <dt>Also</dt>
          <dd>{faculty.note}</dd>
        </div>
      </dl>

      <ul class="faculty__links">
        {#each faculty.links as link (link.href)}
          <li>
            <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
          </li>
        {/each}
      </ul>

      <h3 class="sub">Degrees</h3>
      <ul class="degrees">
        {#each faculty.degrees as degree (degree)}
          <li>{degree}</li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Graduate researchers" />
    <div class="people-grid">
      {#each students as person (person.name)}
        <article class="person" use:reveal>
          <img
            src={asset(person.photo)}
            width="533"
            height="800"
            alt={person.name}
            loading="lazy"
            decoding="async"
          />
          <div class="person__body">
            <h3>{person.name}</h3>
            <p class="person__research">{person.research}</p>
            <a class="person__mail" href="mailto:{person.email}">{person.email}</a>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Alumni" />
    <ul class="alumni">
      {#each alumni as person (person.name)}
        <li>
          <p class="alumni__name">
            {person.name}
            <span class="alumni__year">Graduated {person.year}</span>
          </p>
          <p class="alumni__thesis">{person.thesis}</p>
          {#if person.report}
            <a class="alumni__report" href={person.report} target="_blank" rel="noopener noreferrer">
              Thesis report
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .page-head {
    padding-block: clamp(3rem, 6vw, 5rem) 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .faculty-wrap {
    display: grid;
    grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
    gap: clamp(1.75rem, 4vw, 3rem);
    align-items: start;
  }

  .faculty__photo {
    width: 100%;
    border-radius: var(--r-surface);
    border: 1px solid var(--line);
    background: var(--surface);
  }

  .faculty__thai {
    font-size: 0.98rem;
    color: var(--muted);
    margin: 0.3rem 0 0.5rem;
  }

  .faculty__role {
    font-size: 0.98rem;
    color: var(--accent-ink);
    margin: 0 0 1rem;
  }

  .faculty__bio {
    font-size: 0.98rem;
    color: var(--ink-2);
    max-width: 72ch;
  }

  .facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    margin: 1.5rem 0;
    border-top: 1px solid var(--line);
  }

  .facts > div {
    padding: 0.9rem 1rem 0.9rem 0;
    border-bottom: 1px solid var(--line);
  }

  .facts dt {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.25rem;
  }

  .facts dd {
    margin: 0;
    font-size: 0.93rem;
  }

  .faculty__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.4rem;
    list-style: none;
    margin: 0 0 1.6rem;
    padding: 0;
  }

  .faculty__links a {
    font-size: 0.92rem;
    font-weight: 450;
  }

  .sub {
    font-size: 1.05rem;
    margin-bottom: 0.6rem;
  }

  .degrees {
    list-style: none;
    margin: 0;
    padding: 0;
    max-width: 68ch;
  }

  .degrees li {
    font-size: 0.94rem;
    color: var(--ink-2);
    padding-block: 0.6rem;
    border-bottom: 1px solid var(--line);
  }

  .people-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem 1.5rem;
  }

  .person img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: var(--r-control);
    border: 1px solid var(--line);
    background: var(--surface-2);
  }

  .person__body {
    margin-top: 0.85rem;
  }

  .person h3 {
    font-size: 1.05rem;
    margin-bottom: 0.4rem;
  }

  .person__research {
    font-size: 0.88rem;
    color: var(--muted);
    line-height: 1.5;
    margin: 0 0 0.5rem;
  }

  .person__mail {
    font-size: 0.82rem;
    word-break: break-word;
  }

  .alumni {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .alumni li {
    padding-block: 1.15rem;
    border-bottom: 1px solid var(--line);
  }

  .alumni__name {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 0.4rem;
    display: flex;
    gap: 0.7rem;
    flex-wrap: wrap;
  }

  .alumni__year {
    color: var(--muted);
  }

  .alumni__thesis {
    font-family: var(--font-display);
    font-size: 1.08rem;
    line-height: 1.3;
    color: var(--ink);
    margin: 0 0 0.35rem;
    max-width: 74ch;
  }

  .alumni__report {
    font-size: 0.88rem;
    font-weight: 500;
  }

  @media (max-width: 1000px) {
    .people-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 820px) {
    .faculty-wrap {
      grid-template-columns: 1fr;
    }

    .faculty__photo {
      max-width: 240px;
    }

    .people-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .facts {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .people-grid {
      grid-template-columns: 1fr;
      gap: 1.75rem;
    }
  }
</style>
