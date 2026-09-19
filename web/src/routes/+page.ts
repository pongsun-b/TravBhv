import { getFaculty, visiblePeople } from '$lib/data/people';
import { getNews } from '$lib/data/news';

export function load() {
	return {
		faculty: visiblePeople(getFaculty()),
		news: getNews(9)
	};
}
