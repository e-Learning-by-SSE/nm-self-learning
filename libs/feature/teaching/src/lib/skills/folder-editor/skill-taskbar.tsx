import { trpc } from "@self-learning/api-client";
import { SkillFormModel } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/solid";

export function SkillTaskbar({ selectedSkill }: { selectedSkill: SkillFormModel }) {
	return (
		<div className="flex flex-wrap justify-end gap-4">
			<SkillQuickAddOption selectedSkill={selectedSkill} />
			<SkillDeleteOption skill={selectedSkill} />
		</div>
	);
}

function SkillQuickAddOption({ selectedSkill }: { selectedSkill: SkillFormModel }) {
	const [addSkill, setAddSkill] = useState<boolean>(false);
	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();

	useEffect(() => {
		const handleAddSkill = async () => {
			const newSkill = {
				name: selectedSkill.name + " Child",
				description: "Add here",
				children: []
			};
			try {
				const createdSkill = await createSkill({
					repId: selectedSkill.repositoryId,
					skill: newSkill
				});
				const adaptedCurrentSkill: SkillFormModel = {
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
		if (addSkill) {
			handleAddSkill();
			setAddSkill(false);
		}
	}, [addSkill, selectedSkill, createSkill, updateSkill]);

	return (
		<PlusIcon
			className="icon h-5 text-lg hover:text-secondary"
			style={{ cursor: "pointer" }}
			onClick={() => setAddSkill(true)}
		/>
	);
}

function SkillDeleteOption({ skill }: { skill: SkillFormModel }) {
	const { mutateAsync: deleteSkill } = trpc.skill.deleteSkill.useMutation();
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
	};

	return (
		<TrashIcon
			className="icon h-5 text-lg hover:text-red-500"
			style={{ cursor: "pointer" }}
			onClick={() => handleDelete()}
		/>
	);
}
