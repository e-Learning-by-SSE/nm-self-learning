import { CourseType } from "@prisma/client";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

export type CourseData = ResolvedValue<typeof getCourseData>;

// content is the outline for forUsername: the personal path when one exists,
// otherwise the stored default path. isGenerated and isStale describe that personal path.
// "Generieren" reloads the page, which reads these fields again.
export async function getCourseData(slug: string, forUsername?: string) {
	const course = await database.course.findUnique({
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
	if (!course) {
		return null;
	}

	const path = course.generatedLessonPaths?.at(0);
	const isDynamic = course.type === CourseType.DYNAMIC;
	// Personal path when this student has one, otherwise the stored default path.
	const content = isDynamic ? (path?.content ?? course.content) : course.content;

	return {
		...course,
		content,
		isGenerated: isDynamic && !!path,
		isStale: !!path && path.courseVersion !== course.version
	};
}
