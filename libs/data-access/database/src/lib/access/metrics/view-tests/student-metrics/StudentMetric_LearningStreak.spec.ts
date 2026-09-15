/**
 * @jest-environment node
 */
import { UserModel } from "@self-learning/database";
import { database } from "@self-learning/database/server";
import { createUsers, deleteUsers } from "../helper";

let users: UserModel[];

describe("Learning Streak for Student", () => {
	beforeAll(async () => {
		users = await createUsers(["user_learning_streak"]);

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

	it("should return learning streak for student", async () => {
		const result = await database.studentMetric_LearningStreak.findUnique({
			where: { userId: users[0].id }
		});

		console.log("Learning Streak Result:", result);

		expect(result).not.toBeNull();
		expect(result?.userId).toBe(users[0].id);
		expect(result?.username).toBe(users[0].name);
		expect(result?.currentStreakDays).toBe(1); // Assuming 1 day streak based on the test data
		expect(result?.longestStreakDays).toBe(1); // Assuming 1 day longest streak based on the test data
	});
});
