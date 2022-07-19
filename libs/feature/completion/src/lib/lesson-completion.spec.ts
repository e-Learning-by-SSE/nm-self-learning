import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { createTestUser } from "@self-learning/util/testing";
import { checkLessonCompletion } from "./lesson-completion";

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
