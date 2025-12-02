import { Dialog, DialogActions } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { Skill } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SkillFormModel } from "@self-learning/types";

const skillSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string(),
	parent: z.string().optional()
});

type SkillFormData = z.infer<typeof skillSchema>;

export function AddSkillDialog({
	onClose,
	selectedSkill,
	skills
}: {
	selectedSkill?: Skill;
	skills: SkillFormModel[];
	onClose: (result?: SkillFormData) => void;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid }
	} = useForm<SkillFormData>({
		resolver: zodResolver(skillSchema),
		mode: "onChange" // Enable live validation
	});

	const onSubmit = (data: SkillFormData) => {
		console.log("onSubmit, data", data);
		onClose(data);
	};

	return (
		<Dialog title="Skill hinzufügen" onClose={onClose}>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<LabeledField label="Name">
					<input
						type="text"
						className={`textfield ${errors.name ? "border-red-500" : ""}`}
						{...register("name")}
					/>
					{errors.name && <span className="text-red-500">{errors.name.message}</span>}
				</LabeledField>

				<LabeledField label="Beschreibung" optional={true}>
					<input type="text" className="textfield" {...register("description")} />
				</LabeledField>

				<LabeledField label="Parent">
					<select
						defaultValue={selectedSkill?.id ?? ""}
						className="textfield"
						{...register("parent")}
					>
						<option value="">None</option>
						{skills.map(skill => (
							<option key={skill.id} value={skill.id}>
								{skill.name}
							</option>
						))}
					</select>
				</LabeledField>

				<DialogActions onClose={onClose}>
					<button type="submit" className="btn-primary" disabled={!isValid}>
						Bestätigen
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
