import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function assignDumbledoreAsAuthor() {
	console.log("\x1b[94m%s\x1b[0m", "Assigning Dumbledore as author for magical-test-course...");

	try {
		// Find Dumbledore's author profile
		const dumbledore = await prisma.author.findFirst({
			where: { slug: "albus-dumbledore" }
		});

		if (!dumbledore) {
			console.error("Author 'albus-dumbledore' not found.");
			return;
		}

		// Find the magical course
		const course = await prisma.course.findUnique({
			where: { courseId: "magical-test-course" }
		});

		if (!course) {
			console.error("Course 'magical-test-course' not found.");
			return;
		}

		// Connect Dumbledore as author to the course
		await prisma.course.update({
			where: { courseId: "magical-test-course" },
			data: {
				authors: {
					connect: { id: dumbledore.id }
				}
			}
		});

		console.log("🪄 Dumbledore successfully assigned as author to 'magical-test-course'.");
	} catch (error) {
		console.error("Error assigning Dumbledore as author:", error);
	} finally {
		await prisma.$disconnect();
	}
}
