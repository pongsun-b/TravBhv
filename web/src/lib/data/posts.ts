import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Same cwd assumption as people.ts: the working directory is `web/` during
// dev/build, so the Jekyll posts live one level up. Override with REPO_ROOT.
const REPO_ROOT = process.env.REPO_ROOT ?? path.resolve(process.cwd(), '..');
const POSTS_DIR = path.join(REPO_ROOT, '_posts');

export interface Post {
	/** Filename minus the `YYYY-MM-DD-` prefix, e.g. `walk-access-map`. */
	slug: string;
	title: string;
	/** ISO-ish date string, from the filename (front-matter date if parseable). */
	date: string;
	/** Remaining front matter (theme, layout, ...) as-is. */
	meta: Record<string, unknown>;
	/** Body rendered to HTML by marked. */
	html: string;
}

// Jekyll post filenames: YYYY-MM-DD-slug.md
const FILENAME_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

let cache: Post[] | null = null;

function loadAll(): Post[] {
	if (cache) return cache;
	const posts: Post[] = [];
	for (const file of fs.readdirSync(POSTS_DIR)) {
		const m = FILENAME_RE.exec(file);
		if (!m) continue;
		const [, date, slug] = m;
		const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
		const { data, content } = matter(raw);
		const fmDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : undefined;
		posts.push({
			slug,
			title: typeof data.title === 'string' ? data.title : slug,
			date: fmDate ?? date,
			meta: data,
			html: marked.parse(content, { async: false })
		});
	}
	// Newest first.
	posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
	cache = posts;
	return posts;
}

export function getPosts(): Post[] {
	return loadAll();
}

export function getPost(slug: string): Post | undefined {
	return loadAll().find((p) => p.slug === slug);
}
