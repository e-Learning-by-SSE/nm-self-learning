import { LearningDiaryPageDetail } from "../access-learning-diary";
import { trpc } from "@self-learning/api-client";
import { useLessonDetails } from "./page-details";
import { renderHook } from "@testing-library/react";
import { EventLog } from "@self-learning/types";

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		events: {
			findMany: {
				useQuery: jest.fn()
			}
		}
	}
}));

const now = new Date();

const mockEvents = [
	{
		type: "LESSON_QUIZ_SUBMISSION",
		resourceId: "lesson1",
		courseId: "course1",
		payload: {
			questionId: "task1",
			totalQuestionPool: 10,
			questionPoolIndex: 1,
			type: "LESSON_QUIZ_SUBMISSION",
			hintsUsed: ["hint1", "hint2"],
			attempts: 1, // currently testing only 1 attempt
			solved: false
		}
	},
	{
		type: "LESSON_QUIZ_SUBMISSION",
		resourceId: "lesson1",
		courseId: "course1",
		payload: {
			questionId: "task1", // same task again, since task1 was false before
			totalQuestionPool: 10,
			questionPoolIndex: 1,
			type: "LESSON_QUIZ_SUBMISSION",
			hintsUsed: ["hint1", "hint2", "hint3", "hint4"],
			attempts: 1,
			solved: true
		}
	},
	{
		type: "LESSON_QUIZ_SUBMISSION",
		resourceId: "lesson1",
		courseId: "course1",
		payload: {
			questionId: "task2",
			totalQuestionPool: 10,
			questionPoolIndex: 2,
			type: "LESSON_QUIZ_SUBMISSION",
			hintsUsed: ["hint1"],
			attempts: 1,
			solved: true
		}
	}
] satisfies EventLog<"LESSON_QUIZ_SUBMISSION">[];
const mockPage: LearningDiaryPageDetail = {
	course: { courseId: "course1" },
	createdAt: new Date("2023-01-01"),
	lessonsLearned: [
		{
			lesson: { lessonId: "lesson1", title: "Lesson 1" },
			durationMs: 60000,
			tasks: [],
			createdAt: new Date("2023-01-01"),
			course: { courseId: "course1", title: "Course 1" }
		}
	]
} as unknown as LearningDiaryPageDetail;

describe("useLessonDetails", () => {
	beforeEach(() => {
		(trpc.events.findMany.useQuery as jest.Mock).mockReturnValue({
			data: mockEvents,
			isLoading: false
		});
	});
	it("should return unique taskIds", () => {
		const { result } = renderHook(() => useLessonDetails({ page: mockPage, endDate: now }));

		const { lessonDetails } = result.current;
		const taskIds = lessonDetails[0].tasks.map(task => task.id);

		expect(taskIds).toEqual(["task1", "task2"]);
	});
	it("should return hints used", () => {
		const { result } = renderHook(() => useLessonDetails({ page: mockPage, endDate: now }));

		const { lessonDetails } = result.current;
		const hintsUsed = lessonDetails[0].hintsUsed;
		expect(hintsUsed).toEqual(3);
	});
	it("should return retry ratio", () => {
		const { result } = renderHook(() => useLessonDetails({ page: mockPage, endDate: now }));

		const { lessonDetails } = result.current;
		const retryRatio = lessonDetails[0].retryRatio;

		expect(retryRatio).toEqual(0.25);
	});
});
