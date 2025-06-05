/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLessonContext } from "@self-learning/lesson";
import { useEventLog } from "@self-learning/util/eventlog";
import { QuizHeader } from "../pages/courses/[courseSlug]/[lessonSlug]/quiz";
import { render, screen, waitFor } from "@testing-library/react";
import { useQuiz } from "@self-learning/quiz";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("@self-learning/util/common");
jest.mock("@self-learning/lesson");
jest.mock("@self-learning/quiz");
jest.mock("@self-learning/api", () => ({
	withAuth: jest.fn()
}));

const mockNewEvent = jest.fn();
const mockUseEventLog = useEventLog as jest.Mock;
const mockUseLessonContext = useLessonContext as jest.Mock;
const mockUseQuiz = useQuiz as jest.Mock;

mockUseEventLog.mockReturnValue({ newEvent: mockNewEvent });
mockUseLessonContext.mockReturnValue({ chapterName: "Chapter 1", nextLesson: null });
mockUseQuiz.mockReturnValue({ evaluations: {}, completionState: "incomplete" });

const mockLesson = {
	lessonId: "lesson1",
	slug: "lesson-1",
	title: "Lesson 1",
	lessonType: "SELF_REGULATED"
} as any; // didnt mock the whole lesson object. Just the necessary parts. It is a whitebox test now, but isn't worth the hustle.

const mockCourse = {
	slug: "course-1"
} as any;

const mockQuestions = [
	{
		questionId: "question1",
		type: "multiple-choice"
	},
	{
		questionId: "question2",
		type: "multiple-choice"
	}
] as any[];

describe("QuizHeader", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should call newEvent when the quiz starts", async () => {
		render(
			<QuizHeader
				lesson={mockLesson}
				course={mockCourse}
				questions={mockQuestions}
				currentIndex={0}
				goToQuestion={jest.fn()}
			/>
		);
		await waitFor(() => {
			expect(mockNewEvent).toHaveBeenCalledWith({
				type: "LESSON_QUIZ_START",
				resourceId: "lesson1",
				payload: {
					questionId: "question1",
					type: "multiple-choice"
				}
			});
		});
	});

	it("should call newEvent when a tab is clicked", async () => {
		render(
			<QuizHeader
				lesson={mockLesson}
				course={mockCourse}
				questions={mockQuestions}
				currentIndex={0}
				goToQuestion={jest.fn()}
			/>
		);

		const tab = screen.getByText("Aufgabe 2");
		await userEvent.click(tab);

		await waitFor(() => {
			expect(mockNewEvent).toHaveBeenCalledWith({
				type: "LESSON_QUIZ_START",
				resourceId: "lesson1",
				payload: {
					questionId: "question2",
					type: "multiple-choice"
				}
			});
		});
	});

	it("should open the completion dialog when quiz is completed ", async () => {
		mockUseQuiz.mockReturnValue({ evaluations: {}, completionState: "completed" });

		render(
			<QuizHeader
				lesson={mockLesson}
				course={mockCourse}
				questions={mockQuestions}
				currentIndex={0}
				goToQuestion={jest.fn()}
			/>
		);

		const successDialog = screen.getByText("Geschafft!");
		await waitFor(() => expect(successDialog).toBeInTheDocument());
	});

	it("should open the failed dialog when quiz ist failed", async () => {
		mockUseQuiz.mockReturnValue({ evaluations: {}, completionState: "failed" });

		render(
			<QuizHeader
				lesson={mockLesson}
				course={mockCourse}
				questions={mockQuestions}
				currentIndex={0}
				goToQuestion={jest.fn()}
			/>
		);

		const failDialog = screen.getByText("Nicht Bestanden");

		await waitFor(() => expect(failDialog).toBeInTheDocument());
	});

	it("should not open completion dialog when quiz is in-progress", async () => {
		mockUseQuiz.mockReturnValue({ evaluations: {}, completionState: "in-progress" });

		render(
			<QuizHeader
				lesson={mockLesson}
				course={mockCourse}
				questions={mockQuestions}
				currentIndex={0}
				goToQuestion={jest.fn()}
			/>
		);

		await waitFor(() => {
			expect([
				screen.queryByText("Geschafft!"),
				screen.queryByText("Nicht Bestanden")
			]).toEqual([null, null]);
		});
	});
});
