import { notes } from './notes.js';

export const news = [
  {
    date: '2026-09-08',
    display: '8 September 2026',
    title: 'Walk-access map to urban rail is live: 5, 10 and 15 minutes at a typical 4.0 km/h walk.',
    href: '/access/'
  },
  {
    date: '2024-05-05',
    display: '5 May 2024',
    title: 'We collaborated with HTOC and KMITL on working to increase highway safety in Thailand.',
    href: '/notes/highway-safety-collaboration/'
  },
  {
    date: '2023-10-01',
    display: '1 October 2023',
    title: 'It is officially all starting.',
    href: '/notes/the-group-is-underway/'
  }
];

/**
 * The Notes feed shown on /news/ and /research/. The full text lives in notes.js; these are the
 * one-line summaries that point at it, so both views share a single source of truth.
 */
export const researchNotes = notes.map(({ slug, title, date, display, summary }) => ({
  slug,
  title,
  date,
  display,
  summary
}));
