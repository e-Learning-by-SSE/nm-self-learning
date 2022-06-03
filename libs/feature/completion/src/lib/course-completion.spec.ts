import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { CourseChapter } from "@self-learning/types";
import { getCourseCompletionOfStudent } from "./course-completion";

const createLesson = (index: number): Prisma.LessonCreateManyInput => ({
	lessonId: `lesson-${index}`,
	slug: `lesson-${index}-slug`,
	title: `Lesson ${index}`
});

const username = "potter";

describe("getCourseCompletion", () => {
	const courseSlug = "test-course-with-completion";

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

	it("No lessons completed -> 0 completion", async () => {
		const result = await getCourseCompletionOfStudent(courseSlug, username);
		expect(result.completedLessons).toEqual({});
		expect(result.courseCompletionPercentage).toEqual(0);
	});

	it("Some lessons completed -> Completion info", async () => {
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

		const result = await getCourseCompletionOfStudent(courseSlug, username);

		expect(result.courseCompletionPercentage).toEqual(75);
		expect(Object.keys(result.completedLessons).length).toEqual(3);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "chapters": Array [
		    Object {
		      "chapterTitle": "Chapter 1",
		      "completedLessonsCount": 2,
		      "completedLessonsPercentage": 100,
		    },
		    Object {
		      "chapterTitle": "Chapter 2",
		      "completedLessonsCount": 1,
		      "completedLessonsPercentage": 50,
		    },
		  ],
		  "completedLessons": Object {
		    "lesson-0": Object {
		      "createdAt": 2022-05-19T22:00:00.000Z,
		      "slug": "lesson-0-slug",
		      "title": "Lesson 0",
		    },
		    "lesson-1": Object {
		      "createdAt": 2022-06-20T22:00:00.000Z,
		      "slug": "lesson-1-slug",
		      "title": "Lesson 1",
		    },
		    "lesson-2": Object {
		      "createdAt": 2022-07-21T22:00:00.000Z,
		      "slug": "lesson-2-slug",
		      "title": "Lesson 2",
		    },
		  },
		  "courseCompletionPercentage": 75,
		}
	`);
	});
});
