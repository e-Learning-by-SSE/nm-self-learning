import { trpc } from "@self-learning/api-client";
import { createSkillFormModelFromSkillResolved, SkillFormModel } from "@self-learning/types";
import {
	ButtonActions,
	dispatchDialog,
	freeDialog,
	showToast,
	SimpleDialog
} from "@self-learning/ui/common";
import { TrashIcon } from "@heroicons/react/solid";
import { FolderAddIcon } from "@heroicons/react/outline";
import { FolderItem } from "./cycle-detection/cycle-detection";
import { SkillSelectHandler } from "@self-learning/teaching";

export function SkillQuickAddOption({
	selectedSkill,
	skillMap,
	handleSelection
}: {
	selectedSkill: SkillFormModel;
	skillMap: Map<string, FolderItem>;
	handleSelection: SkillSelectHandler
}) {
	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();

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
				await updateSkill({ skill: adaptedCurrentSkill });

				showToast({
					type: "success",
					title: "Skill gespeichert!",
					subtitle: ""
				});
				//adds the new skill lokal
				const createSkillFormModel = createSkillFormModelFromSkillResolved(createdSkill);

				skillMap.set(createdSkill.id, {
					skill: createSkillFormModel,
					selectedSkill: false
				});
				skillMap.set(adaptedCurrentSkill.id, {
					skill: adaptedCurrentSkill,
					selectedSkill: true
				});

				handleSelection([adaptedCurrentSkill], skillMap);


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
	const { mutateAsync: deleteSkill } = trpc.skill.deleteSkill.useMutation();
	const { mutateAsync: getSkillsFromId } = trpc.skill.getSkillsByIds.useMutation();
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

					for (const skill of skills) {
						try {
							await deleteSkill({ id: skill.id });
							showToast({
								type: "success",
								title: "Skill gelöscht!",
								subtitle: ""
							});

							//load parentskill without deleted skill
							const parentSkills = await getSkillsFromId({
								skillIds: skill.parents
							});

							const parentSkillFormModels = parentSkills.map(skill => {
								return {
									name: skill.name,
									description: skill.description,
									children: skill.children
										.filter(item => item.id !== skill.id)
										.map(skill => skill.id),
									id: skill.id,
									repositoryId: skill.repository.id,
									parents: skill.parents.map(skill => skill.id)
								};
							});

							const folderItems = parentSkillFormModels.map(skill => {
								return {
									skill: skill,
									selectedSkill: false
								};
							});

							//delete skill from skillMap
							folderItems.forEach(item => {
								skillMap.set(item.skill.id, item);
							});

							skillMap.delete(skill.id);

							handleChangeOfItems(new Map(skillMap))
						

						} catch (error) {
							if (error instanceof Error) {
								showToast({
									type: "error",
									title: `${
										skills.length > 1 ? "Skills konnten" : "Skill konnte"
									} nicht gelöscht werden!`,
									subtitle: error.message ?? ""
								});
							}
						}
					}
					freeDialog("simpleDialog");
					handleSelection(null, skillMap);
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
