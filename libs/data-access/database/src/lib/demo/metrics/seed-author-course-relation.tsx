import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAuthorCourseRelation(courseIds: string[]) {
	try {
		// Assign the demo author to all courses (use a stable unique field instead of a hard-coded id).
		for (const courseId of courseIds) {
			await prisma.course.update({
				where: { courseId },
				data: { authors: { connect: { username: "dumbledore" } } }
			});
		}

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Author-Course Relation");
	} catch (error) {
		console.error("Error creating author-course relation:", error);
	} finally {
		await prisma.$disconnect();
	}
}
