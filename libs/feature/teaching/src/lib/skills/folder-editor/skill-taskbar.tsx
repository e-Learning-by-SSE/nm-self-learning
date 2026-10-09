import { useTranslation } from "next-i18next";
import type { TFunction } from "i18next";
import { SkillFormModel } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { CreateChildSkillButton } from "../create-child-skill-button";
import { SkillDeleteButton } from "../skill-row-delete-button";
import { SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { trpc } from "@self-learning/api-client";
import { Skill } from "@prisma/client";

const withErrorHandling = async (t: TFunction, fn: () => Promise<void>) => {
	try {
		await fn();
		showToast({
			type: "success",
			title: t("Skills_Action_Success"),
			subtitle: ""
		});
	} catch (error) {
		if (error instanceof Error) {
			showToast({
				type: "error",
				title: t("Skills_Action_Failed"),
				subtitle: error.message ?? ""
			});
		}
		console.log("Could not change skill:", error);
	}
};

export function AddChildButton({
	parentSkill,
	childrenNumber,
	updateSkillDisplay,
	handleSelection,
	skillDefaults,
	authorId
}: {
	parentSkill: SkillFormModel;
	childrenNumber: number;
	updateSkillDisplay: UpdateVisuals;
	handleSelection: SkillSelectHandler;
	skillDefaults?: Partial<Skill>;
	authorId: number;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const { mutateAsync: addSkillOnParent } = trpc.skill.createSkillWithParents.useMutation();

	const newSkill = {
		name: t("Skills_Default_Child_Name", {
			number: childrenNumber + 1,
			name: parentSkill.name
		}),
		description: t("Skills_Default_Description"),
		children: [],
		parents: [parentSkill.id],
		...skillDefaults
	};

	const handleAddSkill = async () =>
		await withErrorHandling(t, async () => {
			const result = await addSkillOnParent({
				authorId: authorId,
				parentSkillId: parentSkill.id,
				skill: newSkill
			});
			if (result) {
				const { createdSkill, parentSkill } = result;
				updateSkillDisplay([
					{ id: createdSkill.id, shortHighlight: true },
					{
						id: parentSkill.id,
						shortHighlight: true,
						isExpanded: true
					}
				]);
				handleSelection(createdSkill.id);
			} else {
				throw new Error(t("Skills_Create_Failed"));
			}
		});

	return <CreateChildSkillButton onCreate={handleAddSkill} />;
}

export function SkillDeleteOption({
	skill,
	inline = false,
	onDeleteSuccess
}: {
	skill: SkillFormModel;
	inline?: boolean;
	onDeleteSuccess?: () => void | PromiseLike<void>;
}) {
	return (
		<SkillDeleteButton
			skillId={skill.id}
			variant={inline ? "row" : "default"}
			sharedSkillName={skill.parents.length > 1 ? skill.name : undefined}
			onDeleteSuccess={onDeleteSuccess}
		/>
	);
}

export function NewSkillButton({
	authorId,
	onSuccess,
	skillDefaults
}: {
	authorId: number;
	onSuccess?: (skill: Skill) => void | Promise<void>;
	skillDefaults?: Partial<Skill>;
}) {
	const { t, i18n } = useTranslation(["feature-teaching", "common"]);
	const { mutateAsync: createNewSkill } = trpc.skill.createSkill.useMutation();

	const date = new Date();
	const formattedDate = date.toLocaleDateString(i18n.language);

	const newSkill = {
		name: t("Skills_Default_Name", {
			date: formattedDate,
			time: date.toLocaleTimeString(i18n.language, {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			})
		}),
		description: t("Skills_Default_Description"),
		children: [],
		...skillDefaults
	};
	const onCreateSkill = async () => {
		const createdSkill = await createNewSkill({
			skill: newSkill,
			authorId: authorId
		});
		await onSuccess?.(createdSkill ?? null);
	};
	return (
		<button type="button" className="btn btn-primary" onClick={onCreateSkill}>
			{t("Skills_Create")}
		</button>
	);
}
