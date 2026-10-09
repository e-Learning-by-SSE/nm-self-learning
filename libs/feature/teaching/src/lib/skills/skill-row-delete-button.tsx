import { useTranslation } from "next-i18next";
import { Dialog, DialogActions, IconOnlyButton } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import styles from "./folder-editor/folder-table.module.css";

export function SkillRowDeleteButton({ skillId }: { skillId: string }) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const { mutateAsync: deleteSkill } = trpc.skill.deleteSkills.useMutation();
	const utils = trpc.useUtils();
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteSkill({ ids: [skillId] });
		await utils.skill.getSkills.invalidate();
	};

	const handleConfirm = () => {
		void handleDelete();
		setShowConfirmation(false);
	};

	const handleCancel = () => {
		setShowConfirmation(false);
	};

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-4 w-4 text-red-500" />}
				className={`${styles["skill-row-add"]} invisible group-hover:visible !p-1`}
				onClick={event => {
					event.preventDefault();
					event.stopPropagation();
					setShowConfirmation(true);
				}}
				title={t("common:delete")}
			/>
			{showConfirmation && (
				<Dialog title={t("common:delete")} onClose={handleCancel}>
					{t("Skills_Delete_Confirm")}
					<DialogActions onClose={handleCancel}>
						<button className="btn-primary hover:bg-c-danger" onClick={handleConfirm}>
							{t("common:delete")}
						</button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}
