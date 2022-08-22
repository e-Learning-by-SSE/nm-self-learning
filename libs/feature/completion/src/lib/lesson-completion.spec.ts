import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { createLesson } from "@self-learning/types";
import { createTestUser } from "@self-learning/util/testing";
import { checkLessonCompletion, getCompletedLessonsThisWeek } from "./lesson-completion";

const username = "mustermann";

describe("checkLessonCompletion", () => {
	const createLesson = (index: number): Prisma.LessonCreateManyInput => ({
		lessonId: `lesson-${index}`,
		slug: `lesson-${index}-slug`,
		title: `Lesson ${index}`,
		content: [],
		meta: {}
	});

	beforeAll(async () => {
		const lessons = new Array(4).fill(0).map((_, i) => createLesson(i));
		await createTestUser(username);
		await database.lesson.deleteMany();
		await database.lesson.createMany({ data: lessons });
	});

	it("Empty lessons array -> Empty object", async () => {
		await database.completedLesson.deleteMany();
		await database.completedLesson.createMany({
			data: [
				{
					username,
					lessonId: "lesson-0",
					createdAt: new Date(2022, 4, 20)
				},
				{
					username,
					lessonId: "lesson-1",
					createdAt: new Date(2022, 5, 21)
				},
				{
					username,
					lessonId: "lesson-2",
					createdAt: new Date(2022, 6, 22)
				}
			]
		});

		const completion = await checkLessonCompletion(username, []);

		expect(completion).toEqual({});
	});

	it("Only returns selected completed lessons", async () => {
		await database.completedLesson.deleteMany();
		await database.completedLesson.createMany({
			data: [
				{
					username,
					lessonId: "lesson-0",
					createdAt: new Date(2022, 4, 20)
				},
				{
					username,
					lessonId: "lesson-1",
					createdAt: new Date(2022, 5, 21)
				},
				{
					username,
					lessonId: "lesson-2",
					createdAt: new Date(2022, 6, 22)
				}
			]
		});

		const completion = await checkLessonCompletion(username, ["lesson-0", "lesson-1"]);

		expect(completion).toMatchInlineSnapshot(`
		Object {
		  "lesson-0": true,
		  "lesson-1": true,
		}
	`);
	});
});

describe("getCompletedLessonsThisWeek", () => {
	it("Finds all lessons that were completed this week by user", async () => {
		await database.lesson.deleteMany();
		await createTestUser(username);
		await createTestUser("otherUser");

		await database.lesson.create({
			data: {
				lessonId: "completed-lesson",
				slug: "completed-lesson-slug",
				title: "Completed Lesson",
				content: [],
				meta: {}
			}
		});

		await database.completedLesson.createMany({
			data: [
				{
					username,
					lessonId: "completed-lesson",
					createdAt: new Date(2022, 4, 20) // should be included
				},
				{
					username,
					lessonId: "completed-lesson",
					createdAt: new Date(2022, 4, 21) // should be included
				},
				{
					username: "otherUser",
					lessonId: "completed-lesson",
					createdAt: new Date(2022, 4, 20) // Not included because of different user
				},
				{
					username,
					lessonId: "completed-lesson",
					createdAt: new Date(2022, 4, 10) // Not included because previous week
				},
				{
					username,
					lessonId: "completed-lesson",
					createdAt: new Date(2022, 4, 30) // Not included because upcoming week
				}
			]
		});

		const result = await getCompletedLessonsThisWeek(username, new Date(2022, 4, 20).getTime());

		expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "createdAt": 2022-05-19T22:00:00.000Z,
		    "lesson": Object {
		      "lessonId": "completed-lesson",
		      "title": "Completed Lesson",
		    },
		  },
		  Object {
		    "createdAt": 2022-05-20T22:00:00.000Z,
		    "lesson": Object {
		      "lessonId": "completed-lesson",
		      "title": "Completed Lesson",
		    },
		  },
		]
	`);
	});
});
