/**
 * @jest-environment node
 */
import { CourseModel, UserModel } from "@self-learning/database";
import { database } from "@self-learning/database/server";

import { createUsers, deleteUsers } from "../helper";

let users: UserModel[];
let course: CourseModel;

describe("Daily Learning Time by Course for Student", () => {
	beforeAll(async () => {
		users = await createUsers(["user_learning_time"]);

		course = await database.course.create({
			data: {
				courseId: "daily-learning-time-by-course-test-course",
				title: "Daily Learning Time by Course Test Course",
				slug: "daily-learning-time-by-course-test-course",
				subtitle: "A course to test daily learning time by course metric",
				content: {},
				meta: {}
			}
		});

		await database.eventLog.createMany({
			data: [
				{
					username: users[0].name,
					createdAt: new Date("2024-01-01T10:00:00Z"),
					type: "login",
					courseId: course.courseId
				},
				{
					username: users[0].name,
					createdAt: new Date("2024-01-01T10:30:00Z"),
					type: "logout",
					courseId: course.courseId
				}
			]
		});
	});

	afterAll(async () => {
		// Clean up created data in reverse order
		await database.course.deleteMany({
			where: { courseId: course.courseId }
		});
		await database.eventLog.deleteMany({
			where: {
				username: users[0].name
			}
		});
		await deleteUsers(users);

		await database.$disconnect();
	});

	it("should return daily learning time by course for student", async () => {
		const result = await database.studentMetric_DailyLearningTimeByCourse.findFirst({
			where: { userId: users[0].id }
		});

		console.log("Daily Learning Time by Course Result:", result);

		expect(result).not.toBeNull();
		expect(result?.userId).toBe(users[0].id);
		expect(result?.username).toBe(users[0].name);
		expect(result?.courseId).toBe(course.courseId);
		expect(result?.courseTitle).toBe(course.title);
		expect(result?.day).toEqual(new Date("2024-01-01"));
		expect(result?.timeSeconds).toBe(1800); // 30 minutes in seconds
	});
});
