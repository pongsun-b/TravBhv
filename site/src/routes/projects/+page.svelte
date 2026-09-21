<script>
  import { asset, resolve } from '$app/paths';
  import { featured, currentProjects } from '$lib/data/projects.js';
  import { alumni } from '$lib/data/people.js';
  import { reveal } from '$lib/actions/reveal.js';
  import SectionHead from '$lib/components/SectionHead.svelte';
</script>

<svelte:head>
  <title>Projects · Transportation Behavior Lab</title>
  <meta
    name="description"
    content="Active and completed research at the Transportation Behavior Lab, from travel behavior surveys and mobile data analysis to planning tools for Bangkok and Thailand."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Work in progress</p>
  <h1>What the group is working on</h1>
  <p class="lede">
    Work runs from travel behavior surveys and mobile data analysis to planning tools for Bangkok
    and Thailand. Thesis topics below are listed with their researchers; current topics come from
    the group's active students.
  </p>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Featured" />
    <div class="featured">
      {#each featured as item, i (item.title)}
        <article class="project" class:project--text={!item.image} use:reveal={i * 80}>
          {#if item.image}
            <img
              src={asset(item.image)}
              width="1920"
              height="1080"
              alt={item.imageAlt}
              loading="lazy"
              decoding="async"
            />
          {/if}
          <div class="project__body">
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <a class="project__link" href={resolve(item.link.href)}>{item.link.label}</a>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Current research" />
    <ul class="theses">
      {#each currentProjects as project (project.name)}
        <li>
          <p class="theses__author">{project.name}</p>
          <p class="theses__title">{project.title}</p>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <SectionHead title="Completed theses" />
    <ul class="theses theses--done">
      {#each alumni as person (person.name)}
        <li>
          <p class="theses__author">
            {person.name}
            <span class="theses__year">Graduated {person.year}</span>
          </p>
          <p class="theses__title">{person.thesis}</p>
          {#if person.report}
            <a class="project__link" href={person.report} target="_blank" rel="noopener noreferrer">
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

  .featured {
    border-top: 1px solid var(--line);
  }

  /* Lead project: media beside the text. Secondary projects run full width
     below, so no card is stretched to match a taller neighbour. */
  .project {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: var(--space-xl);
    padding-block: var(--space-xl);
    border-bottom: 1px solid var(--line);
    align-items: center;
  }

  .project--text {
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
  }

  .project img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border: 1px solid var(--line);
    border-radius: var(--r-control);
    background: var(--surface);
  }

  .project__body {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-width: 62ch;
  }

  .project h3 {
    margin: 0;
  }

  .project p {
    font-size: 0.95rem;
    color: var(--muted);
    margin: 0;
    flex: 1;
  }

  .project__link {
    font-size: 0.9rem;
    font-weight: 500;
    margin-top: 0.4rem;
    align-self: flex-start;
  }

  .theses {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .theses li {
    padding-block: 1.15rem;
    border-bottom: 1px solid var(--line);
  }

  .theses__author {
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

  .theses__year {
    color: var(--muted);
  }

  .theses__title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    line-height: 1.3;
    letter-spacing: -0.012em;
    color: var(--ink);
    margin: 0 0 0.4rem;
    max-width: 74ch;
  }

  @media (max-width: 820px) {
    .project {
      grid-template-columns: 1fr;
      gap: var(--space-lg);
    }
  }
</style>
