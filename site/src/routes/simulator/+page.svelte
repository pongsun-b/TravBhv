<script>
  import ModeChoiceSimulator from '$lib/components/ModeChoiceSimulator.svelte';
  import { resolve } from '$app/paths';
  import SectionHead from '$lib/components/SectionHead.svelte';

  const inputs = [
    {
      name: 'Trip distance',
      detail: 'Door to door, one way. Sets in-vehicle time on every mode.'
    },
    {
      name: 'Walk to nearest stop',
      detail:
        'The first-mile cost. Rail, bus, motorcycle taxi and car each pay it at the current weather.'
    },
    {
      name: 'Weather',
      detail:
        'Scales walking and riding times, adds waiting time, and penalizes exposed modes more than enclosed ones.'
    },
    {
      name: 'Value of time',
      detail: 'Converts minutes into money. Raise it to represent a traveller who pays to save time.'
    }
  ];

  const modes = [
    { name: 'Urban rail', rule: 'Available from 3 km. Fixed 3 minute wait, 2 minute egress, and a transfer penalty beyond 18 km.' },
    { name: 'Bus', rule: 'Always available. Highest in-vehicle and waiting time, lowest fare.' },
    { name: 'Motorcycle taxi', rule: 'Always available. Fast, exposed, and priced per kilometre.' },
    { name: 'Car', rule: 'Always available. Fuel and parking, slowed by rain and congestion.' },
    { name: 'Walk', rule: 'Only treated as an option up to 2.5 km.' }
  ];
</script>

<svelte:head>
  <title>Mode-choice simulator · TBRG</title>
  <meta
    name="description"
    content="An interactive travel-behavior simulator: set trip distance, first-mile walk, weather and value of time, and see how trip share moves between rail, bus, motorcycle taxi, car and walking."
  />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Interactive tool</p>
  <h1>Mode-choice simulator</h1>
  <p class="lede">
    A small model of how one traveller might choose between five ways to make a trip. Change the
    conditions and watch the trade-offs move between time, money, access and comfort.
  </p>
</section>

<section class="section">
  <div class="wrap">
    <ModeChoiceSimulator />
  </div>
</section>

<section class="section">
  <div class="wrap two-col">
    <div>
      <SectionHead title="What each control does" level={3} />
      <dl class="detail">
        {#each inputs as item (item.name)}
          <div>
            <dt>{item.name}</dt>
            <dd>{item.detail}</dd>
          </div>
        {/each}
      </dl>
    </div>
    <div>
      <SectionHead title="How each mode behaves" level={3} />
      <dl class="detail">
        {#each modes as mode (mode.name)}
          <div>
            <dt>{mode.name}</dt>
            <dd>{mode.rule}</dd>
          </div>
        {/each}
      </dl>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="caveat">
      <h2>What this model is, and is not</h2>
      <p>
        Share is produced by a multinomial logit on generalized cost, where generalized cost is
        travel time valued in money plus fare plus a small alternative-specific constant. The
        coefficients, fares, speeds and value-of-time levels are set by hand to be plausible for
        Bangkok. They are not estimated from a survey, and they are not a forecast.
      </p>
      <p>
        Real mode-choice work in the lab uses travel surveys, mobile data, and discrete choice
        estimation. The simulator exists to make the mechanism legible:
        <a href={resolve('/research/')}>read how the research works</a>, or
        <a href={resolve('/publications/')}>see the published papers</a>.
      </p>
    </div>
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

  .two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(1.75rem, 4vw, 3.5rem);
    align-items: start;
  }

  .detail {
    margin: 0;
    border-top: 1px solid var(--line);
  }

  .detail > div {
    padding-block: 1rem;
    border-bottom: 1px solid var(--line);
  }

  .detail dt {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 0.3rem;
  }

  .detail dd {
    margin: 0;
    font-size: 0.92rem;
    color: var(--muted);
    max-width: 52ch;
  }

  .caveat {
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    background: var(--surface);
    padding: 1.8rem 2rem;
    max-width: 78ch;
  }

  .caveat h2 {
    font-size: clamp(1.35rem, 2.2vw, 1.7rem);
    margin-bottom: 0.9rem;
  }

  .caveat p {
    font-size: 0.97rem;
    color: var(--ink-2);
  }

  @media (max-width: 900px) {
    .two-col {
      grid-template-columns: 1fr;
    }
  }
</style>
