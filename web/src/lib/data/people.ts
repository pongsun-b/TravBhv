import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// Path assumption: the current working directory is `web/` whenever this code
// runs (vite dev / vite build / prerender all execute from the package root),
// so the Jekyll data lives one level up. If you ever run the build from the
// repo root instead, set REPO_ROOT=. in the environment.
const REPO_ROOT = process.env.REPO_ROOT ?? path.resolve(process.cwd(), '..');
const DATA_DIR = path.join(REPO_ROOT, '_data');

export interface Faculty {
	name: string;
	thai?: string;
	photo?: string;
	info?: string;
	email?: string;
	office?: string;
	phone?: string;
	scholar?: string;
	researchgate?: string;
	department_page?: string;
	bio?: string;
	education?: string[];
	interests?: string[];
}

export interface Student {
	name: string;
	email?: string;
	photo?: string;
	research?: string;
}

export interface Alumnus {
	name: string;
	year?: number;
	research?: string;
	thesis?: string;
}

function readItems<T>(file: string): T[] {
	const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
	const doc = parse(raw) as { items?: T[] } | null;
	return doc?.items ?? [];
}

/** Replicates the Jekyll placeholder rule in _includes/person_flags.html. */
export function isPlaceholder(member: { name?: string; email?: string }): boolean {
	const name = (member.name ?? '').trim();
	const email = (member.email ?? '').toLowerCase().trim();
	if (name === '') return true;
	if (email.includes('xxxxx')) return true;
	const tokens = name.split(/\s+/);
	const last = tokens[tokens.length - 1];
	if (last === 'X' || last === 'x') return true;
	return false;
}

/** Items that should be shown on the site (drops placeholders). */
export function visiblePeople<T extends { name?: string; email?: string }>(items: T[]): T[] {
	return items.filter((m) => !isPlaceholder(m));
}

export function getFaculty(): Faculty[] {
	return readItems<Faculty>('team_members.yml');
}

export function getStudents(): Student[] {
	return readItems<Student>('students.yml');
}

export function getAlumni(): Alumnus[] {
	return readItems<Alumnus>('alumni.yml');
}
