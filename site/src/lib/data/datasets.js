export const dataset = {
  title: 'Walk access to urban rail',
  summary:
    'Isochrones, station exits, khet boundaries, and a 16:9 poster for the walk-access map. Built from OpenStreetMap (ODbL). Default walk 4.0 km/h, plus 3.6 and 4.5. Optional Chao Phraya and canal boat piers.',
  poster: '/media/walk-access-16x9.jpg',
  files: [
    {
      name: 'classes.geojson',
      detail: 'Default rail at 4.0 km/h, classified under 5 / 5-10 / 10-15 / over 15 minutes'
    },
    { name: 'classes_36.geojson', detail: 'Same classes at 3.6 km/h' },
    { name: 'classes_45.geojson', detail: 'Same classes at 4.5 km/h' },
    { name: 'classes_all_40.geojson', detail: 'Rail plus river and canal boat piers' },
    { name: 'feeders.geojson', detail: 'Boat piers' },
    { name: 'stations.geojson', detail: 'Urban-rail station points' },
    { name: 'khet.geojson', detail: 'District boundaries' },
    { name: 'rail.geojson', detail: 'Urban-rail alignments' },
    { name: 'station_iso.geojson', detail: 'Per-station 10 and 15 minute polygons' },
    {
      name: 'primal_15.geojson',
      detail: 'Count of stations inside a 15-minute walk at 4.0 km/h (Cui-Levinson primal)'
    },
    { name: 'meta.json', detail: 'Speed, date, and station count' },
    { name: 'access-16x9.png', detail: '16:9 poster' }
  ],
  citation:
    'Travel Behavior Research Group, Chulalongkorn University, walk-access isochrones to urban rail (Bangkok), plus OpenStreetMap contributors.'
};

/* Real values, copied from access-data/meta.json published with the dataset. */
export const accessMeta = {
  stations: 165,
  exits: 557,
  feeders: 192,
  walkSpeedKmh: 4.0,
  walkSpeedsKmh: [3.6, 4.0, 4.5],
  cutoffsMin: [5, 10, 15],
  edgeBufferM: 40,
  osmPulled: '2 September 2026',
  crs: 'EPSG:4326',
  study:
    'BMA 50 districts plus adjacent station districts in Nonthaburi, Samut Prakan and Pathum Thani',
  lines:
    'BTS Sukhumvit, Silom and Gold; MRT Blue, Purple, Yellow and Pink; Airport Rail Link; SRT Dark Red and Light Red'
};

export const dataPolicy = [
  {
    term: 'Privacy',
    detail: 'Personal and sensitive fields are removed or anonymized before any share.'
  },
  { term: 'Documentation', detail: 'Shared files come with enough context to reuse them.' },
  { term: 'Formats', detail: 'Machine-readable where possible.' },
  { term: 'Citation', detail: 'Use the paper or the dataset citation sent with the files.' }
];
