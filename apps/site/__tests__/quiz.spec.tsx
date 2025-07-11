/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLessonContext } from "@self-learning/lesson";
import { useEventLog } from "@self-learning/util/common";
import { render, screen, waitFor } from "@testing-library/react";
import { QuizHeader} from "@self-learning/quiz";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

const defaultUseQuizReturn = {
    evaluations: {},
    completionState: "incomplete" 
};

jest.mock("@self-learning/util/common");
jest.mock("@self-learning/quiz", 
	jest.fn(() => ({
		...jest.requireActual("@self-learning/quiz"),
		useQuiz: jest.fn(() => defaultUseQuizReturn)
	}))
);
jest.mock("@self-learning/lesson");
jest.mock("@self-learning/api", () => ({
	withAuth: jest.fn()
}));

const mockNewEvent = jest.fn();
const mockUseEventLog = useEventLog as jest.Mock;
const mockUseLessonContext = useLessonContext as jest.Mock;

mockUseEventLog.mockReturnValue({ newEvent: mockNewEvent });
mockUseLessonContext.mockReturnValue({ chapterName: "Chapter 1", nextLesson: null });

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
const mockQuestionOrder = mockQuestions.map(q => q.questionId);

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
				questionOrder={mockQuestionOrder}
			/>
		);
		await waitFor(() => {
			screen.logTestingPlaygroundURL();
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
				questionOrder={mockQuestionOrder}
			/>
		);

		await waitFor(async () => {
			const tabs = screen.getAllByRole("tab");
			await userEvent.click(tabs[1]);

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
});
