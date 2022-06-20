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
					Add Multiple-Choice
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
			<p className="mb-4 mt-8 text-2xl font-semibold tracking-tight">Frage</p>

			<div className="rounded-lg bg-indigo-50 p-4">
				<Controller
					key={currentQuestion.questionId}
					control={control}
					name={`quiz.${index}.statement`}
					render={({ field }) => (
						<MarkdownField
							minHeight="256px"
							cacheKey={[`q-${currentQuestion.questionId}`]}
							content={field.value}
							setValue={field.onChange}
						/>
					)}
				/>
			</div>

			<p className="mt-8 mb-4 text-2xl font-semibold tracking-tight">Antworten</p>

			{children}

			<p className="mt-8 mb-2 text-2xl font-semibold tracking-tight">Hinweise</p>
			<p className="text-light">
				Studierende können die angegebenen Hinweise nutzen, wenn sie Probleme beim
				Beantworten einer Frage haben.
			</p>
		</div>
	);
}
