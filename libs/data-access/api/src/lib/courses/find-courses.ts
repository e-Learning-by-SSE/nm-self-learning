import { database } from "@self-learning/database";

export async function findCourses(title?: string) {
	return database.course.findMany({
		include: {
			authors: true,
			subject: true
		},
		where: {
			title: title ? { contains: title, mode: "insensitive" } : undefined
		}
	});
}

export type FindCoursesResponse = Awaited<ReturnType<typeof findCourses>>;
