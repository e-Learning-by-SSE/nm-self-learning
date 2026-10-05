import { useTranslation } from "next-i18next";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { IconOnlyButton } from "@self-learning/ui/common";
import styles from "./folder-editor/folder-table.module.css";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useAccessibleSkillIds } from "./only-own-skills-checkbox";

export function CreateChildSkillButton({
	parentId,
	onCreate
}: {
	parentId: string;
	onCreate: () => void | Promise<void>;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);

	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	const accessibleSkillIds = useAccessibleSkillIds(!isAdmin);
	if (!isAdmin && !accessibleSkillIds?.has(parentId)) return null;

	return (
		<IconOnlyButton
			icon={<DocumentPlusIcon className="h-4 w-4" />}
			className={`${styles["skill-row-add"]} invisible group-hover:visible !p-1`}
			title={t("Skills_Create_Child")}
			onClick={event => {
				event.preventDefault();
				event.stopPropagation();
				return onCreate();
			}}
		/>
	);
}
