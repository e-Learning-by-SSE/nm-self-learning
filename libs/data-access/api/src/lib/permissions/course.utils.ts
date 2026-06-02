import { database } from "@self-learning/database";
import { TRPCError } from "@trpc/server";

export async function getCourseResource(slug: string) {
	const course = await database.course.findUnique({
		where: { slug },
		select: { courseId: true }
	});
	if (!course) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: `Course not found for slug: ${slug}`
		});
	}
	return course;
}
