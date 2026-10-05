import { useTranslation } from "next-i18next";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	ResourcePermissionsFormType,
	skillCreateSchema,
	skillEditSchema,
	SkillFormModel
} from "@self-learning/types";
import { SelectSkillsView } from "./select-skill-view";
import { useResourceGuard } from "@self-learning/ui/layouts";
import { AccessLevel } from "@prisma/client";
import { GroupAccessEditor } from "../../group/forms/group-form";

export type SkillDialogResult = {
	name: string;
	description: string | null;
	parents: string[];
	permissions: ResourcePermissionsFormType;
};

export function AddSkillDialog({
	onClose,
	selectedSkill,
	skill,
	defaultName,
	skills,
	initialPermissions
}: {
	selectedSkill?: { id: string };
	skill?: SkillFormModel;
	defaultName?: string;
	skills: SkillFormModel[];
	initialPermissions?: ResourcePermissionsFormType;
	onClose: OnDialogCloseFn<SkillDialogResult>;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const isEdit = Boolean(skill);
	const form = useForm({
		resolver: zodResolver(isEdit ? skillEditSchema : skillCreateSchema),
		mode: "onChange",
		defaultValues: skill
			? { ...skill, permissions: initialPermissions ?? [] }
			: {
					name: defaultName ?? "",
					description: "",
					children: [] as string[],
					permissions: [] as ResourcePermissionsFormType
				}
	});
	const {
		control,
		register,
		handleSubmit,
		trigger,
		formState: { errors, isValid }
	} = form;

	const permissions = useWatch({ control, name: "permissions" });
	const hasFull = useResourceGuard(AccessLevel.FULL, permissions);
	const showGroupAccessEditor = !isEdit || hasFull;
	// Default group is written after mount. Re-check so Confirm can enable.
	useEffect(() => {
		if (permissions.length > 0) void trigger("permissions");
	}, [permissions, trigger]);

	const [parentSkills, setParentSkills] = useState<SkillFormModel[]>(() => {
		if (skill) return skills.filter(item => skill.parents.includes(item.id));
		const selected = selectedSkill && skills.find(item => item.id === selectedSkill.id);
		return selected ? [selected] : [];
	});
	const excludeIds = new Set<string>([
		...(skill ? [skill.id, ...skill.children] : []),
		...parentSkills.map(item => item.id)
	]);

	const onSubmit = (data: {
		name: string;
		description: string | null;
		permissions: ResourcePermissionsFormType;
	}) => {
		onClose({
			name: data.name,
			description: data.description,
			permissions: data.permissions,
			parents: parentSkills.map(item => item.id)
		});
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
			<FormProvider {...form}>
				<form
					onSubmit={e => {
						e.stopPropagation();
						handleSubmit(onSubmit)(e);
					}}
					className="flex flex-col gap-4 overflow-auto pr-4"
				>
					<LabeledField label={t("common:Name")}>
						<input
							type="text"
							className={`textfield ${errors.name ? "border-red-500" : ""}`}
							{...register("name")}
						/>
						{errors.name && (
							<span className="text-red-500">{t("Skills_Name_Required")}</span>
						)}
					</LabeledField>

					<LabeledField label={t("common:Description")} optional={true}>
						<input type="text" className="textfield" {...register("description")} />
					</LabeledField>

					<LabeledField label={t("Skills_Parents")}>
						<SelectSkillsView
							restrictToOwnSkills
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

					{showGroupAccessEditor && (
						<GroupAccessEditor
							subtitle={t("Skills_Group_Access_Subtitle")}
							doUseDefaultGroup={!isEdit}
						/>
					)}

					<DialogActions onClose={onClose}>
						<button type="submit" className="btn-primary" disabled={!isValid}>
							{t("common:Confirm")}
						</button>
					</DialogActions>
				</form>
			</FormProvider>
		</Dialog>
	);
}
