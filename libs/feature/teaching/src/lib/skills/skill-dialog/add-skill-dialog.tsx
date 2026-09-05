import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SkillFormModel } from "@self-learning/types";
import { SelectSkillsView } from "./select-skill-view";

const skillSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string()
});

export type SkillDialogResult = z.infer<typeof skillSchema> & { parents: string[] };

export function AddSkillDialog({
	onClose,
	selectedSkill,
	skill,
	defaultName,
	skills
}: {
	selectedSkill?: { id: string };
	skill?: SkillFormModel;
	defaultName?: string;
	skills: SkillFormModel[];
	onClose: OnDialogCloseFn<SkillDialogResult>;
}) {
	const isEdit = Boolean(skill);
	const {
		register,
		handleSubmit,
		formState: { errors, isValid }
	} = useForm<z.infer<typeof skillSchema>>({
		resolver: zodResolver(skillSchema),
		mode: "onChange", // Enable live validation
		defaultValues: {
			name: skill?.name ?? defaultName ?? "",
			description: skill?.description ?? ""
		}
	});

	// parents are a set — picked via SelectSkillDialog, not a dropdown
	const [parentSkills, setParentSkills] = useState<SkillFormModel[]>(() => {
		if (skill) return skills.filter(item => skill.parents.includes(item.id));
		const selected = selectedSkill && skills.find(item => item.id === selectedSkill.id);
		return selected ? [selected] : [];
	});

	const excludeIds = new Set<string>([
		...(skill ? [skill.id, ...skill.children] : []),
		...parentSkills.map(item => item.id)
	]);

	const onSubmit = (data: z.infer<typeof skillSchema>) => {
		onClose({ ...data, parents: parentSkills.map(item => item.id) });
	};

	return (
		<Dialog title={isEdit ? "Skill bearbeiten" : "Skill hinzufügen"} onClose={onClose}>
			<form
				onSubmit={e => {
					e.stopPropagation();
					handleSubmit(onSubmit)(e);
				}}
				className="flex flex-col gap-4"
			>
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

				<LabeledField label="Eltern">
					<SelectSkillsView
						skills={parentSkills}
						catalog={skills}
						excludeIds={excludeIds}
						onDeleteSkill={removed =>
							setParentSkills(prev => prev.filter(item => item.id !== removed.id))
						}
						onAddSkill={added => {
							if (!added) return;
							setParentSkills(prev => {
								const ids = new Set(prev.map(item => item.id));
								return [...prev, ...added.filter(item => !ids.has(item.id))];
							});
						}}
					/>
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
