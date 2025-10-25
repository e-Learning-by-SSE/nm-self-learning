import { PrismaClient } from "@prisma/client";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createUsers() {
	console.log("\x1b[94m%s\x1b[0m", "Creating users...");

	try {
		await prisma.user.createMany({ data: usersRaw });

		console.log("Users successfully created.");
	} catch (error) {
		console.error("Error creating users:", error);
	} finally {
		await prisma.$disconnect();
	}
}
