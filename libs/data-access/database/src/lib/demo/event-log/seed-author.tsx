import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function assignDumbledoreAsAuthor() {
	console.log("\x1b[94m%s\x1b[0m", "Assigning Dumbledore as author for all test courses...");

	try {
		const dumbledore = await prisma.author.findFirst({
			where: { slug: "albus-dumbledore" }
		});

		if (!dumbledore) {
			console.error("Author 'albus-dumbledore' not found.");
			return;
		}

		const courseIds = [
			"magical-test-course",
			"advanced-potion-brewing",
			"defense-against-dark-arts",
			"history-of-magic"
		];

		// Connect Dumbledore as author to the course
		await prisma.course.update({
			where: { courseId: "magical-test-course" },
			data: {
				authors: {
					connect: { id: dumbledore.id }
				}
			}
		});

		console.log("🪄 Dumbledore successfully assigned as author to all test courses.");
	} catch (error) {
		console.error("Error assigning Dumbledore as author:", error);
	} finally {
		await prisma.$disconnect();
	}
}
