import { PlusIcon } from "@heroicons/react/outline";
import {
	BaseQuestion,
	MultipleChoiceForm,
	ProgrammingForm,
	QuestionType,
	QuizContent,
	ShortTextForm
} from "@self-learning/question-types";
import { Divider, RemovableTab, SectionHeader, Tabs } from "@self-learning/ui/common";
import { MarkdownField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { getRandomId } from "@self-learning/util/common";
import { Reorder } from "framer-motion";
import { useState } from "react";
import { Control, Controller, useFieldArray, useFormContext } from "react-hook-form";

export function useQuizEditorForm() {
	const { control } = useFormContext<{ quiz: QuizContent }>();
	const {
		append,
		remove,
		fields: quiz,
		replace: setQuiz,
		swap
	} = useFieldArray({
		control,
		name: "quiz"
	});

	const [questionIndex, setQuestionIndex] = useState<number>(quiz.length > 0 ? 0 : -1);
	const currentQuestion = quiz[questionIndex];

	function appendQuestion(type: QuestionType["type"]) {
		const baseQuestion: BaseQuestion = {
			type: "",
			questionId: getRandomId(),
			statement: "",
			withCertainty: false,
			hints: []
		};

		setQuestionIndex(old => old + 1);

		if (type === "multiple-choice") {
			return append({
				...baseQuestion,
				type: "multiple-choice",
				answers: []
			});
		}

		if (type === "short-text") {
			return append({
				...baseQuestion,
				type: "short-text",
				acceptedAnswers: []
			});
		}

		if (type === "programming") {
			return append({
				...baseQuestion,
				type: "programming",
				language: "java",
				custom: {
					mode: "standalone",
					expectedOutput: "",
					solutionTemplate: ""
				}
			});
		}
	}

	function swapQuestions(fromIndex: number, toIndex: number) {
		swap(fromIndex, toIndex);
		setQuestionIndex(toIndex);
	}

	function removeQuestion(index: number) {
		const confirm = window.confirm("Frage entfernen?");

		if (confirm) {
			remove(index);

			if (index === questionIndex) {
				setQuestionIndex(quiz.length - 2); // set to last index or -1 if no questions exist
			}
		}
	}

	return {
		control,
		quiz,
		setQuiz,
		questionIndex,
		setQuestionIndex,
		currentQuestion,
		appendQuestion,
		swapQuestions,
		removeQuestion
	};
}

export function QuizEditor() {
	const {
		control,
		quiz,
		setQuiz,
		questionIndex,
		setQuestionIndex,
		currentQuestion,
		appendQuestion,
		swapQuestions,
		removeQuestion
	} = useQuizEditorForm();

	return (
		<section>
			<SectionHeader
				title="Lernkontrolle"
				subtitle="Fragen, die Studierenden nach Bearbeitung der Lernheit angezeigt werden sollen.
					Die erfolgreiche Beantwortung der Fragen ist notwendig, um diese Lernheit
					erfolgreich abzuschließen."
			/>

			<div className="flex flex-wrap gap-4 text-sm">
				<button
					type="button"
					className="btn-primary mb-8 w-fit"
					onClick={() => appendQuestion("multiple-choice")}
				>
					<PlusIcon className="h-5" />
					<span>Multiple-Choice</span>
				</button>

				<button
					type="button"
					className="btn-primary mb-8 w-fit"
					onClick={() => appendQuestion("short-text")}
				>
					<PlusIcon className="h-5" />
					<span>Kurze Antwort</span>
				</button>

				<button
					type="button"
					className="btn-primary mb-8 w-fit"
					onClick={() => appendQuestion("programming")}
				>
					<PlusIcon className="h-5" />
					<span>Programmieren</span>
				</button>
			</div>

			{questionIndex >= 0 && (
				<Reorder.Group values={quiz} onReorder={setQuiz} axis="x" className="w-full">
					<Tabs selectedIndex={questionIndex} onChange={index => setQuestionIndex(index)}>
						{quiz.map((value, index) => (
							<Reorder.Item
								as="div"
								value={value}
								key={value.id}
								className="bg-gray-50"
							>
								<RemovableTab key={value.id} onRemove={() => removeQuestion(index)}>
									<div className="flex flex-col">
										<span className="text-xs font-normal">{value.type}</span>
										<span>Frage {index + 1}</span>
									</div>
								</RemovableTab>
							</Reorder.Item>
						))}
					</Tabs>
				</Reorder.Group>
			)}

			{currentQuestion && (
				<BaseQuestionForm
					currentQuestion={currentQuestion}
					control={control}
					index={questionIndex}
				>
					<RenderQuestionTypeForm question={currentQuestion} index={questionIndex} />
				</BaseQuestionForm>
			)}
		</section>
	);
}

function RenderQuestionTypeForm({ question, index }: { question: QuestionType; index: number }) {
	if (question.type === "multiple-choice") {
		return <MultipleChoiceForm question={question} index={index} />;
	}

	if (question.type === "short-text") {
		return <ShortTextForm question={question} index={index} />;
	}

	if (question.type === "programming") {
		return <ProgrammingForm question={question} index={index} />;
	}

	return <span className="text-red-500">Unknown question type: {question.type}</span>;
}

function BaseQuestionForm({
	currentQuestion,
	index,
	control,
	children
}: {
	currentQuestion: QuestionType;
	index: number;
	control: Control<{ quiz: QuizContent }, unknown>;
	children: React.ReactNode;
}) {
	return (
		<div className="pt-8">
			<span className="font-semibold text-secondary">{currentQuestion.type}</span>
			<h5 className="mb-4 mt-2 text-2xl font-semibold tracking-tight">Frage {index + 1}</h5>

			<div className="flex flex-col gap-12">
				<Controller
					key={currentQuestion.questionId}
					control={control}
					name={`quiz.${index}.statement`}
					render={({ field }) => (
						<MarkdownField
							minHeight="256px"
							content={field.value}
							setValue={field.onChange}
						/>
					)}
				/>

				<Divider />

				{children}

				<Divider />

				<HintForm questionIndex={index} />
			</div>
		</div>
	);
}

function HintForm({ questionIndex }: { questionIndex: number }) {
	const { control } = useFormContext<{ quiz: QuestionType[] }>();

	const {
		append,
		remove,
		fields: hints
	} = useFieldArray({
		control,
		name: `quiz.${questionIndex}.hints`
	});

	function addHint() {
		append({
			hintId: getRandomId(),
			content: ""
		});
	}

	function removeHint(hintIndex: number) {
		const confirmed = window.confirm("Hinweis entfernen?");
		if (confirmed) {
			remove(hintIndex);
		}
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">Hinweise</h5>
				<button type="button" className="btn-primary w-fit items-center" onClick={addHint}>
					<PlusIcon className="h-5" />
					<span>Hinweis hinzufügen</span>
				</button>
			</div>

			<p className="text-sm text-light">
				Studierende können die angegebenen Hinweise nutzen, wenn sie Probleme beim
				Beantworten einer Frage haben.
			</p>

			{hints.map((hint, hintIndex) => (
				<div
					key={hint.hintId}
					className="flex flex-col gap-4 rounded-lg border border-yellow-500 bg-yellow-100  p-4"
				>
					<button
						type="button"
						className="self-end text-xs text-red-500"
						onClick={() => removeHint(hintIndex)}
					>
						Entfernen
					</button>

					<Controller
						control={control}
						name={`quiz.${questionIndex}.hints.${hintIndex}.content`}
						render={({ field }) => (
							<MarkdownField
								content={field.value}
								setValue={field.onChange}
								minHeight="128px"
							/>
						)}
					></Controller>
				</div>
			))}
		</section>
	);
}
