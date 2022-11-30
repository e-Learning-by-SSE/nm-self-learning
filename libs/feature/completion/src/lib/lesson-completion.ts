import { database } from "@self-learning/database";
import { endOfWeek, startOfWeek } from "date-fns";

/**
 * Returns an object that contains the subset of completed lessons as keys.
 * @example
 * const completed = await checkLessonCompletion(username, ["lesson-1", "lesson-2", "lesson-3"]);
 * // completed = { "lesson-1": true, "lesson-2": true }
 */
export async function checkLessonCompletion(
	username: string,
	lessonIds: string[]
): Promise<{ [lessonId: string]: true }> {
	const completedLessons = await database.completedLesson.findMany({
		select: {
			lessonId: true
		},
		where: {
			AND: {
				username,
				lessonId: { in: lessonIds }
			}
		},
		orderBy: { createdAt: "asc" },
		distinct: ["lessonId"]
	});

	const completedLessonsById: { [lessonId: string]: true } = {};

	for (const lesson of completedLessons) {
		completedLessonsById[lesson.lessonId] = true;
	}

	const result: { [lessonId: string]: true } = {};

	for (const id of lessonIds) {
		if (id in completedLessonsById) {
			result[id] = true;
		}
	}

	return result;
}

export async function getCompletedLessonsThisWeek(username: string, dateNow: number) {
	return database.completedLesson.findMany({
		select: {
			createdAt: true,
			course: {
				select: {
					title: true,
					slug: true
				}
			},
			lesson: {
				select: {
					lessonId: true,
					title: true,
					slug: true
				}
			}
		},
		where: {
			AND: {
				username,
				createdAt: {
					gte: startOfWeek(dateNow, { weekStartsOn: 1 }),
					lte: endOfWeek(dateNow, { weekStartsOn: 1 })
				}
			}
		}
	});
}
