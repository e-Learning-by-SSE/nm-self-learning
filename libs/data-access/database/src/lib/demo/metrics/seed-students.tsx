import { PrismaClient } from "@prisma/client";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createStudents() {
	try {
		const studentsData = usersRaw.map(user => {
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
