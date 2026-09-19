import { getAlumni, getFaculty, getStudents, visiblePeople } from '$lib/data/people';

export function load() {
	return {
		faculty: visiblePeople(getFaculty()),
		students: visiblePeople(getStudents()),
		alumni: visiblePeople(getAlumni())
	};
}
