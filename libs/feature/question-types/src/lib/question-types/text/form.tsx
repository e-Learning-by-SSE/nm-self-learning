/**
 * Teacher-facing form for configuring an open (text) question with optional AI evaluation.
 *
 * Rendered inside BaseQuestionForm in quiz-editor.tsx via QuestionFormRenderer.
 * Uses react-hook-form's useFormContext — the form state lives in the parent QuizEditor.
 *
 * FR-04: Toggle to enable/disable AI evaluation (off by default)
 * FR-05: Toggle disabled + label shown when no LLM config is present
 * FR-06: Example box showing both supported input formats
 */

import { LabeledField } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { TextQuestion } from "./schema";
import { useTranslation } from "next-i18next";

type TextForm = QuestionTypeForm<TextQuestion>;

// ─── Main Form Component ──────────────────────────────────────────────────────

export default function TextForm({ question, index }: { question: TextQuestion; index: number }) {
	const { t } = useTranslation("feature-question-types");
	const { control, setValue } = useFormContext<TextForm>();

	// Reflects whether aiEvaluation is currently set in the form state.
	// If the field is present → toggle is ON; if absent/undefined → toggle is OFF.
	const aiEvaluationValue = useWatch({
		control,
		name: `quiz.questions.${index}.aiEvaluation`
	});
	const isEnabled = !!aiEvaluationValue;

	// FR-05: Ask the router whether an LLM config exists.
	// Using useQuery so it integrates with React's lifecycle without manual useEffect.
	// data is undefined while loading, then { available: boolean }.
	const { data: llmConfigData } = trpc.textEvaluation.checkLlmConfig.useQuery();
	const llmAvailable = llmConfigData?.available ?? null; // null = still loading

	// FR-04: Enable → initialise sub-object with sensible defaults
	function handleToggleOn() {
		setValue(`quiz.questions.${index}.aiEvaluation`, {
			solutionOrConcepts: question.aiEvaluation?.solutionOrConcepts ?? "",
			passingThreshold: question.aiEvaluation?.passingThreshold ?? 80
		});
	}

	// FR-04: Disable → remove the field entirely so it is not stored in the DB
	function handleToggleOff() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setValue(`quiz.questions.${index}.aiEvaluation`, undefined as any);
	}

	function handleToggleChange(e: React.ChangeEvent<HTMLInputElement>) {
		e.target.checked ? handleToggleOn() : handleToggleOff();
	}

	// Toggle is only disabled when we KNOW the config is missing.
	// While loading (llmAvailable === null) we keep it disabled too so
	// the teacher doesn't enable it before we know the state.
	const isToggleDisabled = llmAvailable !== true;

	return (
		<div className="flex flex-col gap-6">
			{/* ── AI Evaluation Toggle (FR-04, FR-05) ── */}
			<div className="rounded-lg border border-c-border bg-c-surface-2 p-4 flex flex-col gap-3">
				{llmAvailable === true && (
					<div>
						<div className="flex items-center gap-3">
							<input
								id={`ai-eval-toggle-${index}`}
								type="checkbox"
								className="checkbox"
								checked={isEnabled}
								disabled={isToggleDisabled}
								onChange={handleToggleChange}
							/>
							<label
								htmlFor={`ai-eval-toggle-${index}`}
								className={`select-none font-medium ${isToggleDisabled ? "text-c-text-muted" : ""}`}
							>
								{t("Enable AI evaluation")}
							</label>
						</div>

						<p className="text-sm text-c-text-muted">
							{t(
								"When enabled, the AI will automatically evaluate the open-ended responses of the students based on your sample solution or expected concepts."
							)}
						</p>
					</div>
				)}
				{/* FR-05: Status labels next to the toggle */}
				{llmAvailable === null && (
					<span className="text-sm text-c-text-muted">
						{t("Checking LLM configuration…")}
					</span>
				)}
				{llmAvailable === false && (
					<span className="text-sm text-red-600">
						{t("AI evaluation is not available (no LLM configuration available)")}
					</span>
				)}
			</div>

			{/* ── AI Evaluation Fields — only shown when toggle is ON (FR-04) ── */}
			{isEnabled && (
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

					{/* FR-06: Show both supported formats as examples */}
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
