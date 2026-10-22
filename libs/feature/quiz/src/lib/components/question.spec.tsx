/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import type {
	TextEvaluateRouterOutput,
	TextQuestion
} from "../../../../question-types/src/lib/question-types/text/schema";
import { Question } from "./question";
import { QuizProvider, useQuiz } from "./quiz-context";

const mockEvaluate = jest.fn();
const mockNewEvent = jest.fn();
const mockSetCookie = jest.fn();

jest.mock("@self-learning/api-client", () => ({
	trpc: { textEvaluation: { evaluate: { useMutation: () => ({ mutateAsync: mockEvaluate }) } } }
}));
jest.mock("@self-learning/util/eventlog", () => ({
	useEventLog: () => ({ newEvent: mockNewEvent })
}));
jest.mock("next/router", () => ({ useRouter: () => ({ asPath: "/lessons/test/quiz" }) }));
jest.mock("react-cookie", () => ({ useCookies: () => [{}, mockSetCookie] }));
jest.mock("@self-learning/markdown", () => ({ MarkdownRemote: () => null }));
jest.mock("@self-learning/ui/layouts", () => ({
	MarkdownContainer: ({ children }: { children: React.ReactNode }) => children
}));
jest.mock("@self-learning/ui/forms", () => ({
	TextArea: ({ label, ...props }: ComponentProps<"textarea"> & { label: string }) => (
		<textarea aria-label={label} {...props} />
	)
}));
jest.mock("./hints", () => ({ Hints: () => null }));
jest.mock("@self-learning/question-types", () => ({
	...jest.requireActual("../../../../question-types/src/lib/use-question-hook"),
	QUESTION_TYPE_DISPLAY_NAMES: { text: "Freitext" },
	INITIAL_ANSWER_VALUE_FUNCTIONS: { text: () => "" },
	EVALUATION_FUNCTIONS: {
		text: jest.requireActual("../../../../question-types/src/lib/question-types/text/evaluate")
			.evaluateTextSync
	},
	QuestionAnswerRenderer: jest.requireActual(
		"../../../../question-types/src/lib/question-types/text/component"
	).default
}));

const question: TextQuestion = {
	questionId: "q1",
	type: "text",
	statement: "Was ist Photosynthese?",
	withCertainty: false,
	hints: [],
	aiEvaluation: { solutionOrConcepts: "Umwandlung von Lichtenergie", passingThreshold: 80 }
};

function QuizStatus() {
	const { completionState, attempts } = useQuiz();
	return <output>{`${completionState}, attempts: ${attempts.q1}`}</output>;
}

function renderQuestion(moreQuestions = false) {
	render(
		<QuizProvider
			questions={moreQuestions ? [question, { ...question, questionId: "q2" }] : [question]}
			config={{ hints: { enabled: false, maxHints: 100 }, maxErrors: 0, showSolution: false }}
			goToNextQuestion={jest.fn()}
			reload={jest.fn()}
			lessonAttemptId="attempt-1"
		>
			<Question
				question={question}
				markdown={{ questionsMd: {}, answersMd: {}, hintsMd: {} }}
				lesson={
					{ lessonId: "lesson-1", slug: "test" } as ComponentProps<
						typeof Question
					>["lesson"]
				}
			/>
			<QuizStatus />
		</QuizProvider>
	);
}

describe("asynchronous free-text evaluation", () => {
	beforeEach(() => jest.clearAllMocks());

	it.each([
		{ verdict: "correct", completionState: "completed", solved: true },
		{ verdict: "wrong", completionState: "failed", solved: false }
	] as const)(
		"waits for a $verdict result before completing the quiz",
		async ({ verdict, completionState, solved }) => {
			// Setup
			let resolve!: (result: TextEvaluateRouterOutput) => void;
			mockEvaluate.mockReturnValue(
				new Promise<TextEvaluateRouterOutput>(done => {
					resolve = done;
				})
			);
			renderQuestion();

			// Exercise
			fireEvent.change(screen.getByRole("textbox"), { target: { value: "Meine Antwort" } });
			fireEvent.blur(screen.getByRole("textbox"));
			fireEvent.click(screen.getByRole("button", { name: "Überprüfen" }));

			// Verify
			expect(mockEvaluate).toHaveBeenCalledTimes(1);
			expect(mockEvaluate).toHaveBeenCalledWith(
				expect.objectContaining({ studentAnswer: "Meine Antwort" })
			);
			expect(screen.getByRole("status")).toHaveTextContent("in-progress, attempts: 0");
			expect(screen.getByRole("button", { name: "Überprüfen" })).toBeDisabled();
			expect(
				screen.queryByRole("button", { name: "Erneut probieren" })
			).not.toBeInTheDocument();
			expect(screen.queryByRole("button", { name: "Nächste Frage" })).not.toBeInTheDocument();
			expect(mockNewEvent).not.toHaveBeenCalled();

			// Exercise
			await act(async () =>
				resolve({ ok: true, verdict, feedback: "Bewertung abgeschlossen" })
			);

			// Verify
			expect(screen.getByRole("status")).toHaveTextContent(`${completionState}, attempts: 1`);
			expect(screen.getByText("Bewertung abgeschlossen")).toBeInTheDocument();
			expect(mockNewEvent).toHaveBeenCalledTimes(1);
			expect(mockNewEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "LESSON_QUIZ_SUBMISSION",
					payload: expect.objectContaining({ solved, attempts: 1 })
				})
			);
			if (!solved) {
				expect(screen.getByRole("button", { name: "Erneut probieren" })).toBeEnabled();
			}
		}
	);

	it("allows moving to the next question only after evaluation finishes", async () => {
		// Setup
		let resolve!: (result: TextEvaluateRouterOutput) => void;
		mockEvaluate.mockReturnValue(
			new Promise<TextEvaluateRouterOutput>(done => {
				resolve = done;
			})
		);
		renderQuestion(true);

		// Exercise
		fireEvent.click(screen.getByRole("button", { name: "Überprüfen" }));

		// Verify
		expect(screen.getByRole("button", { name: "Überprüfen" })).toBeDisabled();
		expect(screen.queryByRole("button", { name: "Nächste Frage" })).not.toBeInTheDocument();

		// Exercise
		await act(async () => resolve({ ok: true, verdict: "correct", feedback: "Richtig" }));

		// Verify
		expect(screen.getByRole("button", { name: "Nächste Frage" })).toBeEnabled();
		expect(screen.getByRole("status")).toHaveTextContent("in-progress, attempts: 1");
	});
});
