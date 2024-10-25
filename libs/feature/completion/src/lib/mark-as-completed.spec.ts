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
			await database.lesson.deleteMany({ where: { lessonId } });
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
		});

		it("Lesson marked as completed -> Lesson completed; progress updated", async () => {
			// Pre-Condition: Lesson is not completed, progress is 0
			let completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId, courseId, username } }
			});
			expect(completedLesson).toBeNull();

			let enrollment = await database.enrollment.findUnique({
				where: { courseId_username: { courseId, username } }
			});
			expect(enrollment?.progress).toEqual(0);

			// Action: Mark lesson as completed
			await markAsCompleted({
				username,
				courseSlug,
				lessonId
			});

			// Post-Condition: Lesson is completed, progress 1 of 4
			completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId, courseId, username } }
			});
			expect(completedLesson?.lessonId).toEqual(lessonId);

			enrollment = await database.enrollment.findUnique({
				where: { courseId_username: { courseId, username } }
			});
			expect(enrollment?.progress).toEqual(25);
		});

		it("Lesson marked as completed -> user event log entry", async () => {
			// Pre-Condition: No event log entry for lesson completion
			let userEvent = await database.eventLog.findFirst({
				where: { resourceId: lessonId }
			});
			expect(userEvent).toBeNull();

			// Action: Mark lesson as completed
			await markAsCompleted({
				username,
				courseSlug,
				lessonId
			});

			// Post-Condition: Event log entry for lesson completion
			userEvent = await database.eventLog.findFirst({
				where: { resourceId: lessonId }
			});
			expect(userEvent?.type).toEqual("LESSON_COMPLETE");
		});

		it("1 of 4 lessons completed -> course not completed (course completion requires 100%)", async () => {
			// Pre-Condition: Course not completed
			let userEvent = await database.eventLog.findFirst({
				where: { courseId: courseId, type: "COURSE_COMPLETE" }
			});
			expect(userEvent).toBeNull();

			// Action: Mark lesson as completed
			await markAsCompleted({
				username,
				courseSlug,
				lessonId
			});

			// Post-Condition: Course still not completed
			userEvent = await database.eventLog.findFirst({
				where: { courseId: courseId, type: "COURSE_COMPLETE" }
			});
			expect(userEvent).toBeNull();
		});

		it("All lessons completed -> Course also marked as completed", async () => {
			// Test data: All lessons of course shall be completed
			const completions = [
				"mark-as-completed-lesson-1",
				"mark-as-completed-lesson-2",
				"mark-as-completed-lesson-3",
				"mark-as-completed-lesson-4"
			];

			// Pre-Condition: Course not completed
			let userEvents = await database.eventLog.findMany({
				where: { courseId: courseId, type: "COURSE_COMPLETE" }
			});
			expect(userEvents.length).toBe(0);

			// Action: Mark all lessons as completed
			await Promise.all(
				completions.map(c =>
					markAsCompleted({
						username,
						lessonId: c,
						courseSlug
					})
				)
			);

			// Post-Condition: Course marked as completed (at least 1 event log entry)
			userEvents = await database.eventLog.findMany({
				where: { courseId: courseId, type: "COURSE_COMPLETE" }
			});
			expect(userEvents.length).toBeGreaterThanOrEqual(1);
			expect(userEvents[0]).toMatchObject({
				id: expect.any(Number),
				type: "COURSE_COMPLETE",
				resourceId: courseId,
				username,
				payload: null,
				courseId,
				createdAt: expect.any(Date)
			});
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
