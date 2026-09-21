<script>
  /*
    Illustrative mode-choice simulator.
    A multinomial logit over five modes with plausible, hand-set coefficients.
    It is a teaching model, not a calibrated estimate for Bangkok: the point is
    to show how time, cost, access, weather and value of time trade off.
  */
  const VOT = { low: 60, middle: 120, high: 260 }; // THB per hour
  const INCOME_LABEL = { low: 'Low', middle: 'Middle', high: 'High' };

  const WEATHER = {
    dry: { label: 'Dry', walk: 1.0, ride: 1.0, wait: 0, walkPenalty: 0, motoPenalty: 0, busPenalty: 0 },
    light: { label: 'Light rain', walk: 1.15, ride: 1.25, wait: 2, walkPenalty: 4, motoPenalty: 3, busPenalty: 1 },
    heavy: { label: 'Heavy rain', walk: 1.4, ride: 1.6, wait: 5, walkPenalty: 7, motoPenalty: 5, busPenalty: 2 }
  };

  const PRESETS = [
    { id: 'commute', label: 'Inner-city commute', distance: 9, accessWalk: 7, weather: 'dry', income: 'middle' },
    { id: 'rainy', label: 'Rainy evening', distance: 12, accessWalk: 11, weather: 'heavy', income: 'middle' },
    { id: 'suburb', label: 'Suburban trip', distance: 24, accessWalk: 15, weather: 'dry', income: 'high' }
  ];

  let distance = $state(10);
  let accessWalk = $state(8);
  let weather = $state('dry');
  let income = $state('middle');
  let copied = $state(false);
  let activePreset = $state(null);

  const SCALE = 45; // THB per unit of utility

  function compute(d, access, wx, inc) {
    const w = WEATHER[wx];
    const votMin = VOT[inc] / 60;
    const accessTime = access * w.walk;
    const transfer = d > 18 ? 6 : 0;

    const specs = [
      {
        id: 'rail',
        name: 'Urban rail',
        cls: 'm-rail',
        available: d >= 3,
        unavailableReason: 'Below 3 km a rail trip is slower than walking straight there.',
        cost: 17 + 2.2 * Math.max(0, d - 3),
        constant: 0.25,
        time: () => ({
          ivt: (d / 35) * 60 + transfer,
          wait: 3 + w.wait,
          access: accessTime,
          egress: 2
        })
      },
      {
        id: 'car',
        name: 'Car',
        cls: 'm-car',
        available: true,
        cost: 4.5 * d + 30,
        constant: 0.15,
        time: () => ({ ivt: (d / 20) * 60 * w.ride, wait: 3, access: 2, egress: 0 })
      },
      {
        id: 'bus',
        name: 'Bus',
        cls: 'm-bus',
        available: true,
        cost: 8,
        constant: -0.35,
        time: () => ({
          ivt: (d / 14) * 60 * w.ride + w.busPenalty,
          wait: 8 + w.wait,
          access: accessTime,
          egress: 0
        })
      },
      {
        id: 'moto',
        name: 'Motorcycle taxi',
        cls: 'm-moto',
        available: true,
        cost: 10 + 7 * Math.max(0, d - 1),
        constant: 0,
        time: () => ({
          ivt: (d / 22) * 60 * w.ride + w.motoPenalty,
          wait: 2,
          access: accessTime,
          egress: 0
        })
      },
      {
        id: 'walk',
        name: 'Walk',
        cls: 'm-walk',
        available: d <= 2.5,
        unavailableReason: 'Above 2.5 km walking is not treated as a realistic option.',
        cost: 0,
        constant: -0.6,
        time: () => ({ ivt: (d / 4) * 60 * w.walk + w.walkPenalty, wait: 0, access: 0, egress: 0 })
      }
    ];

    const rows = specs.map((s) => {
      if (!s.available) {
        return { ...s, time: null, cost: null, genCost: null, util: null, share: 0 };
      }
      const part = s.time();
      const total = part.ivt + part.wait + part.access + part.egress;
      const genCost = votMin * total + s.cost;
      const util = s.constant - genCost / SCALE;
      return { ...s, time: total, genCost, util, share: 0 };
    });

    const live = rows.filter((r) => r.available);
    const maxUtil = Math.max(...live.map((r) => r.util));
    const exps = rows.map((r) => (r.available ? Math.exp(r.util - maxUtil) : 0));
    const sum = exps.reduce((a, b) => a + b, 0);
    rows.forEach((r, i) => {
      r.share = exps[i] / sum;
    });

    const ranked = [...rows].filter((r) => r.available).sort((a, b) => b.share - a.share);

    return { rows, ranked, totalTime: d, votMin };
  }

  let model = $derived(compute(distance, accessWalk, weather, income));
  let leader = $derived(model.ranked[0]);

  let summary = $derived(
    'At ' +
      distance.toFixed(1) +
      ' km with a ' +
      accessWalk +
      ' minute walk to the nearest stop, ' +
      leader.name.toLowerCase() +
      ' leads with ' +
      Math.round(leader.share * 100) +
      ' percent of trips under ' +
      WEATHER[weather].label.toLowerCase() +
      ' conditions and ' +
      INCOME_LABEL[income].toLowerCase() +
      ' value of time.'
  );

  function pct(n) {
    return Math.round(n * 100);
  }

  function mins(n) {
    return n.toFixed(1) + ' min';
  }

  function baht(n) {
    return '฿' + Math.round(n);
  }

  function applyPreset(p) {
    distance = p.distance;
    accessWalk = p.accessWalk;
    weather = p.weather;
    income = p.income;
    activePreset = p.id;
  }

  function reset() {
    distance = 10;
    accessWalk = 8;
    weather = 'dry';
    income = 'middle';
    activePreset = null;
  }

  async function copySummary() {
    const text =
      summary +
      '\n' +
      model.ranked
        .map((r) => r.name + ': ' + pct(r.share) + '% (' + mins(r.time) + ', ' + baht(r.cost) + ')')
        .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (e) {
      copied = false;
    }
  }
</script>

<div class="sim">
  <div class="sim__controls">
    <div class="presets" role="group" aria-label="Example trips">
      {#each PRESETS as p (p.id)}
        <button
          type="button"
          class="preset"
          class:is-active={activePreset === p.id}
          onclick={() => applyPreset(p)}
        >
          {p.label}
        </button>
      {/each}
    </div>

    <div class="field">
      <div class="field__row">
        <label for="sim-distance">Trip distance</label>
        <output for="sim-distance" class="field__value tabular">{distance.toFixed(1)} km</output>
      </div>
      <input
        id="sim-distance"
        type="range"
        min="1"
        max="30"
        step="0.5"
        bind:value={distance}
        aria-describedby="sim-distance-hint"
        oninput={() => (activePreset = null)}
      />
      <p class="field__hint" id="sim-distance-hint">Door to door, one way.</p>
    </div>

    <div class="field">
      <div class="field__row">
        <label for="sim-walk">Walk to nearest stop or station</label>
        <output for="sim-walk" class="field__value tabular">{accessWalk} min</output>
      </div>
      <input
        id="sim-walk"
        type="range"
        min="0"
        max="30"
        step="1"
        bind:value={accessWalk}
        aria-describedby="sim-walk-hint"
        oninput={() => (activePreset = null)}
      />
      <p class="field__hint" id="sim-walk-hint">This is the first-mile cost. Rail and bus both pay it.</p>
    </div>

    <fieldset class="field field--set">
      <legend>Weather</legend>
      <div class="segmented">
        {#each Object.entries(WEATHER) as [key, cfg] (key)}
          <label class="seg-opt" class:is-active={weather === key}>
            <input
              type="radio"
              name="sim-weather"
              value={key}
              bind:group={weather}
              onchange={() => (activePreset = null)}
            />
            <span>{cfg.label}</span>
          </label>
        {/each}
      </div>
    </fieldset>

    <fieldset class="field field--set">
      <legend>Value of time</legend>
      <div class="segmented">
        {#each Object.entries(INCOME_LABEL) as [key, label] (key)}
          <label class="seg-opt" class:is-active={income === key}>
            <input
              type="radio"
              name="sim-income"
              value={key}
              bind:group={income}
              onchange={() => (activePreset = null)}
            />
            <span>{label}</span>
          </label>
        {/each}
      </div>
      <p class="field__hint">Raise it to represent a traveller who pays more to save time.</p>
    </fieldset>

    <div class="sim__actions">
      <button type="button" class="btn btn--outline" onclick={reset}>Reset</button>
      <button type="button" class="btn btn--outline" onclick={copySummary}>
        {copied ? 'Copied' : 'Copy result'}
      </button>
    </div>
  </div>

  <div class="sim__output">
    <p class="meta">Mode share</p>
    <p class="sim__summary" aria-live="polite">{summary}</p>

    <div class="bar" role="img" aria-label={summary}>
      {#each model.rows as row (row.id)}
        {#if row.available && row.share > 0.0005}
          <span class="seg {row.cls}" style="width: {row.share * 100}%">
            {#if row.share > 0.12}
              <span class="pct-label">{pct(row.share)}%</span>
            {/if}
          </span>
        {/if}
      {/each}
    </div>

    <ul class="legend">
      {#each model.ranked as row (row.id)}
        <li>
          <span class="swatch {row.cls}" aria-hidden="true"></span>
          <span class="legend__name">{row.name}</span>
          <span class="legend__pct tabular">{pct(row.share)}%</span>
        </li>
      {/each}
    </ul>

    <!-- The wrapper carries a tabindex on purpose: a horizontally scrollable region must be
         reachable by keyboard (WCAG 2.1.1), so it is a focusable, named region. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="table-scroll" role="region" aria-label="Generalized cost per mode" tabindex="0">
    <table class="data-table sim__table">
      <caption>Generalized cost per mode, all values illustrative</caption>
      <thead>
        <tr>
          <th scope="col">Mode</th>
          <th scope="col" class="n">Time</th>
          <th scope="col" class="n">Fare</th>
          <th scope="col" class="n">Share</th>
        </tr>
      </thead>
      <tbody>
        {#each model.rows as row (row.id)}
          <tr class:is-off={!row.available}>
            <th scope="row">{row.name}</th>
            {#if row.available}
              <td class="n">{mins(row.time)}</td>
              <td class="n">{baht(row.cost)}</td>
              <td class="n">{pct(row.share)}%</td>
            {:else}
              <td class="n off" colspan="3">{row.unavailableReason}</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
    </div>

    <p class="sim__note">
      Time is in-vehicle plus waiting plus the first-mile walk. Share comes from a multinomial
      logit on generalized cost, with hand-set coefficients. Treat it as a way to see the
      trade-offs move, not as a forecast.
    </p>
  </div>
</div>

<style>
  .sim {
    display: grid;
    grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    overflow: hidden;
  }

  .sim__controls,
  .sim__output {
    background: var(--surface);
    padding: 1.5rem 1.6rem 1.7rem;
    min-width: 0;
  }

  .sim__output {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 1.5rem;
  }

  .preset {
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 450;
    color: var(--ink-2);
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    padding: 0.32rem 0.7rem;
    cursor: pointer;
    transition: border-color 160ms var(--ease), color 160ms var(--ease);
  }

  .preset:hover {
    border-color: var(--line-strong);
    color: var(--ink);
  }

  .preset.is-active {
    color: var(--accent-ink);
    border-color: var(--accent-line);
    background: var(--accent-soft);
  }

  .field {
    margin-bottom: 1.4rem;
  }

  .field--set {
    border: 0;
    padding: 0;
    margin-inline: 0;
  }

  .field__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .field label,
  .field legend {
    font-size: 0.92rem;
    font-weight: 450;
    color: var(--ink);
    padding: 0;
  }

  .field__value {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--ink);
  }

  .field__hint {
    font-size: 0.8rem;
    color: var(--muted);
    margin: 0.45rem 0 0;
    line-height: 1.5;
  }

  input[type='range'] {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    height: 22px;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 3px;
    background: var(--line-strong);
    border-radius: 2px;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -6.5px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
    box-shadow: var(--shadow-1);
  }

  input[type='range']::-moz-range-track {
    height: 3px;
    background: var(--line-strong);
    border-radius: 2px;
  }

  input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
  }

  .segmented {
    display: flex;
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: var(--r-control);
    overflow: hidden;
    margin-top: 0.55rem;
  }

  .seg-opt {
    flex: 1;
    position: relative;
    text-align: center;
  }

  .seg-opt input {
    position: absolute;
    opacity: 0;
    inset: 0;
    cursor: pointer;
  }

  .seg-opt span {
    display: block;
    padding: 0.5rem 0.4rem;
    font-size: 0.82rem;
    color: var(--ink-2);
    background: var(--surface-2);
    transition: background-color 160ms var(--ease), color 160ms var(--ease);
  }

  .seg-opt:hover span {
    color: var(--ink);
  }

  .seg-opt.is-active span {
    background: var(--surface);
    color: var(--ink);
    box-shadow: inset 0 -2px 0 var(--accent);
  }

  .seg-opt input:focus-visible + span {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .sim__actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .sim__summary {
    font-size: 1.02rem;
    line-height: 1.5;
    color: var(--ink);
    margin: 0;
    max-width: 60ch;
  }

  .bar {
    display: flex;
    height: 34px;
    border-radius: var(--r-control);
    overflow: hidden;
    border: 1px solid var(--line);
  }

  .seg {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 420ms var(--ease);
    min-width: 2px;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1.1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.86rem;
  }

  .swatch {
    width: 11px;
    height: 11px;
    border-radius: 3px;
    flex: 0 0 auto;
  }

  .legend__name {
    color: var(--ink-2);
  }

  .legend__pct {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--muted);
  }

  .sim__table {
    margin-top: 0.2rem;
  }

  .sim__table tr.is-off th,
  .sim__table tr.is-off td {
    color: var(--muted);
  }

  .sim__table td.off {
    font-size: 0.82rem;
    font-style: italic;
  }

  .sim__note {
    /* 0.82rem measured 13.1px, below a comfortable reading size for a sentence. */
    font-size: var(--fs-sm);
    color: var(--ink-2);
    line-height: 1.6;
    margin: 0;
    max-width: 62ch;
  }

  @media (max-width: 900px) {
    .sim {
      grid-template-columns: 1fr;
    }
  }
</style>
