import { PrismaClient } from "@prisma/client";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createUsers() {
	try {
		await prisma.user.createMany({ data: usersRaw });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Users");
	} catch (error) {
		console.error("Error creating users:", error);
	} finally {
		await prisma.$disconnect();
	}
}
