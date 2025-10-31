import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

import { createUsers, deleteUsers } from "../helper";

let users: User[];

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE

beforeAll(async () => {
	users = await createUsers(["user_learning_time"]);

	await prisma.eventLog.createMany({
		data: [
			{
				username: users[0].name,
				createdAt: new Date("2024-01-01T10:00:00Z"),
				type: "login"
			},
			{
				username: users[0].name,
				createdAt: new Date("2024-01-01T10:30:00Z"),
				type: "logout"
			}
		]
	});
});

afterAll(async () => {
	// Clean up created data in reverse order
	await prisma.eventLog.deleteMany({
		where: {
			username: users[0].name
		}
	});

	await deleteUsers(users);

	await prisma.$disconnect();
});

test("should return learning time for student", async () => {
	const result = await prisma.studentMetric_LearningTime.findUnique({
		where: { userId: users[0].id }
	});

	console.log("Learning Time Result:", result);

	expect(result).not.toBeNull();
	expect(result?.userId).toBe(users[0].id);
	expect(result?.username).toBe(users[0].name);
	expect(result?.timeSeconds).toBe(1800); // 30 minutes in seconds
});
