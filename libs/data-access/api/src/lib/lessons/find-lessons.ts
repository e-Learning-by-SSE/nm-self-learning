import { database } from "@self-learning/database";

export function findLessons(title?: unknown) {
	return database.lesson.findMany({
		select: {
			lessonId: true,
			title: true,
			slug: true,
			authors: {
				select: {
					displayName: true
				}
			}
		},
		where: {
			title:
				typeof title === "string" && title.length > 0
					? { contains: title, mode: "insensitive" }
					: undefined
		},
		take: 10
	});
}

export type FindLessonsResponse = ResolvedValue<typeof findLessons>;
