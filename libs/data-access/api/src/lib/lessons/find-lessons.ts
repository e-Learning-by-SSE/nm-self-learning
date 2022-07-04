import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";

export async function findLessons({
	title,
	skip,
	take
}: {
	title?: string;
	skip?: number;
	take?: number;
}) {
	const where: Prisma.LessonWhereInput = {
		title:
			typeof title === "string" && title.length > 0
				? { contains: title, mode: "insensitive" }
				: undefined
	};

	const [lessons, count] = await Promise.all([
		database.lesson.findMany({
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
			where,
			take,
			skip
		}),
		database.lesson.count({
			where
		})
	]);

	return { lessons, count };
}

export type FindLessonsResponse = ResolvedValue<typeof findLessons>;
