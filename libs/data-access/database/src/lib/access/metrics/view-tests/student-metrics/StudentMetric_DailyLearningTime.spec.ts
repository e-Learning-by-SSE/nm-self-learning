/**
 * @jest-environment node
 */
import { UserModel } from "@self-learning/database";
import { database } from "@self-learning/database/server";
import { createUsers, deleteUsers } from "../helper";

let users: UserModel[];

describe("Daily Learning Time for Student", () => {
	beforeAll(async () => {
		users = await createUsers(["user_daily_learning_time"]);

		await database.eventLog.createMany({
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
		await database.eventLog.deleteMany({
			where: {
				username: users[0].name
			}
		});
		await deleteUsers(users);

		await database.$disconnect();
	});

	it("should return learning time for student", async () => {
		const result = await database.studentMetric_DailyLearningTime.findFirst({
			where: { userId: users[0].id }
		});

		console.log("Learning Time Result:", result);

		expect(result).not.toBeNull();
		expect(result?.userId).toBe(users[0].id);
		expect(result?.username).toBe(users[0].name);
		expect(result?.day).toEqual(new Date("2024-01-01"));
		expect(result?.timeSeconds).toBe(1800); // 30 minutes in seconds
	});
});
