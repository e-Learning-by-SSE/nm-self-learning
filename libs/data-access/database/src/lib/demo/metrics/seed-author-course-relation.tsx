import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAuthorCourseRelation(courseIds: string[]) {
	try {
		// Assign Albus Dumbledore (id: 6) to all courses from CourseIds
		for (const courseId of courseIds) {
			await prisma.course.update({
				where: { courseId },
				data: { authors: { connect: { id: 6 } } }
			});
		}

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Author-Course Relation");
	} catch (error) {
		console.error("Error creating author-course relation:", error);
	} finally {
		await prisma.$disconnect();
	}
}
