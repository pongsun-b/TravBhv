import { error } from '@sveltejs/kit';
import { notes, noteBySlug } from '$lib/data/notes.js';

/** Enumerate every note so each one is prerendered to its own folder. */
export const entries = () => notes.map((note) => ({ slug: note.slug }));

export function load({ params }) {
  const note = noteBySlug(params.slug);
  if (!note) error(404, 'That note does not exist.');
  return { note };
}
