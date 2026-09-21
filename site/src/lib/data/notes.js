/**
 * Long-form notes.
 *
 * These carry the full text of the group's writing from the previous site, which published them as
 * posts under /notes/. The new site reduced them to one-line summaries on /news/ and /research/;
 * the originals are kept here in full and each note has its own page.
 *
 * `body` is authored HTML rendered with {@html}. Nothing here comes from user input.
 */

const link = (href, text) => `<a href="${href}">${text}</a>`;

export const notes = [
  {
    slug: 'primal-and-dual-walk-access',
    title: 'Primal and dual walk access',
    date: '2026-09-12',
    display: '12 September 2026',
    summary:
      'The Access map default view answers a dual question: how many minutes is the walk to the nearest urban-rail station? That is the cost of reaching one opportunity.',
    body: `
<p>The Access map&rsquo;s default view answers a dual question: <strong>how many minutes is the walk to the nearest urban-rail station?</strong> That is the cost of reaching one opportunity.</p>
<p>Cui and Levinson (2020) distinguish that from <strong>primal</strong> access: fix the cost, count the opportunities. On this map the cost is a 15-minute walk at 4.0 km/h, and the opportunities are urban-rail stations, not jobs. The layer <em>Stations in 15 min</em> colours a cell by how many stations sit inside that walk &mdash; 0, 1, 2, 3, or 4 and more. The two views are complements. A place 6 minutes from one station and a place 6 minutes from four stations look the same on the default map; they do not on the primal layer.</p>
<p>Interchanges (Siam, Tao Poon, Lak Si) rise on primal because more than one station is walkable. A single-line suburb can look fine on dual (the nearest station is close) and thin on primal (there is only that one). Red on primal is the same statement as red on dual at 15 minutes: no urban-rail station is within a 15-minute walk.</p>
<p>This is still first-mile walk access. It is not Hansen job access, and it is not the ${link('/notes/access-compared-with-ptai/', 'Public Transport Accessibility Index')}, which uses demand-weighted generalised cost across 88 subdistricts. Speed options stay on the dual layer; primal is computed once at 4.0 km/h from the per-station 15-minute polygons.</p>
<p class="cite">Cui, M., and Levinson, D. (2020). Primal and Dual Access. <em>Geographical Analysis</em> 52(3), 452&ndash;474. <a href="https://doi.org/10.1111/gean.12220">doi:10.1111/gean.12220</a>. ${link('/access/', 'Open the map')}.</p>
`
  },
  {
    slug: 'access-compared-with-ptai',
    title: 'Access compared with PTAI',
    date: '2026-09-08',
    display: '8 September 2026',
    summary:
      'The lab has two access measures that are easy to mix up. They answer different questions, on different networks, and only one of them can be published as a map on this site.',
    body: `
<p>The lab has two access measures that are easy to mix up. They answer different questions, on different networks, and only one of them can be published as a map on this site.</p>
<div class="table-scroll" role="region" aria-label="Walk access compared with PTAI" tabindex="0">
<table class="data-table">
  <thead>
    <tr><th scope="col"></th><th scope="col">Walk access (<code>/access/</code>)</th><th scope="col">PTAI</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Question</th><td>How far is the walk to urban rail?</td><td>Why is generalized travel cost high?</td></tr>
    <tr><th scope="row">Geography</th><td>50 Bangkok districts, plus neighbouring districts that contain a selected station</td><td>88 inner-Bangkok subdistricts (khwaeng)</td></tr>
    <tr><th scope="row">Network</th><td>OpenStreetMap walk graph, from station <em>exits</em></td><td>Transit routing used in the lab paper (evening peak)</td></tr>
    <tr><th scope="row">Output</th><td>5 / 10 / 15 minute isochrones at 4.0 km/h</td><td>Demand-weighted index (inverse of generalized cost)</td></tr>
    <tr><th scope="row">On this site</th><td>${link('/access/', 'Interactive map')} and ${link('/data/', 'GeoJSON')}</td><td>Related work only. Routing legs cannot be republished.</td></tr>
  </tbody>
</table>
</div>
<p>Walk access will paint a park red because OSM has no footpath through it. PTAI can show a khwaeng as costly because the bus is slow, the fare is high, or the wait is long &mdash; even if a station is nearby as the crow flies. Neither is a verdict on &ldquo;this place is inaccessible&rdquo; without the other.</p>
<p>Use the map when the question is first-mile walking. Use PTAI (on request, with a name and an intended use) when the question is generalized cost across modes. Method for the map: ${link('/notes/walk-access-to-urban-rail/', 'Walk access to urban rail')}.</p>
`
  },
  {
    slug: 'walk-access-to-urban-rail',
    title: 'Walk access to urban rail',
    date: '2026-09-08',
    display: '8 September 2026',
    summary:
      'The first-mile map asks one question: how far is the walk to the nearest urban-rail exit in Bangkok, on the street network, at a typical walking speed.',
    body: `
<p>The group&rsquo;s first-mile map asks one question: how far is the walk to the nearest urban-rail <em>exit</em> in Bangkok, on the street network, at a typical walking speed.</p>
<p>That is not &ldquo;as the crow flies,&rdquo; and it is not a realtor&rsquo;s 5 km/h circle. The default is <strong>4.0 km/h</strong> (67 m/min) &mdash; a pace that is plausible in heat. Slow (3.6) and brisk (4.5) are precomputed layers, not a live router. At 4.0 km/h, five minutes is 333 m on the network, ten minutes 667 m, fifteen minutes 1 km.</p>
<p>Origins are station exits from OpenStreetMap (<code>railway=subway_entrance</code> and entrance nodes), not the station centroid. If OSM has no exit, the station node is used &mdash; which makes some stations look worse than they are. Isochrones are unioned per station, then across the city. White is under 5 minutes, gold 5&ndash;10, orange 10&ndash;15, red beyond 15. Parks, rivers, and expressway boxes stay red when they have no walkable OSM edge.</p>
<p>The default layer is operating urban rail: BTS Sukhumvit, Silom, and Gold; MRT Blue, Purple, Yellow, and Pink; Airport Rail Link; SRT Dark Red and Light Red. An optional toggle adds Chao Phraya and canal boat piers. Conventional long-distance SRT and unopened Orange are out.</p>
<p>The study area is all 50 Bangkok districts, plus districts in Nonthaburi, Samut Prakan, and Pathum Thani that contain a selected station. GeoJSON and a 16:9 poster are on ${link('/data/', 'Data')}. Cite TBRG and OpenStreetMap contributors.</p>
<p>This map is the walk to rail. It is not the Public Transport Accessibility Index (PTAI), which is a demand-weighted generalized-cost index for 88 inner-Bangkok subdistricts. ${link('/notes/access-compared-with-ptai/', 'Access compared with PTAI')} is the short comparison. ${link('/access/', 'Open the map')}.</p>
`
  },
  {
    slug: 'highway-safety-collaboration',
    title: 'Highway safety collaboration with HTOC and KMITL',
    date: '2024-05-05',
    display: '5 May 2024',
    summary:
      'We collaborated with HTOC and KMITL on working to increase highway safety in Thailand.',
    body: `
<p>We collaborated with HTOC and KMITL on working to increase highway safety in Thailand.</p>
`
  },
  {
    slug: 'the-group-is-underway',
    title: 'The group is underway',
    date: '2023-10-01',
    display: '1 October 2023',
    summary: 'It is officially all starting.',
    body: `
<p>It is officially all starting.</p>
<p>The Travel Behavior Research Group sits in the Department of Civil Engineering at Chulalongkorn University. This post marks the public start of the group site.</p>
`
  }
];

export const noteBySlug = (slug) => notes.find((n) => n.slug === slug);
