import "@testing-library/jest-dom";
import { AchievementWithProgress } from "@self-learning/types";
import { database } from "@self-learning/database";
import { AchievementTrigger } from "@prisma/client";
import { checkAndAwardAchievements } from "./award-achievements";
import { faker } from "@faker-js/faker";

jest.mock("@self-learning/database", () => ({
	database: {
		achievement: {
			findMany: jest.fn()
		},
		achievementProgress: {
			findUnique: jest.fn(),
			upsert: jest.fn()
		}
	}
}));
describe("Lesson Completion Achievements", () => {
	// TODO Marcel please update test (misses progressBy which is returned by mocked DB call)
	it.skip("should mark achievements as solved and update progressValue when a lesson is completed perfectly", async () => {
		const trigger: AchievementTrigger = "lesson_completed";

		const mockAchievements: AchievementWithProgress[] = [
			{
				id: faker.string.uuid(),
				title: "Perfect Lesson Streak",
				description: "Complete 5 lessons perfectly in a row.",
				xpReward: 100,
				category: "streak",
				trigger: "lesson_completed",
				requiredValue: 5,
				progressValue: 4, // Already completed 4 lessons
				meta: { group: "grade_lessons_serial", level: 1, grade: "PERFECT" },
				createdAt: new Date(),
				code: "Code 1"
			},
			{
				id: faker.string.uuid(),
				title: "Perfect Lesson",
				description: "Complete a lesson perfectly.",
				xpReward: 50,
				category: "lesson",
				trigger: "lesson_completed",
				requiredValue: 1,
				progressValue: 0, // Not yet completed
				meta: { group: "grade_lessons_serial", level: 1, grade: "PERFECT" },
				createdAt: new Date(),
				code: "Code 2"
			}
		];
		const mockProgress = {
			progressValue: 4 // Already completed 4 lessons for the first achievement
		};

		// Mock database calls
		(database.achievement.findMany as jest.Mock).mockResolvedValue(mockAchievements);
		(database.achievementProgress.findUnique as jest.Mock).mockResolvedValue(mockProgress);
		(database.achievementProgress.upsert as jest.Mock).mockResolvedValue({});

		const updatedAchievements = await checkAndAwardAchievements({
			trigger,
			username: "",
			context: {}
		});

		console.log(updatedAchievements);

		expect(database.achievement.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { trigger } })
		);
		expect(updatedAchievements[0].progressValue).toBe(5); // Achievement 1 completed
		expect(updatedAchievements[1].progressValue).toBe(1); // Achievement 2 completed
	});
});
