import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

export async function getCoursesAndSubjects(username: string) {
	return await database.author.findUnique({
		where: { username },
		select: {
			subjectAdmin: {
				select: {
					subject: {
						select: {
							title: true,
							slug: true,
							courses: {
								select: {
									title: true,
									slug: true,
									courseId: true
								}
							}
						}
					}
				}
			},
			specializationAdmin: {
				select: {
					specialization: {
						select: {
							title: true,
							courses: {
								select: {
									title: true,
									slug: true,
									courseId: true
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
