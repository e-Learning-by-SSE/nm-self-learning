import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

import { createUsers, deleteUsers, getDemoDatabaseAvailability } from "../helper";

let users: User[];

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE
const isDatabaseAvailable = getDemoDatabaseAvailability();

beforeAll(async () => {
	if (!isDatabaseAvailable) {
		console.warn(
			"Skipping database tests: DATABASE_URL or demo instance flag not set correctly."
		);
		return;
	}

	users = await createUsers(["user_daily_learning_time"]);

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
	if (!isDatabaseAvailable) return;

	// Clean up created data in reverse order
	await prisma.eventLog.deleteMany({
		where: {
			username: users[0].name
		}
	});

	await deleteUsers(users);

	await prisma.$disconnect();
});

(isDatabaseAvailable ? test : test.skip)("should return learning time for student", async () => {
	const result = await prisma.studentMetric_DailyLearningTime.findUnique({
		where: { userId: users[0].id }
	});

	console.log("Learning Time Result:", result);

	expect(result).not.toBeNull();
	expect(result?.userId).toBe(users[0].id);
	expect(result?.username).toBe(users[0].name);
	expect(result?.day).toEqual(new Date("2024-01-01"));
	expect(result?.timeSeconds).toBe(1800); // 30 minutes in seconds
});
