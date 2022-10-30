import { database } from "@self-learning/database";
import { createChapter, createCourseContent, createLesson } from "@self-learning/types";
import {
	createExampleLesson,
	createExampleLessonsFromContent,
	createTestUser
} from "@self-learning/util/testing";
import { markAsCompleted } from "./mark-as-completed";

const username = "markAsCompletedUser";

describe("markAsCompleted", () => {
	beforeAll(async () => {
		await createTestUser(username);
	});

	describe("With course", () => {
		it("Creates completedLesson and updates course progress", async () => {
			const courseId = "mark-as-completed-course";

			await database.course.deleteMany({ where: { courseId } });
			await database.completedLesson.deleteMany({ where: { courseId } });
			await database.enrollment.deleteMany({ where: { courseId } });

			const content = createCourseContent([
				createChapter("Chapter 1", [
					createLesson("mark-as-completed-lesson-1"),
					createLesson("mark-as-completed-lesson-2")
				]),
				createChapter("Chapter 2", [
					createLesson("mark-as-completed-lesson-3"),
					createLesson("mark-as-completed-lesson-4")
				])
			]);

			const [course] = await Promise.all([
				database.course.create({
					data: {
						courseId,
						title: "Mark as completed course",
						subtitle: "Mark as completed course subtitle",
						slug: "mark-as-completed-course-slug",
						meta: {},
						content
					}
				}),
				database.lesson.createMany({
					data: createExampleLessonsFromContent(content),
					skipDuplicates: true
				})
			]);

			await database.enrollment.create({
				data: {
					courseId,
					username,
					status: "ACTIVE"
				}
			});

			await markAsCompleted({
				username,
				courseSlug: course.slug,
				lessonId: "mark-as-completed-lesson-1"
			});

			const completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId: "mark-as-completed-lesson-1", courseId, username } }
			});

			expect(completedLesson?.lessonId).toEqual("mark-as-completed-lesson-1");

			const enrollment = await database.enrollment.findUnique({
				where: { courseId_username: { courseId, username } }
			});

			expect(enrollment?.progress).toEqual(25);
		});
	});

	describe("Without course", () => {
		it("Creates completedLesson", async () => {
			const username = "potter";
			const lessonId = "mark-as-completed-no-course-lesson";

			await database.completedLesson.deleteMany({ where: { lessonId } });

			await database.lesson.upsert({
				where: { lessonId },
				create: createExampleLesson(lessonId),
				update: {}
			});

			await markAsCompleted({ username, lessonId, courseSlug: null });

			const completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId, username } }
			});

			expect(completedLesson?.lessonId).toBeDefined();
		});
	});
});
