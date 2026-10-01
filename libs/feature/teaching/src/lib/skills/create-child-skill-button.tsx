import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { IconOnlyButton } from "@self-learning/ui/common";
import styles from "./folder-editor/folder-table.module.css";

export function CreateChildSkillButton({ onCreate }: { onCreate: () => void | Promise<void> }) {
	return (
		<IconOnlyButton
			icon={<DocumentPlusIcon className="h-4 w-4" />}
			className={`${styles["skill-row-add"]} invisible group-hover:visible !p-1`}
			title="Neuen Skill in dieser Skillgruppe erstellen"
			onClick={event => {
				event.preventDefault();
				event.stopPropagation();
				return onCreate();
			}}
		/>
	);
}
