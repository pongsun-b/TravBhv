<script>
  import Logo from '$lib/components/Logo.svelte';

  /* Contrast ratios are computed from the live tokens, so this page cannot
     claim a ratio the palette does not actually deliver. */
  function luminance(hex) {
    const c = hex.replace('#', '');
    const v = [0, 2, 4].map((i) => {
      const x = parseInt(c.slice(i, i + 2), 16) / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }

  function ratio(a, b) {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
  }

  const light = {
    paper: '#f4f5f2',
    surface: '#fdfdfb',
    surface2: '#eef0ea',
    ink: '#161a19',
    ink2: '#38403d',
    muted: '#5f6864',
    faint: '#68716c',
    line: '#e2e5df',
    accent: '#2e6b57',
    accentInk: '#235444',
    accentSoft: '#e2efe9',
    accentLine: '#bed8cd'
  };

  const dark = {
    paper: '#0f1413',
    surface: '#171e1c',
    ink: '#eef2ef',
    ink2: '#c6cfc9',
    muted: '#96a09a',
    accent: '#6fbfa0'
  };

  const palette = [
    { group: 'Neutrals', swatches: [
      { name: 'Paper', token: '--paper', hex: light.paper, note: 'Page background' },
      { name: 'Surface', token: '--surface', hex: light.surface, note: 'Cards and panels' },
      { name: 'Surface 2', token: '--surface-2', hex: light.surface2, note: 'Toolbars, chips' },
      { name: 'Line', token: '--line', hex: light.line, note: 'Hairlines only' }
    ]},
    { group: 'Text', swatches: [
      { name: 'Ink', token: '--ink', hex: light.ink, note: 'Headings' },
      { name: 'Ink 2', token: '--ink-2', hex: light.ink2, note: 'Body copy' },
      { name: 'Muted', token: '--muted', hex: light.muted, note: 'Secondary text' },
      { name: 'Faint', token: '--faint', hex: light.faint, note: 'Tertiary text' }
    ]},
    { group: 'Brand', swatches: [
      { name: 'Accent', token: '--accent', hex: light.accent, note: 'Primary action, active state' },
      { name: 'Accent ink', token: '--accent-ink', hex: light.accentInk, note: 'Accent text on paper' },
      { name: 'Accent soft', token: '--accent-soft', hex: light.accentSoft, note: 'Tints, focus halo' },
      { name: 'Accent line', token: '--accent-line', hex: light.accentLine, note: 'Accent hairlines' }
    ]}
  ];

  const pairings = [
    { fg: light.ink, bg: light.paper, label: 'Ink on paper', use: 'Headings', min: 3 },
    { fg: light.ink2, bg: light.paper, label: 'Ink 2 on paper', use: 'Body copy', min: 4.5 },
    { fg: light.muted, bg: light.paper, label: 'Muted on paper', use: 'Secondary text', min: 4.5 },
    { fg: light.faint, bg: light.paper, label: 'Faint on paper', use: 'Tertiary text', min: 4.5 },
    { fg: light.accentInk, bg: light.paper, label: 'Accent ink on paper', use: 'Links, accent text', min: 4.5 },
    { fg: '#ffffff', bg: light.accent, label: 'White on accent', use: 'Primary button', min: 4.5 },
    { fg: dark.ink, bg: dark.paper, label: 'Ink on ink', use: 'Dark mode headings', min: 3 },
    { fg: dark.muted, bg: dark.paper, label: 'Muted on ink', use: 'Dark mode secondary', min: 4.5 },
    { fg: dark.accent, bg: dark.paper, label: 'Accent on ink', use: 'Dark mode links', min: 4.5 }
  ];

  const typeScale = [
    { name: 'Display', token: '--fs-display', sample: 'A million decisions', px: '40 to 76 px' },
    { name: 'Heading 1', token: '--fs-h1', sample: 'Walk access to urban rail', px: '32 to 50 px' },
    { name: 'Heading 2', token: '--fs-h2', sample: 'Lines of work', px: '25 to 34 px' },
    { name: 'Heading 3', token: '--fs-h3', sample: 'First-mile walk access', px: '19 px' },
    { name: 'Body', token: '--fs-body', sample: 'Travel time valued in money, plus fare.', px: '17 px' },
    { name: 'Small', token: '--fs-sm', sample: 'Mobile data, surveys, network models.', px: '15 px' },
    { name: 'Caption', token: '--fs-caption', sample: 'OpenStreetMap walk graph, ODbL.', px: '13 px' },
    { name: 'Meta', token: '--fs-meta', sample: 'EPSG:4326 · 165 STATIONS', px: '12 px mono' }
  ];

  const minSizes = [
    { name: 'Primary lockup', digital: '160 px wide', print: '32 mm wide' },
    { name: 'Stacked lockup', digital: '96 px wide', print: '22 mm wide' },
    { name: 'Mark', digital: '24 px', print: '6 mm' },
    { name: 'Monogram tile', digital: '16 px', print: '5 mm' }
  ];

  const dos = [
    'Use the supplied SVG files. They are the master artwork.',
    'Keep clear space equal to the node diameter on all sides.',
    'Use the monogram tile below 24 px, never the full mark.',
    'Place the lockup on paper, ink or a flat brand colour.',
    'Use the mono mark when a single colour is required.'
  ];

  const donts = [
    'Do not stretch, squash or rotate any element.',
    'Do not recolour the mark or wordmark outside the palette.',
    'Do not add shadows, glows or outlines to the logo.',
    'Do not re-set the wordmark in another typeface.',
    'Do not place the lockup on a busy photo without a scrim.'
  ];
</script>

<svelte:head>
  <title>Brand guide · ALIS</title>
  <meta name="description" content="The ALIS identity: logo, marks, clear space, colour and type." />
</svelte:head>

<section class="wrap page-head">
  <p class="meta">Identity</p>
  <h1>ALIS brand guide</h1>
  <p class="lede">
    One source of truth for the ALIS identity: how the mark behaves, how much space it needs, the
    palette with its measured contrast, and the type system.
  </p>
</section>

<section class="section section--flush">
  <div class="wrap">
    <h2 class="h2">Logo</h2>
    <p class="intro">
      The mark is a node on a ring: a closed route with one stop. The ring is opened just enough that
      the node keeps clear air on both sides, which keeps it legible down to favicon size. The
      monogram is the secondary mark, used only where the primary mark cannot survive.
    </p>

    <div class="logos">
      <div class="logo-cell">
        <div class="logo-stage"><Logo height={30} /></div>
        <p class="logo-cell__name">Primary lockup</p>
        <p class="logo-cell__meta">Horizontal. Default for headers and print.</p>
      </div>
      <div class="logo-cell">
        <div class="logo-stage"><Logo variant="stacked" height={30} /></div>
        <p class="logo-cell__name">Stacked lockup</p>
        <p class="logo-cell__meta">Narrow and square formats.</p>
      </div>
      <div class="logo-cell">
        <div class="logo-stage"><Logo variant="mark" height={44} /></div>
        <p class="logo-cell__name">Mark</p>
        <p class="logo-cell__meta">Avatars, stamps, pattern units.</p>
      </div>
      <div class="logo-cell">
        <div class="logo-stage">
          <span class="tile"><Logo variant="monogram" height={26} /></span>
        </div>
        <p class="logo-cell__name">Monogram tile</p>
        <p class="logo-cell__meta">Below 24 px: favicon and app icon.</p>
      </div>
    </div>

    <div class="logo-dark">
      <p class="meta dark-label">On ink</p>
      <div class="logo-stage logo-stage--dark"><Logo height={30} /></div>
      <div class="logo-stage logo-stage--dark"><Logo variant="stacked" height={30} /></div>
      <div class="logo-stage logo-stage--dark"><Logo variant="mark" height={40} /></div>
      <div class="logo-stage logo-stage--dark">
        <span class="tile tile--dark"><Logo variant="monogram" height={24} /></span>
      </div>
    </div>

    <div class="grid2">
      <div>
        <h3 class="h3">Clear space</h3>
        <p class="intro">
          Keep clear space equal to the node diameter (about one mark-stroke width) on every side.
          Nothing may enter that zone: no type, no rule, no edge of a container.
        </p>
        <div class="clearspace">
          <span class="clearspace__zone">
            <Logo height={26} />
          </span>
        </div>
      </div>
      <div>
        <h3 class="h3">Minimum size</h3>
        <!-- The wrapper carries a tabindex on purpose: a horizontally scrollable region must be
             reachable by keyboard (WCAG 2.1.1), so it is a focusable, named region. -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div class="table-scroll" role="region" aria-label="Minimum sizes" tabindex="0">
        <table class="data-table mini">
          <thead>
            <tr><th scope="col">Element</th><th scope="col">Digital</th><th scope="col">Print</th></tr>
          </thead>
          <tbody>
            {#each minSizes as row (row.name)}
              <tr><th scope="row">{row.name}</th><td>{row.digital}</td><td>{row.print}</td></tr>
            {/each}
          </tbody>
        </table>
        </div>
        <p class="intro small">
          Where the identity must appear smaller than 16 px, use the monogram tile alone.
        </p>
      </div>
    </div>

    <h3 class="h3 spaced">Usage</h3>
    <div class="dodont">
      <div class="dd dd--do">
        <p class="dd__label">Correct</p>
        <ul>{#each dos as item (item)}<li>{item}</li>{/each}</ul>
      </div>
      <div class="dd dd--dont">
        <p class="dd__label">Incorrect</p>
        <ul>{#each donts as item (item)}<li>{item}</li>{/each}</ul>
      </div>
    </div>

    <div class="examples">
      <figure class="ex ex--bad">
        <div class="ex__stage" style="--demo: stretch"><Logo height={26} /></div>
        <figcaption><span class="tag tag--bad">Incorrect</span> Stretched horizontally.</figcaption>
      </figure>
      <figure class="ex ex--bad">
        <div class="ex__stage" style="--demo: rotate"><Logo height={26} /></div>
        <figcaption><span class="tag tag--bad">Incorrect</span> Rotated.</figcaption>
      </figure>
      <figure class="ex ex--bad">
        <div class="ex__stage" style="--demo: recolour"><Logo height={26} /></div>
        <figcaption><span class="tag tag--bad">Incorrect</span> Recoloured off-palette.</figcaption>
      </figure>
      <figure class="ex ex--bad">
        <div class="ex__stage" style="--demo: shadow"><Logo height={26} /></div>
        <figcaption><span class="tag tag--bad">Incorrect</span> Effects applied.</figcaption>
      </figure>
      <figure class="ex ex--good">
        <div class="ex__stage"><Logo height={26} /></div>
        <figcaption><span class="tag tag--good">Correct</span> As supplied, on paper.</figcaption>
      </figure>
      <figure class="ex ex--good">
        <div class="ex__stage ex__stage--dark"><Logo height={26} /></div>
        <figcaption><span class="tag tag--good">Correct</span> On ink, using the mono mark.</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2">Colour</h2>
    <p class="intro">
      One accent, restrained neutrals, and a single categorical scale shared by every chart on the
      site. Values come from <code>src/lib/tokens.css</code>; the ratios below are computed live from
      those values.
    </p>

    {#each palette as group (group.group)}
      <h3 class="h3">{group.group}</h3>
      <ul class="swatches">
        {#each group.swatches as s (s.name)}
          <li>
            <span class="swatch" style="background: {s.hex}"></span>
            <span class="swatch__name">{s.name}</span>
            <span class="swatch__hex">{s.hex}</span>
            <span class="swatch__token">{s.token}</span>
            <span class="swatch__note">{s.note}</span>
          </li>
        {/each}
      </ul>
    {/each}

    <h3 class="h3 spaced">Text and background pairings</h3>
    <!-- The wrapper carries a tabindex on purpose: a horizontally scrollable region must be
         reachable by keyboard (WCAG 2.1.1), so it is a focusable, named region. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="table-scroll" role="region" aria-label="Text and background pairings" tabindex="0">
    <table class="data-table">
      <caption>Measured contrast, WCAG 2.2 AA target</caption>
      <thead>
        <tr>
          <th scope="col">Pairing</th>
          <th scope="col">Used for</th>
          <th scope="col" class="n">Ratio</th>
          <th scope="col" class="n">Minimum</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        {#each pairings as p (p.label)}
          <tr>
            <th scope="row">{p.label}</th>
            <td>{p.use}</td>
            <td class="n">{ratio(p.fg, p.bg)}:1</td>
            <td class="n">{p.min}:1</td>
            <td>{ratio(p.fg, p.bg) >= p.min ? 'Pass' : 'Fail'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="h2">Typography</h2>
    <p class="intro">
      Two typefaces. Instrument Sans for everything structural, JetBrains Mono for data and
      metadata. Both are open source.
    </p>
    <div class="fonts">
      <div class="font-card">
        <p class="font-card__role">Display and interface</p>
        <p class="font-card__name">Instrument Sans</p>
        <p class="font-card__sample">Aa Bb Cc 0123</p>
        <p class="font-card__meta">Weights 400 / 500 / 600. SIL Open Font License 1.1.</p>
      </div>
      <div class="font-card">
        <p class="font-card__role">Data and metadata</p>
        <p class="font-card__name mono">JetBrains Mono</p>
        <p class="font-card__sample mono">0123 km/h</p>
        <p class="font-card__meta">Weights 400 / 500. SIL Open Font License 1.1.</p>
      </div>
    </div>

    <h3 class="h3 spaced">Scale</h3>
    <ul class="scale">
      {#each typeScale as t (t.name)}
        <li>
          <span class="scale__name">{t.name}</span>
          <span class="scale__sample" style="font-size: var({t.token})">{t.sample}</span>
          <span class="scale__px">{t.px}</span>
        </li>
      {/each}
    </ul>
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

  .h2 {
    font-size: var(--fs-h2);
    margin-bottom: var(--space-sm);
  }

  .h3 {
    font-size: var(--fs-h4);
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: 0;
    margin-top: var(--space-xl);
    margin-bottom: var(--space-sm);
  }

  .spaced {
    margin-top: var(--space-2xl);
  }

  .intro {
    font-size: var(--fs-sm);
    color: var(--ink-2);
    max-width: 74ch;
  }

  .intro.small {
    font-size: var(--fs-caption);
    color: var(--muted);
  }

  .logos {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-lg);
  }

  .logo-cell {
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    overflow: hidden;
    background: var(--surface);
  }

  .logo-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 118px;
    padding: var(--space-lg);
    background: var(--surface);
    border-bottom: 1px solid var(--line);
    color: var(--ink);
  }

  .logo-stage--dark {
    background: #0f1413;
    color: #eef2ef;
    border-bottom: 0;
    border-right: 1px solid var(--line);
  }

  .logo-cell__name {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--ink);
    margin: 0;
    padding: var(--space-md) var(--space-md) 0.15rem;
  }

  .logo-cell__meta {
    font-size: var(--fs-caption);
    color: var(--muted);
    margin: 0;
    padding: 0 var(--space-md) var(--space-md);
  }

  .logo-dark {
    display: grid;
    grid-template-columns: 6rem repeat(4, minmax(0, 1fr));
    align-items: stretch;
    margin-top: var(--space-md);
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    overflow: hidden;
    background: #0f1413;
  }

  .dark-label {
    color: #96a09a;
    padding: var(--space-lg) var(--space-md);
    align-self: center;
  }

  .tile {
    display: inline-grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: var(--accent);
    color: #fff;
  }

  .tile--dark {
    background: #2e6b57;
  }

  .grid2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2xl);
    margin-top: var(--space-lg);
    align-items: start;
  }

  .clearspace {
    border: 1px dashed var(--accent-line);
    border-radius: var(--r-control);
    padding: 26px;
    display: inline-block;
    background: var(--surface);
    color: var(--ink);
    margin-top: var(--space-sm);
  }

  .clearspace__zone {
    display: block;
    outline: 1px solid var(--accent);
    outline-offset: 0;
    padding: 8px;
  }

  .mini th,
  .mini td {
    font-size: var(--fs-caption);
  }

  .dodont {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-lg);
  }

  .dd {
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    padding: var(--space-lg);
    background: var(--surface);
  }

  .dd--do {
    border-top: 3px solid var(--accent);
  }

  .dd--dont {
    border-top: 3px solid var(--danger);
  }

  .dd__label {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0 0 var(--space-sm);
    color: var(--ink);
  }

  .dd ul {
    margin: 0;
    padding-left: 1.1rem;
  }

  .dd li {
    font-size: var(--fs-sm);
    color: var(--ink-2);
    margin-bottom: 0.4rem;
  }

  .examples {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-lg);
  }

  .ex {
    margin: 0;
    border: 1px solid var(--line);
    border-radius: var(--r-control);
    overflow: hidden;
    background: var(--surface);
  }

  .ex__stage {
    display: grid;
    place-items: center;
    min-height: 104px;
    padding: var(--space-md);
    color: var(--ink);
  }

  .ex__stage--dark {
    background: #0f1413;
    color: #eef2ef;
  }

  .ex__stage[style*='stretch'] :global(svg) {
    transform: scaleX(1.9);
  }

  .ex__stage[style*='rotate'] :global(svg) {
    transform: rotate(-14deg);
  }

  .ex__stage[style*='recolour'] {
    color: #c2185b;
  }

  .ex__stage[style*='shadow'] :global(svg) {
    filter: drop-shadow(3px 3px 0 #ff00aa);
  }

  .ex figcaption {
    font-size: var(--fs-caption);
    color: var(--muted);
    padding: var(--space-sm) var(--space-md);
    border-top: 1px solid var(--line);
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  .tag {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-xs);
    white-space: nowrap;
  }

  .tag--bad {
    background: color-mix(in srgb, var(--danger) 16%, transparent);
    color: var(--danger);
  }

  .tag--good {
    background: var(--accent-soft);
    color: var(--accent-ink);
  }

  .swatches {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 var(--space-2xl);
  }

  .swatches li {
    display: grid;
    grid-template-columns: 34px 6.5rem 5.5rem 9rem minmax(0, 1fr);
    gap: var(--space-sm);
    align-items: center;
    padding-block: 0.6rem;
    border-bottom: 1px solid var(--line);
  }

  .swatch {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--line-strong);
  }

  .swatch__name {
    font-size: var(--fs-caption);
    font-weight: 600;
    color: var(--ink);
  }

  .swatch__hex,
  .swatch__token {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    color: var(--muted);
  }

  .swatch__note {
    font-size: var(--fs-caption);
    color: var(--muted);
  }

  .fonts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-lg);
  }

  .font-card {
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    padding: var(--space-lg);
    background: var(--surface);
  }

  .font-card__role {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 var(--space-xs);
  }

  .font-card__name {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--ink);
    margin: 0 0 var(--space-sm);
  }

  .font-card__name.mono {
    font-family: var(--font-mono);
    font-size: 1.25rem;
  }

  .font-card__sample {
    font-size: 2rem;
    color: var(--ink);
    margin: 0 0 var(--space-sm);
    letter-spacing: -0.01em;
  }

  .font-card__sample.mono {
    font-family: var(--font-mono);
  }

  .font-card__meta {
    font-size: var(--fs-caption);
    color: var(--muted);
    margin: 0;
  }

  .scale {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--line);
  }

  .scale li {
    display: grid;
    grid-template-columns: 9rem minmax(0, 1fr) 9rem;
    gap: var(--space-lg);
    align-items: baseline;
    padding-block: var(--space-md);
    border-bottom: 1px solid var(--line);
    color: var(--ink);
  }

  .scale__name {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .scale__sample {
    line-height: 1.15;
    letter-spacing: -0.02em;
    overflow-wrap: anywhere;
  }

  .scale__px {
    font-size: var(--fs-caption);
    color: var(--muted);
    text-align: right;
  }

  @media (max-width: 1000px) {
    .logos,
    .examples {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .logo-dark {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dark-label {
      grid-column: 1 / -1;
      padding-bottom: 0;
    }

    .swatches {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 820px) {
    .grid2,
    .dodont,
    .fonts {
      grid-template-columns: 1fr;
    }

    .scale li {
      grid-template-columns: 1fr;
      gap: 0.3rem;
    }

    .scale__px {
      text-align: left;
    }

    .swatches li {
      grid-template-columns: 34px minmax(0, 1fr);
      row-gap: 0.2rem;
    }

    .swatch__note {
      grid-column: 2;
    }
  }
</style>
