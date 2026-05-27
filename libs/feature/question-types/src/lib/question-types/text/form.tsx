import { LabeledField } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { QuestionTypeForm } from "../../base-question";
import { TextQuestion } from "./schema";

type TextForm = QuestionTypeForm<TextQuestion>;

/**
 * The form component for configuring a text question, including the AI evaluation settings.
 * It checks if llm-config is available and shows the appropriate fields for entering the sample solution or expected concepts,
 * as well as the passing threshold. If llm-configis not available, it does not show these fields,
 * and the evaluation will default to accepting any answer.
 *
 * The main features of this component include:
 * - Conditional rendering of AI evaluation fields based on the availability of the LLM configuration.
 * - Validation rules for the passing threshold input.
 * - An example box that shows how to format the AI evaluation input for both supported formats (sample solution and expected concepts).
 *
 * @param index The index of the question in the quiz, used to access the correct form fields for this question.
 * @returns A React component rendering the form for configuring a text question and its AI evaluation settings.
 */
export default function TextForm({ index }: { index: number }) {
	const { t } = useTranslation("feature-question-types");
	const { control } = useFormContext<TextForm>();

	const { data: llmConfigData } = trpc.textEvaluation.checkLlmConfig.useQuery();
	const llmAvailable = llmConfigData?.available ?? null;

	return (
		<div className="flex flex-col gap-6">
			<div className="mb-2">
				<strong className="text-2xl">{t("Solution")}</strong>
			</div>

			{llmAvailable === true && (
				<div className="flex flex-col gap-5 rounded-lg border border-c-border-strong bg-c-surface-3 p-5">
					{/*
					 * No `required` rule here — an empty field means AI evaluation is
					 * disabled, not a form error. The empty-check is done at runtime
					 * in evaluateTextAnswerWithAI().
					 */}
					<Controller
						control={control}
						name={`quiz.questions.${index}.aiEvaluation.solutionOrConcepts`}
						render={({ field, fieldState }) => (
							<LabeledField
								label={t("Sample solution or expected concepts")}
								error={fieldState.error?.message}
							>
								<textarea
									{...field}
									rows={8}
									className="textfield w-full font-mono text-sm"
									placeholder={t(
										"Enter either a sample solution or a list of expected concepts. The AI will automatically determine the format."
									)}
								/>
							</LabeledField>
						)}
					/>
					<ExampleBox />

					<Controller
						control={control}
						name={`quiz.questions.${index}.aiEvaluation.passingThreshold`}
						rules={{
							required: t("Please enter the passing threshold percentage."),
							min: { value: 1, message: t("Minimum 1%") },
							max: { value: 100, message: t("Maximum 100%") }
						}}
						render={({ field, fieldState }) => (
							<LabeledField
								label={t("Passing Threshold (%)")}
								error={fieldState.error?.message}
							>
								<div className="flex items-center gap-3">
									<input
										{...field}
										type="number"
										min={1}
										max={100}
										className="textfield w-24"
										onChange={e => field.onChange(Number(e.target.value))}
									/>
									<span className="text-sm text-c-text-muted">
										{t("% the sample solution must be met to pass.")}
									</span>
								</div>
							</LabeledField>
						)}
					/>
				</div>
			)}
		</div>
	);
}

/**
 * A component that displays example formats for the AI evaluation input, showing both the sample solution format and the expected concepts format.
 * This helps teachers understand how to configure the AI evaluation correctly.
 * @returns A React component rendering the example box with formatting examples for AI evaluation input.
 */
function ExampleBox() {
	const { t } = useTranslation("feature-question-types");
	return (
		<div className="rounded-lg border border-c-border bg-white p-4 flex flex-col gap-3">
			<p className="text-xs font-semibold uppercase tracking-wide text-c-text-muted">
				{t("Examples – both formats are supported")}
			</p>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1">
					<span className="text-xs font-medium text-c-text">
						{t("Format A: Sample Solution")}
					</span>
					<pre className="whitespace-pre-wrap rounded bg-c-surface-2 p-3 text-xs text-c-text-muted font-mono leading-relaxed">
						{t(
							"An algorithm is a precise step-by-step procedure used to solve a problem or process data. Examples include search algorithms, sorting methods, or calculations in computer programs."
						)}
					</pre>
				</div>

				<div className="flex flex-col gap-1">
					<span className="text-xs font-medium text-c-text">
						{t("Format B: Expected Concepts")}
					</span>
					<pre className="whitespace-pre-wrap rounded bg-c-surface-2 p-3 text-xs text-c-text-muted font-mono leading-relaxed">
						{t(
							"- An algorithm is a clear, finite sequence of steps: 30%\n- Serves for systematic problem-solving: 30%\n- The order and structure of steps are important: 20%\n- Each step must be clearly defined: 20%\n"
						)}
					</pre>
				</div>
			</div>
		</div>
	);
}
