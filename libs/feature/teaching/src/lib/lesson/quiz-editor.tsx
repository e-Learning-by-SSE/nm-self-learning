import { MultipleChoiceQuestion, QuestionType, QuizContent } from "@self-learning/types";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import {
	createContext,
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useState
} from "react";
import { MarkdownField } from "../markdown-editor";

const QuestionContext = createContext(
	null as unknown as { question: QuestionType; setQuestion: (q: QuestionType) => void }
);

function useQuestionForm<QType extends QuestionType>() {
	const context = useContext(QuestionContext);
	return context as unknown as { question: QType; setQuestion: (q: QType) => void };
}

export function QuizEditor({
	quiz,
	setQuiz
}: {
	quiz: QuizContent;
	setQuiz: Dispatch<SetStateAction<QuizContent>>;
}) {
	const [questionIndex, setQuestionIndex] = useState<number | undefined>(
		quiz.length >= 0 ? 0 : undefined
	);

	const setQuizCb = useCallback(
		(question: QuestionType) => {
			setQuiz(old => {
				//const a =

				return old;
			});
		},
		[setQuiz]
	);

	return (
		<section>
			<CenteredContainer className="flex flex-col">
				<SectionHeader
					title="Lernkontrolle"
					subtitle="Fragen, die Studierenden nach Bearbeitung der Lernheit angezeigt werden sollen.
					Die erfolgreiche Beantwortung der Fragen ist notwendig, um diese Lernheit
					erfolgreich abzuschließen."
				/>

				<button
					className="btn-primary mb-8 w-fit"
					onClick={() =>
						setQuiz(old => [
							...old,
							{
								type: "multiple-choice",
								questionId: "",
								answers: [],
								statement: ""
							}
						])
					}
				>
					Add Multiple-Choice
				</button>

				<Tabs selectedIndex={questionIndex} onChange={index => setQuestionIndex(index)}>
					{quiz.map((_, index) => (
						<Tab key={index}>Frage {index + 1}</Tab>
					))}
				</Tabs>
			</CenteredContainer>

			{questionIndex !== undefined && quiz[questionIndex] && (
				<div className="mx-auto mt-8 flex w-full flex-col rounded-lg border border-light-border bg-white p-8 xl:w-[90vw]">
					<h4 className="mb-4 font-semibold text-secondary">
						{quiz[questionIndex].type}
					</h4>

					<div className="rounded-lg bg-indigo-50 p-4">
						<p className="mb-4 text-2xl font-semibold tracking-tight">Frage</p>

						<MarkdownField
							minHeight="256px"
							cacheKey={[`q-{${quiz[questionIndex].questionId}}`]}
							content={quiz[questionIndex].statement}
							setValue={value => {
								setQuiz(old => {
									old[questionIndex].statement = value ?? "";
									return [...old];
								});
							}}
						/>
					</div>

					<p className="mt-8 mb-4 text-2xl font-semibold tracking-tight">Antworten</p>

					<QuestionContext.Provider
						value={{ question: quiz[questionIndex], setQuestion: setQuizCb }}
					>
						<RenderQuestionTypeForm question={quiz[questionIndex]} />
					</QuestionContext.Provider>
				</div>
			)}
		</section>
	);
}

function RenderQuestionTypeForm({ question }: { question: QuestionType }) {
	if (question.type === "multiple-choice") {
		return <MultipleChoiceForm question={question} />;
	}

	return <span className="text-red-500">Unknown question type: {question.type}</span>;
}

function MultipleChoiceForm({ question }: { question: MultipleChoiceQuestion }) {
	const { setQuestion } = useQuestionForm<MultipleChoiceQuestion>();

	return <div className="flex flex-col gap-4"></div>;
}
