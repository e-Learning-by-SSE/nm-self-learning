import { database } from "@self-learning/database";
import { checkLessonCompletion } from "./lesson-completion";

const username = "potter";
describe("checkLessonCompletion", () => {
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

		const completion = await checkLessonCompletion(username, [
			"lesson-0",
			"lesson-1",
			"lesson-2"
		]);

		expect(completion).toMatchInlineSnapshot(`
		Object {
		  "lesson-0": true,
		  "lesson-1": true,
		  "lesson-2": true,
		}
	`);
	});
});
