import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

export type CourseData = ResolvedValue<typeof getCourseData>;

export async function getCourseData(slug: string, forUsername?: string) {
	return await database.course.findUnique({
		where: { slug },
		select: {
			courseId: true,
			title: true,
			subtitle: true,
			authors: {
				select: {
					displayName: true,
					slug: true,
					imgUrl: true
				}
			},
			createdAt: true,
			updatedAt: true,
			slug: true,
			description: true,
			imgUrl: true,
			subjectId: true,
			meta: true,
			content: true,
			type: true,
			version: true,

			specializations: {
				select: {
					specializationId: true,
					title: true
				}
			},
			...(forUsername
				? {
						generatedLessonPaths: {
							where: {
								username: forUsername
							},
							select: {
								content: true,
								meta: true,
								courseVersion: true
							},
							orderBy: {
								createdAt: "desc"
							},
							take: 1
						}
					}
				: {})
		}
	});
}
