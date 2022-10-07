import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { ProgrammingQuestion } from "./schema";

export function ProgrammingForm({
	question,
	index
}: {
	question: ProgrammingQuestion;
	index: number;
}) {
	const { control } = useFormContext<{ quiz: ProgrammingQuestion[] }>();

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap gap-4">
				<LabeledField label="Modus">
					<Controller
						control={control}
						name={`quiz.${index}.custom.mode`}
						render={({ field }) => (
							<select
								value={field.value}
								onChange={field.onChange}
								className="textfield w-64 rounded-lg px-8"
							>
								<option value="typescript">standalone</option>
								<option value="javascript">callable</option>
							</select>
						)}
					></Controller>
				</LabeledField>

				<LabeledField label="Programmiersprache">
					<Controller
						control={control}
						name={`quiz.${index}.language`}
						render={({ field }) => (
							<select
								value={field.value}
								onChange={field.onChange}
								className="textfield w-64 rounded-lg px-8"
							>
								<option value="java">Java</option>
								<option value="python">Python</option>
								<option value="typescript">TypeScript</option>
								<option value="javascript">JavaScript</option>
							</select>
						)}
					></Controller>
				</LabeledField>
			</div>

			<section className="grid grid-cols-2 gap-4">
				<LabeledField label="Template">
					<Controller
						control={control}
						name={`quiz.${index}.custom.solutionTemplate`}
						render={({ field }) => (
							<EditorField
								key={question.language}
								language={question.language}
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					></Controller>
				</LabeledField>

				<LabeledField label="Benötigte Ausgabe">
					<Controller
						control={control}
						name={`quiz.${index}.custom.expectedOutput`}
						render={({ field }) => (
							<EditorField
								key={question.language}
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					></Controller>
				</LabeledField>
			</section>
		</div>
	);
}
