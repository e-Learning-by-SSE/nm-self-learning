import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { CourseChapter } from "@self-learning/types";
import { getCourseCompletionOfStudent } from "./course-completion";

const createLesson = (index: number): Prisma.LessonCreateManyInput => ({
	lessonId: `lesson-${index}`,
	slug: `lesson-${index}-slug`,
	title: `Lesson ${index}`
});

describe("getCourseCompletion", () => {
	const courseSlug = "test-course-with-completion";
	const username = "potter";

	beforeEach(async () => {
		await database.course.deleteMany({ where: { slug: courseSlug } });
		await database.lesson.deleteMany();

		const lessons = new Array(4).fill(0).map((_, i) => createLesson(i));

		const chapters: CourseChapter[] = [
			{
				title: "Chapter 1",
				lessons: [{ lessonId: lessons[0].lessonId }, { lessonId: lessons[1].lessonId }]
			},
			{
				title: "Chapter 2",
				lessons: [{ lessonId: lessons[2].lessonId }, { lessonId: lessons[3].lessonId }]
			}
		];

		await database.course.create({
			data: {
				courseId: courseSlug,
				slug: courseSlug,
				subtitle: "...",
				title: "Test Course",
				content: chapters
			}
		});

		await database.lesson.createMany({ data: lessons });
	});

	it("No lessons completed -> Empty object", async () => {
		const result = await getCourseCompletionOfStudent(courseSlug, username);
		expect(result).toEqual({});
	});

	it("Some lessons completed -> Object that maps lessonIds to lesson and date", async () => {
		await database.completedLesson.deleteMany();
		await database.completedLesson.createMany({
			data: [
				{
					username,
					lessonId: "lesson-1",
					createdAt: new Date(2022, 4, 20)
				},
				{
					username,
					lessonId: "lesson-2",
					createdAt: new Date(2022, 5, 21)
				},
				{
					username,
					lessonId: "lesson-3",
					createdAt: new Date(2022, 6, 22)
				}
			]
		});

		const result = await getCourseCompletionOfStudent(courseSlug, username);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "lesson-1": Object {
		    "createdAt": 2022-05-19T22:00:00.000Z,
		    "lessonId": "lesson-1",
		    "slug": "lesson-1-slug",
		    "title": "Lesson 1",
		  },
		  "lesson-2": Object {
		    "createdAt": 2022-06-20T22:00:00.000Z,
		    "lessonId": "lesson-2",
		    "slug": "lesson-2-slug",
		    "title": "Lesson 2",
		  },
		  "lesson-3": Object {
		    "createdAt": 2022-07-21T22:00:00.000Z,
		    "lessonId": "lesson-3",
		    "slug": "lesson-3-slug",
		    "title": "Lesson 3",
		  },
		}
	`);
	});
});
