import { trpc } from "@self-learning/api-client";
import { SkillFormModel } from "@self-learning/types";
import {
	ButtonActions,
	SimpleDialog,
	dispatchDialog,
	freeDialog,
	showToast
} from "@self-learning/ui/common";
import { TrashIcon } from "@heroicons/react/solid";
import { FolderAddIcon } from "@heroicons/react/outline";
import { useContext } from "react";
import { FolderContext } from "./folder-editor";
import { checkForCycles } from "./cycle-detection/cycle-detection";

export function SkillQuickAddOption({
	selectedSkill,
	addChildren
}: {
	selectedSkill: SkillFormModel;
	addChildren: (formModel: SkillFormModel) => void;
}) {
	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const { handleSelection, skillMap } = useContext(FolderContext);

	const handleAddSkill = async () => {
		const newSkill = {
			name: selectedSkill.name + " Child" + Math.floor(Math.random() * 100),
			description: "Add here",
			children: []
		};
		try {
			const createdSkill = await createSkill({
				repId: selectedSkill.repositoryId,
				skill: newSkill
			});
			const adaptedCurrentSkill = {
				...selectedSkill,
				children: [...selectedSkill.children, createdSkill.id]
			};

			try {

					const updatedSkill = await updateSkill({ skill: adaptedCurrentSkill });

					showToast({
						type: "success",
						title: "Skill gespeichert!",
						subtitle: ""
					});
					//adds the new skill lokal
					const createSkillFormModel = {
						name: createdSkill.name,
						description: createdSkill.description,
						children: createdSkill.children.map(skill => skill.id),
						id: createdSkill.id,
						repositoryId: createdSkill.repository.id,
						parents: createdSkill.parents.map(skill => skill.id)
					};

					const updateSkillFormModel =  {
						name: updatedSkill.name,
						description: updatedSkill.description,
						children: updatedSkill.children.map(skill => skill.id),
						id: updatedSkill.id,
						repositoryId: updatedSkill.repository.id,
						parents: updatedSkill.parents.map(skill => skill.id)
					}
					
					skillMap.set(createdSkill.id, {
						skill: createSkillFormModel,
						selectedSkill: false
					});
					skillMap.set(adaptedCurrentSkill.id, {
						skill: adaptedCurrentSkill,
						selectedSkill: true
					});

					addChildren(createSkillFormModel);
					handleSelection(adaptedCurrentSkill);

					const folderItem = {
						skill: updateSkillFormModel,
						selectedSkill: true
					};

					await checkForCycles(skillMap, folderItem);
			} catch (error) {
				if (error instanceof Error) {
					showToast({
						type: "error",
						title: "Skill konnte nicht gespeichert werden!",
						subtitle: error.message ?? ""
					});
				}
				// await deleteSkill({ id: createdSkill.id });
			}
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Skill konnte nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
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

export function SkillDeleteOption({ skill }: { skill: SkillFormModel }) {
	const { mutateAsync: deleteSkill } = trpc.skill.deleteSkill.useMutation();
	const { handleSelection } = useContext(FolderContext);
	const handleDelete = () => {
		dispatchDialog(
			<SimpleDialog
				description="Soll der Skill wirklich gelöscht werden?"
				name="Warnung"
				onClose={async (type: ButtonActions) => {
					if (type === ButtonActions.CANCEL) return;
					try {
						await deleteSkill({ id: skill.id });
						showToast({
							type: "success",
							title: "Skill gelöscht!",
							subtitle: ""
						});
					} catch (error) {
						if (error instanceof Error) {
							showToast({
								type: "error",
								title: "Skill konnte nicht gelöscht werden!",
								subtitle: error.message ?? ""
							});
						}
					}
					handleSelection(null);
					freeDialog("simpleDialog");
				}}
			/>,
			"simpleDialog"
		);
	};

	return (
		<button
			type="button"
			className="rounded-lg border border-light-border bg-red-400 py-2 px-2  hover:bg-red-600"
			onClick={handleDelete}
		>
			<TrashIcon className="h-5 " style={{ cursor: "pointer" }} />
		</button>
	);
}
