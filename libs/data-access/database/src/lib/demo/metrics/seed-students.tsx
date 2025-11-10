import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createStudents(userData: { id: string; name: string }[]) {
	try {
		const studentsData = userData.map(user => {
			return {
				userId: user.id,
				username: user.name
			};
		});

		await prisma.student.createMany({ data: studentsData });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Students");
	} catch (error) {
		console.error("Error creating students:", error);
	} finally {
		await prisma.$disconnect();
	}
}
