import {  SkillFormModel } from "@self-learning/types";
import {
	ButtonActions,
	dispatchDialog,
	freeDialog,
	SimpleDialog
} from "@self-learning/ui/common";
import { TrashIcon } from "@heroicons/react/solid";
import { FolderAddIcon } from "@heroicons/react/outline";
import { FolderItem } from "./cycle-detection/cycle-detection";
import { SkillSelectHandler } from "@self-learning/teaching";
import { useSkillOperations } from "./skill-operations-hook";

export function SkillQuickAddOption({
	selectedSkill,
	skillMap,
	handleSelection
}: {
	selectedSkill: SkillFormModel;
	skillMap: Map<string, FolderItem>;
	handleSelection: SkillSelectHandler
}) {
	const { addSkillOnParent } = useSkillOperations(skillMap, handleSelection);

	const handleAddSkill = async () => {
		await addSkillOnParent(selectedSkill);
	};

	return (
		<button
			title="Neuen Skill in dieser Skillgruppe anlegen"
			className="hover:text-secondary"
			onClick={handleAddSkill}
		>
			<FolderAddIcon className="icon h-5 text-lg" style={{ cursor: "pointer" }} />
		</button>
	);
}

export function SkillDeleteOption({
	skills,
	skillMap,
	handleSelection,
	handleChangeOfItems,
	classname
}: {
	skills: SkillFormModel[];
	skillMap: Map<string, FolderItem>;
	handleSelection: SkillSelectHandler;
	handleChangeOfItems: (skillMap: Map<string, FolderItem>) => void;
	classname?: string;
}) {
	const { removeSkill } = useSkillOperations(skillMap, handleSelection);

	const handleDelete = () => {
		dispatchDialog(
			<SimpleDialog
				description={`${
					skills.length > 1 ? "Sollen die Skills " : "Soll der Skill"
				} wirklich gelöscht werden?`}
				name="Warnung"
				onClose={async (type: ButtonActions) => {
					if (type === ButtonActions.CANCEL) {
						freeDialog("simpleDialog");
						return;
					}
						await removeSkill(skills, handleChangeOfItems);
					
					freeDialog("simpleDialog");
				}}
			/>,
			"simpleDialog"
		);
	};

	return (
		<button
			type="button"
			className={`rounded-lg border border-light-border bg-red-400 hover:bg-red-600 ${classname}`}
			onClick={handleDelete}
		>
			<TrashIcon className="h-5 " style={{ cursor: "pointer" }} />
		</button>
	);
}

