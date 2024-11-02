import { createChapter, createCourseContent, createLesson } from "@self-learning/types";
import {
	createExampleLesson,
	createExampleLessonsFromContent,
	createTestUser,
	createLicense
} from "@self-learning/util/testing";
import { markAsCompleted } from "./mark-as-completed";
import createPrismaMock from "prisma-mock";
import { mockDeep, mockReset } from "jest-mock-extended";
import { database } from "@self-learning/database";
import { PrismaClient } from "@prisma/client";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	...jest.requireActual("@self-learning/database"),
	database: jest.fn()
}));

beforeEach(() => {
	mockReset(database);
	(database as jest.Mocked<PrismaClient>) = mockDeep<PrismaClient>();
	createPrismaMock();
});

const username = "markAsCompletedUser";
const courseSlug = "mark-as-completed-course-slug";
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

		it("Lesson marked as completed -> Lesson is completed, progress 1 of 4", async () => {
			await markAsCompleted({
				username,
				courseSlug,
				lessonId
			});

			const completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId, courseId, username } }
			});
			expect(completedLesson?.lessonId).toEqual(lessonId);

			const enrollment = await database.enrollment.findUnique({
				where: { courseId_username: { courseId, username } }
			});
			expect(enrollment?.progress).toEqual(25);
		});

		it("Lesson marked as completed -> Event log entry for lesson completion", async () => {
			await markAsCompleted({
				username,
				courseSlug,
				lessonId
			});

			const userEvent = await database.eventLog.findFirst({
				where: { resourceId: lessonId }
			});
			expect(userEvent?.type).toEqual("LESSON_COMPLETE");
		});

		it("1 of 4 lessons completed -> course not completed (course completion requires 100%)", async () => {
			await markAsCompleted({
				username,
				courseSlug,
				lessonId
			});

			const userEvent = await database.eventLog.findFirst({
				where: { courseId: courseId, type: "COURSE_COMPLETE" }
			});
			expect(userEvent).toBeNull();
		});

		it("All lessons completed -> Course marked as completed (at least 1 event log entry)", async () => {
			await Promise.all(
				[
					"mark-as-completed-lesson-1",
					"mark-as-completed-lesson-2",
					"mark-as-completed-lesson-3",
					"mark-as-completed-lesson-4"
				].map(c =>
					markAsCompleted({
						username,
						lessonId: c,
						courseSlug
					})
				)
			);

			const userEvents = await database.eventLog.findMany({
				where: { courseId: courseId, type: "COURSE_COMPLETE" }
			});

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
		});

		it("Creates completedLesson", async () => {
			await markAsCompleted({ username, lessonId, courseSlug: null });

			const completedLesson = await database.completedLesson.findFirst({
				where: { AND: { lessonId, username } }
			});

			expect(completedLesson?.lessonId).toBeDefined();
		});
	});
});
