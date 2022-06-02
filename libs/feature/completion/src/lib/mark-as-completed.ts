import { database } from "@self-learning/database";

export async function markAsCompleted({
	lessonId,
	username
}: {
	lessonId: string;
	username: string;
}) {
	return database.completedLesson.create({
		data: {
			lessonId,
			username
		},
		select: {
			createdAt: true,
			username: true,
			lessonId: true,
			lesson: {
				select: {
					lessonId: true,
					title: true,
					slug: true
				}
			}
		}
	});
}
