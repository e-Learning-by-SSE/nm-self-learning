import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
	await createUsers();

	console.log("🌱 Database has been seeded! 🌱");
}

seed()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function createUsers(): Promise<void> {
	await prisma.user.deleteMany();
	const users: User[] = [
		{ id: "potter", displayName: "Harry Potter" },
		{ id: "weasley", displayName: "Ronald Weasley" }
	];

	for (const user of users) {
		await prisma.user.create({
			data: user
		});
	}
}
