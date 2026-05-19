/**
 * Teacher-facing form for configuring an open (text) question with optional AI evaluation.
 *
 * Example box showing both supported input formats
 */

import { LabeledField } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { Controller, useFormContext } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { TextQuestion } from "./schema";
import { useTranslation } from "next-i18next";

type TextForm = QuestionTypeForm<TextQuestion>;

export default function TextForm({ question, index }: { question: TextQuestion; index: number }) {
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
					{/* Solution / Concepts textarea */}
					<Controller
						control={control}
						name={`quiz.questions.${index}.aiEvaluation.solutionOrConcepts`}
						rules={{
							required: t(
								"Please enter either a sample solution or a list of expected concepts."
							)
						}}
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

					{/* Show both supported formats as examples */}
					<ExampleBox />

					{/* Passing threshold number input */}
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

// ─── Example Box (FR-06) ─────────────────────────────────────────────────────

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
