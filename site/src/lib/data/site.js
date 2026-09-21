export const site = {
  name: 'ALIS',
  fullName: 'Transportation Behavior Lab',
  tagline: 'How a city moves, one decision at a time.',
  description:
    'ALIS is the Transportation Behavior Lab. We study how people move through Bangkok and what those choices mean for transport systems, planning, and policy.',
  affiliation: {
    dept: 'Department of Civil Engineering',
    university: 'Chulalongkorn University',
    deptUrl: 'https://civil.eng.chula.ac.th/web/',
    universityUrl: 'https://www.chula.ac.th/'
  },
  contact: {
    email: 'Pongsun.B@chula.ac.th',
    phone: '0-2218-7857',
    address: ['254 Phayathai Rd', 'Pathumwan, Bangkok 10330', 'Thailand', 'CE Building, Room 527'],
    mapUrl: 'https://maps.app.goo.gl/Z5wdK469MZw9jFod9',
    scholar: 'https://scholar.google.com/citations?hl=en&user=oLV6IeQAAAAJ'
  },
  nav: [
    { label: 'Research', href: '/research/' },
    { label: 'About', href: '/about/' },
    { label: 'People', href: '/people/' },
    { label: 'Publications', href: '/publications/' },
    { label: 'Data', href: '/data/' },
    { label: 'Access', href: '/access/' },
    { label: 'Simulator', href: '/simulator/' },
    { label: 'News', href: '/news/' }
  ],
  /* Routes that exist but sit one level down in the navigation. */
  secondaryNav: [
    { label: 'Projects', href: '/projects/' },
    { label: 'Contact and join', href: '/contact/' },
    { label: 'Brand guide', href: '/brand/' }
  ],
  cta: { label: 'Contact', href: '/contact/' }
};

export const labWork = [
  {
    id: 'transportation-engineering',
    title: 'Transportation engineering',
    summary:
      'Safe, efficient movement of people and goods, and the systems that carry that movement.'
  },
  {
    id: 'travel-behavior',
    title: 'Travel behavior surveys and analysis',
    summary: 'Mode, time, purpose, and the preferences behind those choices.'
  },
  {
    id: 'transportation-planning',
    title: 'Transportation planning',
    summary: 'What the network needs next, from current use to future demand.'
  },
  {
    id: 'first-mile-access',
    title: 'First-mile walk access',
    summary:
      'Network isochrones from station exits on the OpenStreetMap walk graph: 5, 10 and 15 minutes at a typical 4.0 km/h, with river and canal boat piers as an extra layer.',
    href: '/access/'
  }
];
