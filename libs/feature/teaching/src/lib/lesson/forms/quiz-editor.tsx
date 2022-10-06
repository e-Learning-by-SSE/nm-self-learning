import { PlusIcon } from "@heroicons/react/outline";
import { ArrowSmLeftIcon, ArrowSmRightIcon, XIcon } from "@heroicons/react/solid";
import {
	BaseQuestion,
	MultipleChoiceForm,
	QuestionType,
	ShortTextForm
} from "@self-learning/question-types";
import { Divider, RemovableTab, SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { MarkdownField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { getRandomId } from "@self-learning/util/common";
import { useState } from "react";
import { Control, Controller, useFieldArray, useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";

export function useQuizEditorForm() {
	const { control } = useFormContext<LessonFormModel>();
	const {
		append,
		remove,
		fields: quiz,
		swap
	} = useFieldArray({
		control,
		name: "quiz"
	});

	const [questionIndex, setQuestionIndex] = useState<number>(-1);
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
		questionIndex,
		setQuestionIndex,
		currentQuestion,
		appendQuestion,
		swapQuestions,
		removeQuestion
	} = useQuizEditorForm();

	return (
		<section>
			<CenteredContainer className="flex flex-col">
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
				</div>

				{questionIndex >= 0 && (
					<>
						<Tabs
							selectedIndex={questionIndex}
							onChange={index => setQuestionIndex(index)}
						>
							{quiz.map((_, index) => (
								<RemovableTab key={index} onRemove={() => removeQuestion(index)}>
									Frage {index + 1}
								</RemovableTab>
							))}
						</Tabs>

						<div className="flex flex-wrap gap-4 pt-8">
							<button
								type="button"
								className="btn-small"
								disabled={questionIndex === 0}
								title="Nach links verschieben"
								onClick={() => swapQuestions(questionIndex, questionIndex - 1)}
							>
								<ArrowSmLeftIcon className="h-5" />
							</button>
							<button
								type="button"
								className="btn-small"
								disabled={questionIndex === quiz.length - 1}
								title="Nach rechts verschieben"
								onClick={() => swapQuestions(questionIndex, questionIndex + 1)}
							>
								<ArrowSmRightIcon className="h-5" />
							</button>
						</div>
					</>
				)}
			</CenteredContainer>

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
	control: Control<LessonFormModel, unknown>;
	children: React.ReactNode;
}) {
	return (
		<div className="px-4 xl:px-0">
			<div className="mx-auto mt-8 flex w-full flex-col rounded-lg border border-light-border bg-white p-8">
				<h4 className="font-semibold text-secondary">{currentQuestion.type}</h4>
				<div className="flex flex-col gap-8">
					<section>
						<h5 className="mb-4 mt-8 text-2xl font-semibold tracking-tight">Frage</h5>

						<div className="rounded-lg bg-indigo-50 p-4">
							<Controller
								key={currentQuestion.questionId}
								control={control}
								name={`quiz.${index}.statement`}
								render={({ field }) => (
									<MarkdownField
										minHeight="128px"
										content={field.value}
										setValue={field.onChange}
									/>
								)}
							/>
						</div>
					</section>

					<Divider />

					{children}

					<Divider />

					<HintForm questionIndex={index} />
				</div>
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
		<section className="flex flex-col gap-8">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">Hinweise</h5>
				<button type="button" className="btn-stroked w-fit items-center" onClick={addHint}>
					<PlusIcon className="h-5" />
					<span>Hinweis hinzufügen</span>
				</button>
			</div>

			<p className="text-light">
				Studierende können die angegebenen Hinweise nutzen, wenn sie Probleme beim
				Beantworten einer Frage haben.
			</p>

			{hints.map((hint, hintIndex) => (
				<div
					key={hint.hintId}
					className="relative flex flex-col gap-4 rounded-lg border border-light-border bg-yellow-100 p-4"
				>
					<button
						type="button"
						className="absolute top-4 right-4 text-xs text-red-500"
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
