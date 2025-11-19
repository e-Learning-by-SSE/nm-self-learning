import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

// TODO move to database access layer
export async function getCoursesAndSubjects(name: string) {
	return await database.user.findUnique({
		where: { name },
		select: {
			memberships: {
				select: {
					group: {
						select: {
							name: true,
							permissions: {
								where: { courseId: { not: null }, accessLevel: "FULL" },
								select: {
									accessLevel: true,
									course: { select: { courseId: true, title: true, slug: true } }
									// lesson: { select: { lessonId: true, title: true, slug: true } }
								}
							}
						}
					}
				}
			}
		}
	});
}

export type AuthorCoursesAndSubjects = ResolvedValue<typeof getCoursesAndSubjects>;
