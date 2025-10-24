import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function assignDumbledoreAsAuthor() {
	console.log("\x1b[94m%s\x1b[0m", "Assigning Dumbledore as author for magical-test-course...");

	try {
		// Fetch author and course in parallel
		const [dumbledore, course] = await Promise.all([
			prisma.author.findUnique({ where: { slug: "albus-dumbledore" } }),
			prisma.course.findUnique({ where: { courseId: "magical-test-course" } })
		]);

		if (!dumbledore || !course) {
			console.error(
				!dumbledore
					? "Author 'albus-dumbledore' not found."
					: "Course 'magical-test-course' not found."
			);
			return;
		}

		await prisma.course.update({
			where: { courseId: "magical-test-course" },
			data: { authors: { connect: { id: dumbledore.id } } }
		});

		console.log("🪄 Dumbledore successfully assigned as author to 'magical-test-course'.");
	} catch (error) {
		console.error(
			"Error assigning Dumbledore as author:",
			error instanceof Error && error.stack ? error.stack : error
		);
	} finally {
		try {
			await prisma.$disconnect();
		} catch (disconnectError) {
			console.error("Error during Prisma disconnect:", disconnectError);
		}
	}
}
