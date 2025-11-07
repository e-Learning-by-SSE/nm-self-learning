import { Course, PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

import { createUsers, deleteUsers, getDemoDatabaseAvailability } from "../helper";

let users: User[];
let course: Course;

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE
const isDatabaseAvailable = getDemoDatabaseAvailability();

beforeAll(async () => {
	if (!isDatabaseAvailable) {
		console.warn(
			"Skipping database tests: DATABASE_URL or demo instance flag not set correctly."
		);
		return;
	}

	users = await createUsers(["user_learning_time"]);

	course = await prisma.course.create({
		data: {
			courseId: "daily-learning-time-by-course-test-course",
			title: "Daily Learning Time by Course Test Course",
			slug: "daily-learning-time-by-course-test-course",
			subtitle: "A course to test daily learning time by course metric",
			content: {},
			meta: {}
		}
	});

	await prisma.eventLog.createMany({
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
	if (!isDatabaseAvailable) return;

	// Clean up created data in reverse order
	await prisma.course.deleteMany({
		where: { courseId: course.courseId }
	});

	await prisma.eventLog.deleteMany({
		where: {
			username: users[0].name
		}
	});

	await deleteUsers(users);

	await prisma.$disconnect();
});

(isDatabaseAvailable ? test : test.skip)(
	"should return daily learning time by course for student",
	async () => {
		const result = await prisma.studentMetric_DailyLearningTimeByCourse.findUnique({
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
	}
);
