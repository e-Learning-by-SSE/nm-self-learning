"use client";
import { useTranslation } from "next-i18next";
import { SkillFormModel } from "@self-learning/types";
import { Dialog, DialogActions, showToast } from "@self-learning/ui/common";

/** A skill area: no parents, and at least one child. The area itself is not attached. */
export function isSkillArea(skill: { parents: readonly string[]; children: readonly string[] }) {
	return skill.parents.length === 0 && skill.children.length > 0;
}

export function directChildSkills(
	parent: { children: readonly string[] },
	resolveSkill: (skillId: string) => SkillFormModel | undefined
): SkillFormModel[] {
	const children: SkillFormModel[] = [];
	for (const childId of parent.children) {
		const child = resolveSkill(childId);
		if (child) children.push(child);
	}
	return children;
}

export function toastDeniedSkillAccess(
	translate: (key: string, options?: { name: string }) => string,
	skillName: string
) {
	showToast({
		type: "error",
		title: translate("Skills_No_Access"),
		subtitle: translate("Skills_No_Access_Message", { name: skillName })
	});
}

/** Asks whether to attach the direct children of a skill area. The area itself is not added. */
export function AddSkillChildrenDialog({
	skillName,
	onClose
}: {
	skillName: string;
	onClose: (confirmed: boolean) => void;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);

	return (
		<Dialog title={t("Skills_Add_Children_Title")} onClose={() => onClose(false)}>
			{t("Skills_Add_Children_Confirm", { name: skillName })}
			<DialogActions onClose={() => onClose(false)}>
				<button type="button" className="btn-primary" onClick={() => onClose(true)}>
					{t("common:add")}
				</button>
			</DialogActions>
		</Dialog>
	);
}
