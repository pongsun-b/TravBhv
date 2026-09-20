import { getAlumni, getStudents, visiblePeople } from '$lib/data/people';

export function load() {
	return {
		students: visiblePeople(getStudents()),
		alumni: visiblePeople(getAlumni())
	};
}
