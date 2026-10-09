import { useTranslation } from "next-i18next";
import type { TFunction } from "i18next";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SkillFormModel } from "@self-learning/types";
import { SelectSkillsView } from "./select-skill-view";

const createSkillSchema = (t: TFunction) =>
	z.object({
		name: z.string().min(1, t("Skills_Name_Required")),
		description: z.string()
	});

export type SkillDialogResult = z.infer<ReturnType<typeof createSkillSchema>> & {
	parents: string[];
};

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
	const { t } = useTranslation(["feature-teaching", "common"]);
	const skillSchema = createSkillSchema(t);
	const isEdit = Boolean(skill);
	const {
		register,
		handleSubmit,
		formState: { errors, isValid }
	} = useForm<z.infer<ReturnType<typeof createSkillSchema>>>({
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

	const onSubmit = (data: z.infer<ReturnType<typeof createSkillSchema>>) => {
		onClose({ ...data, parents: parentSkills.map(item => item.id) });
	};

	return (
		<Dialog
			title={
				isEdit
					? t("Skills_Edit")
					: parentSkills.length > 0
						? t("Skills_Add")
						: t("Skills_Add_Repository")
			}
			onClose={onClose}
		>
			<form
				onSubmit={e => {
					e.stopPropagation();
					handleSubmit(onSubmit)(e);
				}}
				className="flex flex-col gap-4"
			>
				<LabeledField label={t("common:Name")}>
					<input
						type="text"
						className={`textfield ${errors.name ? "border-red-500" : ""}`}
						{...register("name")}
					/>
					{errors.name && <span className="text-red-500">{errors.name.message}</span>}
				</LabeledField>

				<LabeledField label={t("common:Description")} optional={true}>
					<input type="text" className="textfield" {...register("description")} />
				</LabeledField>

				<LabeledField label={t("Skills_Parents")}>
					<SelectSkillsView
						skills={parentSkills}
						catalog={skills}
						excludedIds={excludeIds}
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
						{t("common:Confirm")}
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
