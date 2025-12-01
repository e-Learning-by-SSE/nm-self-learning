import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

// TODO move to database access layer
export async function getCoursesAndSubjects(name: string) {
	return await database.permission.findMany({
		where: {
			accessLevel: "FULL",
			courseId: { not: null },
			group: {
				members: {
					some: {
						user: {
							name
						}
					}
				}
			}
		},
		distinct: ["courseId"], // now it works correctly
		select: {
			accessLevel: true,
			course: { select: { courseId: true, title: true, slug: true } }
		}
	});
}

export type AuthorCoursesAndSubjects = ResolvedValue<typeof getCoursesAndSubjects>;
