import { PrismaClient } from "@prisma/client";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createStudents() {
	console.log("\x1b[94m%s\x1b[0m", "Creating students...");

	try {
		const studentsData = usersRaw.map(user => {
			return {
				userId: user.id,
				username: user.name
			};
		});

		await prisma.student.createMany({ data: studentsData });

		console.log("Students successfully created.");
	} catch (error) {
		console.error("Error creating students:", error);
	} finally {
		await prisma.$disconnect();
	}
}
