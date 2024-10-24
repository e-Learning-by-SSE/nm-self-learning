import { database } from "@self-learning/database";
import { createChapter, createCourseContent, createLesson } from "@self-learning/types";
import {
	createExampleLesson,
	createExampleLessonsFromContent,
	createTestUser,
	createLicense
} from "@self-learning/util/testing";
import { markAsCompleted } from "./mark-as-completed";

const username = "markAsCompletedUser";
const courseSlug = "mark-as-completed-course-slug";

describe("markAsCompleted", () => {
	beforeAll(async () => {
		await createTestUser(username);
		await createLicense(1);
	});

	describe("With course", () => {
		const courseId = "mark-as-completed-course";
		const lessonId = "mark-as-completed-lesson-1";

		beforeEach(async () => {
			await database.course.deleteMany({ where: { courseId } });
			await database.completedLesson.deleteMany({ where: { courseId } });
			await database.enrollment.deleteMany({ where: { courseId } });
			await database.eventLog.deleteMany({ where: { courseId: courseId } });
			await database.eventLog.deleteMany({ where: { resourceId: lessonId } });

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

			await Promise.all([
				database.course.create({
					data: {
						courseId,
						title: "Mark as completed course",
						subtitle: "Mark as completed course subtitle",
						slug: courseSlug,
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
				courseSlug,
				lessonId
			});
		});
		it("Creates completedLesson and updates course progress", async () => {
			const completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId, courseId, username } }
			});

			expect(completedLesson?.lessonId).toEqual(lessonId);

			const enrollment = await database.enrollment.findUnique({
				where: { courseId_username: { courseId, username } }
			});

			expect(enrollment?.progress).toEqual(25);
		});

		it("Creates user event log entry on lesson complete", async () => {
			const userEvent = await database.eventLog.findFirst({
				where: { resourceId: lessonId }
			});
			expect(userEvent?.type).toEqual("LESSON_COMPLETE");
		});

		it("Creates don't create course completion without 100% progress", async () => {
			const userEvent = await database.eventLog.findFirst({
				where: { courseId: courseId, type: "COURSE_COMPLETE" }
			});
			expect(userEvent).toBeNull();
		});

		it("Creates log event entry for course completion on 100% progress", async () => {
			const completions = [
				"mark-as-completed-lesson-1",
				"mark-as-completed-lesson-2",
				"mark-as-completed-lesson-3",
				"mark-as-completed-lesson-4"
			];

			await Promise.all(
				completions.map(c =>
					markAsCompleted({
						username,
						lessonId: c,
						courseSlug
					})
				)
			);

			const userEvent = await database.eventLog.findMany({
				where: { courseId: courseId }
			});
			console.log(userEvent);
			expect(userEvent.some(event => event.type === "COURSE_COMPLETE")).toBe(true);
		});
	});

	describe("Without course", () => {
		const lessonId = "mark-as-completed-no-course-lesson";

		beforeEach(async () => {
			await database.completedLesson.deleteMany({ where: { lessonId } });

			await database.lesson.upsert({
				where: { lessonId },
				create: createExampleLesson(lessonId),
				update: {}
			});

			await markAsCompleted({ username, lessonId, courseSlug: null });
		});

		it("Creates completedLesson", async () => {
			const completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId, username } }
			});

			expect(completedLesson?.lessonId).toBeDefined();
		});
	});
});
