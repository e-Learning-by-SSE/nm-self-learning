import { GoalFormModel, goalFormSchema } from "./goal-form-model";
import { Dispatch, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { LabeledField } from "@self-learning/ui/forms";
import { GoalType } from "@prisma/client";

export function GoalEditor({
	goal,
	onConfirm
}: {
	goal: GoalFormModel;
	onConfirm: (goal: GoalFormModel) => void;
}) {
	const isNew = goal.id === "";
	const form = useForm<GoalFormModel>({
		resolver: zodResolver(goalFormSchema),
		defaultValues: { ...goal }
	});
	const [selectedGoalType, setGoalType] = useState(goal.type);
	return (
		<div className="bg-gray-50">
			<FormProvider {...form}>
				<form
					id="goalform"
					onSubmit={e => {
						if ((e.target as HTMLElement).id === "goalform") {
							form.handleSubmit(
								data => {
									console.log("data", data);
									try {
										const validated = goalFormSchema.parse(data);
										onConfirm(validated);
									} catch (error) {
										console.error(error);
									}
								},
								invalid => {
									console.log("invalid", invalid);
								}
							)(e);
						}
					}}
				>
					<div>
						<span className="font-semibold text-secondary">Goal editieren</span>

						<button className="btn-primary w-full" type="submit">
							{isNew ? "Erstellen" : "Speichern"}
						</button>

						<GoalTypForm setGoalType={setGoalType} />
						{selectedGoalType === GoalType.USERSPECIFIC && <GoalUSDescriptionForm />}
						<GoalInfoForm />
					</div>
				</form>
			</FormProvider>
		</div>
	);
}

export function GoalInfoForm() {
	const form = useFormContext<GoalFormModel>();
	const {
		register,
		formState: { errors }
	} = form;
	return (
		<div className="flex flex-col gap-4">
			<LabeledField label="Zu erreichende Anzahl (optional)" error={errors.value?.message}>
				<input
					{...register("value", { valueAsNumber: true })}
					type="number"
					className="textfield"
				/>
			</LabeledField>
			<LabeledField label="Priorität" error={errors.priority?.message}>
				<input
					{...register("priority", { valueAsNumber: true })}
					type="number"
					className="textfield"
				/>
			</LabeledField>
		</div>
	);
}

export function GoalTypForm({ setGoalType }: { setGoalType: Dispatch<GoalType> }) {
	const form = useFormContext<GoalFormModel>();
	const {
		register,
		formState: { errors }
	} = form;
	return (
		<div className="flex flex-col gap-4">
			<LabeledField label="Ziel" error={errors.type?.message}>
				<select
					{...register("type")}
					onChange={e => {
						setGoalType(e.target.value as GoalType);
					}}
				>
					<option value={""} hidden>
						Bitte wählen...
					</option>
					<option value={GoalType.USERSPECIFIC}>Eigenes Ziel definieren</option>
					<option value={GoalType.NUMBEROFLESSONS}>
						Abgeschlossene Lerneinheiten pro Woche
					</option>
					<option value={GoalType.NUMBEROFQUIZATTEMPTS}>
						Absolvierte Quizversuche pro Woche
					</option>
				</select>
			</LabeledField>
		</div>
	);
}

export function GoalUSDescriptionForm() {
	const form = useFormContext<GoalFormModel>();
	const {
		register,
		formState: { errors }
	} = form;
	return (
		<div className="flex flex-col gap-4">
			<LabeledField label="Description" error={errors.description?.message}>
				<input
					{...register("description")}
					type="text"
					className="textarea"
					placeholder="Beschreibung des Ziels"
				/>
			</LabeledField>
		</div>
	);
}
