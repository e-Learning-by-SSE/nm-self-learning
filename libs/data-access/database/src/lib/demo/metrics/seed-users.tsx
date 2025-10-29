import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createUsers() {
	try {
		const userData = [
			{
				id: "user-1",
				name: "luna",
				displayName: "Luna Lovegood"
			},
			{
				id: "user-2",
				name: "hermione",
				displayName: "Hermione Granger"
			},
			{
				id: "user-3",
				name: "draco",
				displayName: "Draco Malfoy"
			},
			{
				id: "user-4",
				name: "severus",
				displayName: "Severus Snape"
			},
			{
				id: "user-5",
				name: "sirius",
				displayName: "Sirius Black"
			},
			{
				id: "user-6",
				name: "remus",
				displayName: "Remus Lupin"
			},
			{
				id: "user-7",
				name: "neville",
				displayName: "Neville Longbottom"
			},
			{
				id: "user-8",
				name: "ginny",
				displayName: "Ginny Weasley"
			},
			{
				id: "user-9",
				name: "fred",
				displayName: "Fred Weasley"
			},
			{
				id: "user-10",
				name: "george",
				displayName: "George Weasley"
			},
			{
				id: "user-11",
				name: "Crabbe",
				displayName: "Vincent Crabbe"
			}
		];

		await prisma.user.createMany({ data: userData });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Users");

		return userData;
	} catch (error) {
		console.error("Error creating users:", error);
	} finally {
		await prisma.$disconnect();
	}
	return [];
}
