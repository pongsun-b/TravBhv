import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { getPosts, getPostPath } from './posts';

// Same cwd assumption as people.ts (cwd is `web/` during build; REPO_ROOT
// env var overrides).
const REPO_ROOT = process.env.REPO_ROOT ?? path.resolve(process.cwd(), '..');

export interface NewsItem {
	/** Display date as written in news.yml, e.g. `8 September 2026`. */
	date: string;
	headline: string;
	note?: string;
	/** ISO date for <time datetime>, parsed from `date`. */
	iso: string;
	/** Jekyll-style URL of the linked post, if any (see news_link.html). */
	postPath?: string;
}

const MONTHS: Record<string, string> = {
	january: '01',
	february: '02',
	march: '03',
	april: '04',
	may: '05',
	june: '06',
	july: '07',
	august: '08',
	september: '09',
	october: '10',
	november: '11',
	december: '12'
};

/** Parse Jekyll-written news dates like `8 September 2026` to `2026-09-08`. */
function toIso(date: string): string {
	const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(date.trim());
	if (!m) return date;
	const month = MONTHS[m[2].toLowerCase()];
	if (!month) return date;
	return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
}

/**
 * News from `_data/news.yml`, with the linked-post resolution of
 * `_includes/news_link.html`: prefer the `note` slug; else the last post
 * published on the same calendar date.
 */
export function getNews(limit?: number): NewsItem[] {
	const raw = fs.readFileSync(path.join(REPO_ROOT, '_data', 'news.yml'), 'utf8');
	const doc = parse(raw) as { items?: { date: string; headline: string; note?: string }[] } | null;
	const posts = getPosts(); // newest first
	const all = (doc?.items ?? []).map((article) => {
		const iso = toIso(article.date);
		const note = (article.note ?? '').trim();
		let linked = note ? posts.find((p) => p.slug === note) : undefined;
		if (!linked) {
			const sameDay = posts.filter((p) => p.date === iso);
			linked = sameDay[sameDay.length - 1];
		}
		return {
			date: article.date,
			headline: article.headline,
			note: article.note,
			iso,
			postPath: linked ? getPostPath(linked) : undefined
		};
	});
	return limit ? all.slice(0, limit) : all;
}
