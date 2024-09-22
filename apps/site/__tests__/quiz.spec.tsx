/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLessonContext } from "@self-learning/lesson";
import { useQuiz } from "@self-learning/quiz";
import { useEventLog } from "@self-learning/util/common";
import { QuizHeader } from "../pages/courses/[courseSlug]/[lessonSlug]/quiz";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@self-learning/util/common");
jest.mock("@self-learning/lesson");
jest.mock("@self-learning/quiz");

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

	it("should call newEvent when the quiz starts", () => {
		render(
			<QuizHeader
				lesson={mockLesson}
				course={mockCourse}
				questions={mockQuestions}
				currentIndex={0}
				goToQuestion={jest.fn()}
			/>
		);

		expect(mockNewEvent).toHaveBeenCalledWith({
			type: "LESSON_QUIZ_START",
			resourceId: "lesson1",
			payload: {
				questionId: "question1",
				type: "multiple-choice"
			}
		});
	});

	it("should call newEvent when a tab is clicked", () => {
		render(
			<QuizHeader
				lesson={mockLesson}
				course={mockCourse}
				questions={mockQuestions}
				currentIndex={0}
				goToQuestion={jest.fn()}
			/>
		);

		const tab = screen.getByText("Question 2");
		fireEvent.click(tab);

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
