import { PlusIcon } from "@heroicons/react/outline";
import { QuestionType } from "@self-learning/types";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { Control, Controller, useFieldArray, useFormContext } from "react-hook-form";
import { MarkdownField } from "../../markdown-editor";
import { LessonFormModel } from "../lesson-editor";
import { MultipleChoiceForm } from "./questions/multiple-choice-form";

export function QuizEditor() {
	const { control } = useFormContext<LessonFormModel>();
	const { append, fields: quiz } = useFieldArray({
		control,
		name: "quiz"
	});

	const [questionIndex, setQuestionIndex] = useState<number>(0);
	const currentQuestion = quiz[questionIndex];

	function appendQuestion(type: QuestionType["type"]) {
		if (type === "multiple-choice") {
			append({
				type: "multiple-choice",
				questionId: window.crypto.randomUUID(),
				answers: [],
				statement: "",
				withCertainty: false
			});
		}
	}

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
					type="button"
					className="btn-primary mb-8 w-fit"
					onClick={() => appendQuestion("multiple-choice")}
				>
					<PlusIcon className="h-5" />
					<span>Multiple-Choice</span>
				</button>

				<Tabs selectedIndex={questionIndex} onChange={index => setQuestionIndex(index)}>
					{quiz.map((_, index) => (
						<Tab key={index}>Frage {index + 1}</Tab>
					))}
				</Tabs>
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
		<div className="mx-auto mt-8 flex w-full flex-col rounded-lg border border-light-border bg-white p-8 xl:w-[90vw]">
			<h4 className="font-semibold text-secondary">{currentQuestion.type}</h4>
			<div className="flex flex-col gap-16">
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
									cacheKey={[`q-${currentQuestion.questionId}`]}
									content={field.value}
									setValue={field.onChange}
								/>
							)}
						/>
					</div>
				</section>

				<section>{children}</section>

				<HintForm questionIndex={index} />
			</div>
		</div>
	);
}

function HintForm({ questionIndex }: { questionIndex: number }) {
	const { control } = useFormContext<LessonFormModel>();

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
			hintId: window.crypto.randomUUID(),
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
				<button className="btn-stroked w-fit items-center" onClick={addHint}>
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
								cacheKey={[`hint-${hintIndex}`]}
								minHeight="128px"
							/>
						)}
					></Controller>
				</div>
			))}
		</section>
	);
}
