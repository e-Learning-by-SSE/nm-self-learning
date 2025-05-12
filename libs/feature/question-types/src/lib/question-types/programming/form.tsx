import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { ProgrammingQuestion } from "./schema";
import { MarkdownListboxMenu } from "@self-learning/markdown";

export default function ProgrammingForm({ index }: { index: number }) {
	const { control, watch, getValues } = useFormContext<QuestionTypeForm<ProgrammingQuestion>>();
	const { update } = useFieldArray({ control, name: "quiz.questions" });

	const selectedMode = watch(`quiz.questions.${index}.custom.mode`);
	const selectedLanguage = watch(`quiz.questions.${index}.language`);

	function switchMode(mode: "standalone" | "callable") {
		const confirmed = window.confirm(
			"Modus ändern? Die bisherigen Einstellungen gehen möglicherweise verloren."
		);

		if (!confirmed) {
			return;
		}

		const currentValue = getValues(`quiz.questions.${index}`);
		console.log(currentValue);

		if (mode === "standalone") {
			update(index, {
				...currentValue,
				type: "programming",
				custom: {
					mode: "standalone",
					expectedOutput: "",
					solutionTemplate: currentValue.custom.solutionTemplate
				}
			});
		}

		if (mode === "callable") {
			update(index, {
				...currentValue,
				type: "programming",
				custom: {
					mode: "callable",
					mainFile: "",
					solutionTemplate: currentValue.custom.solutionTemplate
				}
			});
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<Explainer />
			<span className="flex flex-wrap gap-4">
				<div>
					<LabeledField label="Modus">
						<MarkdownListboxMenu
							title="Modus"
							displayValue={selectedMode}
							options={["standalone", "callable"]}
							onChange={value => switchMode(value as "standalone" | "callable")}
						/>
					</LabeledField>
				</div>

				<div>
					<LabeledField label="Programmiersprache">
						<Controller
							control={control}
							name={`quiz.questions.${index}.language`}
							render={({ field }) => (
								<MarkdownListboxMenu
									title="Programmiersprache"
									displayValue={field.value}
									options={["java", "python", "typescript", "javascript"]}
									onChange={field.onChange}
								/>
							)}
						/>
					</LabeledField>
				</div>
			</span>

			<section className="grid grid-cols-2 gap-4">
				{selectedMode === "standalone" && (
					<>
						<LabeledField label="Template">
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.solutionTemplate`}
								render={({ field }) => (
									<EditorField
										key={selectedLanguage} // re-create editor when language changes to apply correct syntax highlighting
										language={selectedLanguage}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							></Controller>
						</LabeledField>

						<LabeledField label="Benötigte Ausgabe">
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.expectedOutput`}
								render={({ field }) => (
									<EditorField value={field.value} onChange={field.onChange} />
								)}
							></Controller>
						</LabeledField>
					</>
				)}

				{selectedMode === "callable" && (
					<>
						<LabeledField label="Template (Solution.<extension>)">
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.solutionTemplate`}
								render={({ field }) => (
									<EditorField
										key={selectedLanguage} // re-create editor when language changes to apply correct syntax highlighting
										language={selectedLanguage}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							></Controller>
						</LabeledField>

						<LabeledField label="Aufrufendes Programm">
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.mainFile`}
								render={({ field }) => (
									<EditorField
										key={selectedLanguage} // re-create editor when language changes to apply correct syntax highlighting
										language={selectedLanguage}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							></Controller>
						</LabeledField>
					</>
				)}
			</section>
		</div>
	);
}

function Explainer() {
	return (
		<div className="flex flex-col gap-4">
			<p className="text-sm text-light">
				Programmieraufaben können in den folgenden Modi konfiguriert werden:
			</p>

			<ul className="text-sm text-light">
				<li>
					<span className="font-bold">standlone</span>: Der Student entwickelt das
					vollstände Programm. Die Ausgabe des Programms wird mit einer vom Autor
					vordefinierten Ausgabe verglichen, um die Korrektheit der Lösung zu ermitteln.
				</li>
				<li>
					<span className="font-bold">callable</span>: Der Autor schreibt ein Program, das
					den Code des Studenten aufruft. Der Author implementiert zusätzlich eine
					Musterlösung und ruft diese auf. Die Ausgaben beider Algorithmen müssen gemäß
					dem TODO Schema erfolgen und werden verglichen, um die Korrektheit der Lösung zu
					ermitteln.
				</li>
			</ul>
		</div>
	);
}
