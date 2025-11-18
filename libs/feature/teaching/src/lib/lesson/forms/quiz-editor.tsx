import {
	INITIAL_QUESTION_CONFIGURATION_FUNCTIONS,
	QUESTION_TYPE_DISPLAY_NAMES,
	QuestionFormRenderer,
	QuestionType
} from "@self-learning/question-types";
import { Quiz } from "@self-learning/quiz";
import {
	Divider,
	DropdownMenu,
	IconOnlyButton,
	RemovableTab,
	SectionHeader,
	Tabs
} from "@self-learning/ui/common";
import { LabeledField, MarkdownField } from "@self-learning/ui/forms";
import { getRandomId } from "@self-learning/util/common";
import { Reorder } from "framer-motion";
import { useMemo, useState } from "react";
import { Control, Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@headlessui/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

type QuizForm = { quiz: Quiz };

export function useQuizEditorForm() {
	const { control, register, setValue, getValues } = useFormContext<QuizForm>();
	const {
		append,
		remove,
		fields: quiz,
		replace
	} = useFieldArray({
		control,
		name: "quiz.questions"
	});

	const [questionIndex, setQuestionIndex] = useState<number>(quiz.length > 0 ? 0 : -1);
	const currentQuestion = quiz[questionIndex];
	const questionOrder = useWatch({ control, name: "quiz.questionOrder" });
	const orderedQuestions = useMemo(() => {
		if (!questionOrder || questionOrder.length === 0) return quiz;

		const ordered = questionOrder
			.map(id => quiz.find(q => q.questionId === id))
			.filter((q): q is NonNullable<typeof q> => !!q);

		return ordered;
	}, [quiz, questionOrder]);

	function appendQuestion(type: QuestionType["type"]) {
		const initialConfigFn = INITIAL_QUESTION_CONFIGURATION_FUNCTIONS[type];

		if (!initialConfigFn) {
			console.error("No initial configuration function found for question type", type);
			return;
		}
		const newQuestion = initialConfigFn();

		if (!newQuestion.questionId) {
			console.error("InitialConfigFn did not return a questionId!", { newQuestion });
			throw new Error("Invalid question: missing questionId");
		}
		append(newQuestion);
		setValue("quiz.questionOrder", [
			...(getValues("quiz.questionOrder") ?? []),
			newQuestion.questionId
		]);
		setQuestionIndex(quiz.length);
	}

	function removeQuestion(index: number) {
		const confirm = window.confirm("Aufgabe entfernen?");
		const removedId = quiz[index].questionId;
		if (confirm) {
			remove(index);
			setValue(
				"quiz.questionOrder",
				(getValues("quiz.questionOrder") ?? []).filter(id => id !== removedId)
			);
			if (index === questionIndex) {
				setQuestionIndex(quiz.length - 2); // set to last index or -1 if no questions exist
			}
		}
	}

	function setQuiz(questions: QuizForm["quiz"]["questions"]) {
		setValue("quiz.questions", questions);
		setValue(
			"quiz.questionOrder",
			questions.map(q => q.questionId)
		);

		const currentQuestionIndex = questions.findIndex(
			question => question.questionId === currentQuestion?.questionId
		);
		if (currentQuestionIndex !== -1) {
			setQuestionIndex(currentQuestionIndex);
		} else {
			setQuestionIndex(questions.length > 0 ? 0 : -1);
		}
		replace(questions);
	}

	return {
		control,
		quiz,
		register,
		setValue,
		setQuiz,
		questionIndex,
		setQuestionIndex,
		currentQuestion,
		appendQuestion,
		removeQuestion,
		orderedQuestions
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
		removeQuestion,
		orderedQuestions
	} = useQuizEditorForm();

	return (
		<section className="flex flex-col gap-8">
			<SectionHeader
				title="Aufgaben"
				subtitle="Aufgaben, die Studierenden nach Bearbeitung der Lerneinheit angezeigt werden sollen.
					Die erfolgreiche Beantwortung der Fragen ist notwendig, um diese Lerneinheit
					erfolgreich abzuschließen."
				button={
					<DropdownMenu
						title="Aufgabe erstellen"
						button={
							<div className="btn-primary">
								<span className="font-semibold text-white">Aufgabe erstellen</span>
							</div>
						}
					>
						{Object.keys(QUESTION_TYPE_DISPLAY_NAMES).map(type => (
							<Button
								key={type}
								type={"button"}
								title="Aufgabentyp hinzufügen"
								className={"w-full text-left px-3 py-1"}
								onClick={() => appendQuestion(type as QuestionType["type"])}
							>
								{QUESTION_TYPE_DISPLAY_NAMES[type as QuestionType["type"]]}
							</Button>
						))}
					</DropdownMenu>
				}
			/>

			<QuizConfigForm />

			{questionIndex >= 0 && (
				<Reorder.Group values={quiz} onReorder={setQuiz} axis="x" className="w-full">
					<Tabs selectedIndex={questionIndex} onChange={index => setQuestionIndex(index)}>
						{orderedQuestions.map((value, index) => (
							<Reorder.Item
								as="div"
								value={value}
								key={value.id}
							>
								<RemovableTab key={value.id} onRemove={() => removeQuestion(index)}>
									<div className="flex flex-col">
										<span className="text-xs font-normal">
											Aufgabe {index + 1} von {quiz.length}
										</span>
										<span className="flex">
											{QUESTION_TYPE_DISPLAY_NAMES[value.type]}
										</span>
									</div>
								</RemovableTab>
							</Reorder.Item>
						))}
					</Tabs>
				</Reorder.Group>
			)}

			{currentQuestion && (
				<BaseQuestionForm
					key={currentQuestion.questionId}
					currentQuestion={currentQuestion}
					control={control}
					index={questionIndex}
				>
					<QuestionFormRenderer question={currentQuestion} index={questionIndex} />
				</BaseQuestionForm>
			)}
		</section>
	);
}

function QuizConfigForm() {
	const { control, register, setValue } = useQuizEditorForm();

	const config = useWatch({
		control,
		name: "quiz.config"
	});

	function resetToDefault() {
		setValue("quiz.config", null);
	}

	function initCustomConfig() {
		setValue(
			"quiz.config",
			config
				? config
				: {
						hints: {
							enabled: false,
							maxHints: 0
						},
						maxErrors: 0,
						showSolution: false
					}
		);
	}

	return (
		<div className="-mt-8 flex flex-col gap-4 rounded-lg bg-gray-200 p-4">
			<div className="flex flex-col gap-4">
				<span className="flex items-center gap-4">
					<input
						type="checkbox"
						className="checkbox"
						id="customConfig"
						checked={!config}
						onChange={e => (e.target.checked ? resetToDefault() : initCustomConfig())}
					/>
					<label htmlFor="customConfig" className="select-none text-sm">
						Standard-Konfiguration verwenden
					</label>
				</span>

				{!config ? (
					<ul className="list-inside list-disc text-sm text-light">
						<li>Alle Fragen müssen korrekt beantwortet werden</li>
						<li>Lösungen werden nach falscher Beantwortung nicht angezeigt</li>
						<li>Unbegrenzte Verwendung von Hinweisen</li>
					</ul>
				) : (
					<div className="flex flex-col gap-4 text-sm">
						<span className="flex items-center gap-4">
							<input
								{...register("quiz.config.showSolution")}
								type="checkbox"
								id="showSolutions"
								className="checkbox"
							></input>
							<label htmlFor="showSolutions" className="select-none">
								Lösungen anzeigen
							</label>
						</span>

						<span className="flex items-center gap-4">
							<input
								{...register("quiz.config.hints.enabled")}
								type="checkbox"
								id="hintsEnabled"
								className="checkbox"
							></input>
							<label htmlFor="hintsEnabled" className="select-none">
								Hinweise aktivieren
							</label>
						</span>

						<LabeledField label="Max. erlaubte Hinweise">
							<input
								{...register("quiz.config.hints.maxHints")}
								type={"number"}
								className="textfield w-fit"
								placeholder="z. B. 2"
							/>
						</LabeledField>

						<LabeledField label="Max. erlaubte falsche Antworten">
							<input
								{...register("quiz.config.maxErrors")}
								type={"number"}
								className="textfield w-fit"
								defaultValue={0}
							/>
						</LabeledField>
					</div>
				)}
			</div>
		</div>
	);
}

function BaseQuestionForm({
	currentQuestion,
	index,
	control,
	children
}: {
	currentQuestion: QuestionType;
	index: number;
	control: Control<QuizForm, unknown>;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-6">
			<h5 className="text-2xl font-semibold tracking-tight">Aufgabe</h5>
			<Controller
				key={currentQuestion.questionId}
				control={control}
				name={`quiz.questions.${index}.statement`}
				render={({ field }) => (
					<MarkdownField content={field.value} setValue={field.onChange} />
				)}
			/>

			<Divider />

			{children}

			<Divider />

			<HintForm questionIndex={index} />
		</div>
	);
}

function HintForm({ questionIndex }: { questionIndex: number }) {
	const { control } = useFormContext<QuizForm>();

	const {
		append,
		remove,
		fields: hints
	} = useFieldArray({
		control,
		name: `quiz.questions.${questionIndex}.hints`
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
		<section className="flex flex-col gap-4 mb-8">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">Hinweise</h5>

				<IconOnlyButton
					icon={<PlusIcon className="h-5 w-5" />}
					variant="primary"
					onClick={addHint}
					title={"Hinweis hinzufügen"}
				/>
			</div>

			<p className="text-sm text-light">
				Studierende können die angegebenen Hinweise nutzen, wenn sie Probleme beim
				Beantworten einer Frage haben.
			</p>

			{hints.map((hint, hintIndex) => (
				<div
					key={hint.hintId}
					className="flex flex-col gap-4 rounded-lg border border-gray-300 bg-gray-200  p-4"
				>
					<div className="flex items-start gap-4 w-full">
						<div className="flex-1">
							<Controller
								control={control}
								name={`quiz.questions.${questionIndex}.hints.${hintIndex}.content`}
								render={({ field }) => (
									<MarkdownField
										content={field.value}
										setValue={field.onChange}
										placeholder="Hinweis eingeben..."
										inline={true}
									/>
								)}
							></Controller>
						</div>

						<IconOnlyButton
							icon={<TrashIcon className="h-4 w-4" />}
							variant="danger"
							onClick={() => removeHint(hintIndex)}
							title={"Hinweis entfernen"}
						/>
					</div>
				</div>
			))}
		</section>
	);
}
