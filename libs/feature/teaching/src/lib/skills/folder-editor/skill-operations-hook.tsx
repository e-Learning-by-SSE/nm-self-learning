import { showToast } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { FolderItem } from "./cycle-detection/cycle-detection";
import { SkillSelectHandler } from "./folder-editor";
import { SkillFormModel, createSkillFormModelFromSkillResolved } from "@self-learning/types";

export function useSkillOperations(
	skillMap: Map<string, FolderItem>,
	handleSelection: SkillSelectHandler
) {
	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const { mutateAsync: deleteSkill } = trpc.skill.deleteSkill.useMutation();
	const { mutateAsync: getSkillsFromId } = trpc.skill.getSkillsByIds.useMutation();

	const addSkillOnParent = async (selectedSkill: SkillFormModel) => {
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
	const addSkillWithoutParent = async (
		repoId: string,
		setSkillMapState: (state: Map<string, FolderItem>) => void
	) => {
		const newSkill = {
			name: "New Skill: " + Date.now(),
			description: "Add here",
			children: []
		};
		try {
			const createdSkill = await createSkill({
				repId: repoId,
				skill: newSkill
			});
			const createSkillFormModel = {
				name: createdSkill.name,
				description: createdSkill.description,
				children: createdSkill.children.map(skill => skill.id),
				id: createdSkill.id,
				repositoryId: createdSkill.repository.id,
				parents: createdSkill.parents.map(skill => skill.id)
			};

			skillMap.set(createdSkill.id, {
				skill: createSkillFormModel,
				selectedSkill: false,
				massSelected: false
			});
			handleSelection([createSkillFormModel], skillMap);
			const newFolderItem: FolderItem = {
				skill: createSkillFormModel,
				selectedSkill: false,
				massSelected: false
			};

			const newSkillMap = new Map(skillMap);
			newSkillMap.set(createdSkill.id, newFolderItem);
            setSkillMapState(newSkillMap);
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

	const removeSkill = async (
		selectedSkills: SkillFormModel[],
		handleChangeOfItems: (skillMap: Map<string, FolderItem>) => void
	) => {
		for (const skill of selectedSkills) {
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

				handleChangeOfItems(new Map(skillMap));
			} catch (error) {
				if (error instanceof Error) {
					showToast({
						type: "error",
						title: `${
							selectedSkills.length > 1 ? "Skills konnten" : "Skill konnte"
						} nicht gelöscht werden!`,
						subtitle: error.message ?? ""
					});
				}
			}
			handleSelection(null, skillMap);
		}
	};

	return { addSkillOnParent, addSkillWithoutParent, removeSkill };
}
