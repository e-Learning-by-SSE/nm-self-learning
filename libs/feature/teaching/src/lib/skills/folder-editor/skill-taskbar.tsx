import { trpc } from "@self-learning/api-client";
import { SkillFormModel } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { PlusIcon, TrashIcon } from "@heroicons/react/solid";
import { useContext } from "react";
import { FolderContext } from "./folder-editor";

export function SkillTaskbar({ selectedSkill }: { selectedSkill: SkillFormModel }) {
	return (
		<>
			<SkillQuickAddOption selectedSkill={selectedSkill} />
			<SkillDeleteOption skill={selectedSkill} />
		</>
	);
}

function SkillQuickAddOption({ selectedSkill }: { selectedSkill: SkillFormModel }) {
	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const { handleSelection } = useContext(FolderContext);

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
				handleSelection(adaptedCurrentSkill);
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
		<PlusIcon
			className="icon h-5 text-lg hover:text-secondary"
			style={{ cursor: "pointer" }}
			onClick={() => handleAddSkill()}
		/>
	);
}

export function SkillDeleteOption({ skill }: { skill: SkillFormModel }) {
	const { mutateAsync: deleteSkill } = trpc.skill.deleteSkill.useMutation();
	const { handleSelection } = useContext(FolderContext);
	const handleDelete = async () => {
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
	};

	return (
		<TrashIcon
			className="icon h-5 text-lg hover:text-red-500"
			style={{ cursor: "pointer" }}
			onClick={() => handleDelete()}
		/>
	);
}
