export const researchIntro = {
  kicker: 'How movement becomes evidence',
  lede: 'The lab sits in the Transportation Engineering division of the Department of Civil Engineering at Chulalongkorn University. Work runs from travel decisions outward: surveys and models of how people move, then engineering and planning that can act on that evidence.'
};

export const facultyInterests = [
  'Logistics and supply-chain management',
  'Sustainable urban development',
  'Transportation economics and policy',
  'Multi-regional input-output analysis',
  'Spatial computable general equilibrium modelling'
];

export const walkAccessFeature = {
  title: 'First-mile walk access',
  summary:
    'Network isochrones from station exits on the OpenStreetMap walk graph: 5, 10 and 15 minutes at a typical 4.0 km/h, with river and canal boat piers as an extra layer.',
  image: '/media/walk-access-16x9.jpg',
  imageAlt:
    'Map of Bangkok walk access to urban rail at a typical 4.0 km/h: white under 5 minutes, gold 5 to 10, orange 10 to 15, red beyond 15.',
  caption: 'Walk access to urban rail: 5, 10 and 15 minutes from a station exit at a typical 4.0 km/h.'
};

export const ptaNote =
  'A related lab project, the Public Transport Accessibility Index (PTAI), measures demand-weighted generalized travel cost across 88 inner-Bangkok subdistricts. The walk-access map is the walk to rail, not that index.';

// How the walk-access layers are constructed. Kept as structured data so the
// same explanation can render on the Research page and the Data page.
export const walkAccessMethod = [
  {
    term: 'Origins',
    detail:
      'Station exits (OSM subway entrances), not the station centroid. If no exit is mapped, the station node is used.'
  },
  {
    term: 'Network',
    detail:
      'OpenStreetMap walk graph. Default speed 4.0 km/h (67 m/min), a typical walk in Bangkok heat rather than the 5 km/h realtor figure. Slow 3.6 km/h and brisk 4.5 km/h are precomputed. At 4.0 km/h, 5 minutes is 333 m on the network, 10 minutes is 667 m, 15 minutes is 1 km.'
  },
  {
    term: 'Unions',
    detail:
      'Isochrone per exit, unioned by station, then across all stations. White is under 5 minutes, gold is 5 to 10, orange is 10 to 15, red is the study area beyond 15.'
  },
  {
    term: 'Primal and dual',
    detail:
      'Cui and Levinson (2020): primal counts opportunities inside a cost threshold, dual is the cost to reach a given number of them. The default map is dual access to one station, the minutes to the nearest. Stations in 15 min counts how many urban-rail stations sit inside a 15-minute walk at 4.0 km/h. Stations are the opportunities, not jobs. Speed does not apply to that layer.'
  },
  {
    term: 'Study area',
    detail:
      'All 50 Bangkok districts, plus districts in Nonthaburi, Samut Prakan, and Pathum Thani that contain a selected station.'
  },
  {
    term: 'Lines',
    detail:
      'Default is urban rail: BTS Sukhumvit, Silom, and Gold; MRT Blue, Purple, Yellow, and Pink; Airport Rail Link; SRT Dark Red and Light Red. An optional toggle adds Chao Phraya and canal boat piers. Not conventional SRT and not the unopened Orange line.'
  },
  {
    term: 'Limits',
    detail:
      'Parks, rivers, and expressway boxes stay red when they have no walkable OSM edges. Missing exits in OSM make some stations look worse than they are. Speed options are precomputed layers, not a live router.'
  }
];
