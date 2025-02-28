import { SkillFormModel } from "@self-learning/types";
import {
	ButtonActions,
	dispatchDialog,
	freeDialog,
	showToast,
	SimpleDialog,
	TrashcanButton
} from "@self-learning/ui/common";
import { TrashIcon } from "@heroicons/react/24/solid";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import { SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { trpc } from "@self-learning/api-client";
import { Skill } from "@prisma/client";

const withErrorHandling = async (fn: () => Promise<void>) => {
	try {
		await fn();
		showToast({
			type: "success",
			title: "Aktion erfolgreich!",
			subtitle: ""
		});
	} catch (error) {
		if (error instanceof Error) {
			showToast({
				type: "error",
				title: "Ihre Aktion konnte nicht durchgeführt werden",
				subtitle: error.message ?? ""
			});
		}
		console.log("Could not change skill:", error);
	}
};

export function AddChildButton({
	parentSkill,
	childrenNumber,
	updateSkillDisplay,
	handleSelection,
	skillDefaults,
	authorId
}: {
	parentSkill: SkillFormModel;
	childrenNumber: number;
	updateSkillDisplay: UpdateVisuals;
	handleSelection: SkillSelectHandler;
	skillDefaults?: Partial<Skill>;
	authorId: number;
}) {
	const { mutateAsync: addSkillOnParent } = trpc.skill.createSkillWithParents.useMutation();

	const newSkill = {
		name: `${childrenNumber + 1}. Kind - ${parentSkill.name}`,
		description: "Add here",
		children: [],
		parents: [parentSkill.id],
		repositoryId: "1", // ToRemove To be removed when repository is removed
		...skillDefaults
	};

	const handleAddSkill = async () =>
		await withErrorHandling(async () => {
			const result = await addSkillOnParent({
				repoId: "1", // ToRemove To be removed when repository is removed
				authorId: authorId,
				parentSkillId: parentSkill.id,
				skill: newSkill
			});
			if (result) {
				const { createdSkill, parentSkill } = result;
				updateSkillDisplay([
					{ id: createdSkill.id, shortHighlight: true },
					{
						id: parentSkill.id,
						shortHighlight: true,
						isExpanded: true
					}
				]);
				handleSelection(createdSkill.id);
			} else {
				throw new Error("Could not create skill");
			}
		});

	return (
		<button
			title="Neuen Skill in dieser Skillgruppe anlegen"
			className="mr-3 px-2 hover:text-secondary"
			onClick={handleAddSkill}
		>
			<FolderPlusIcon className="icon h-5 text-lg" style={{ cursor: "pointer" }} />
		</button>
	);
}

export function SkillDeleteOption({
	skillIds,
	inline = false,
	onDeleteSuccess
}: {
	skillIds: SkillFormModel["id"][];
	inline?: boolean;
	onDeleteSuccess?: () => void | PromiseLike<void>;
}) {
	const { mutateAsync: deleteSkills } = trpc.skill.deleteSkills.useMutation();

	const onClose = async () => {
		await withErrorHandling(async () => {
			await deleteSkills({ ids: skillIds });
			await onDeleteSuccess?.();
		});
	};

	const handleDelete = () => {
		dispatchDialog(
			<SimpleDialog
				name="Warnung"
				onClose={async (type: ButtonActions) => {
					if (type === ButtonActions.CANCEL) {
						freeDialog("simpleDialog");
						return;
					}
					onClose();
					freeDialog("simpleDialog");
				}}
			>
				{skillIds.length > 1 ? "Sollen die Skills " : "Soll der Skill"} wirklich gelöscht
				werden?
			</SimpleDialog>,
			"simpleDialog"
		);
	};

	if (!inline) {
		return <TrashcanButton onClick={handleDelete} />;
	} else {
		return (
			<button type="button" className={"px-2 hover:text-secondary"} onClick={handleDelete}>
				<TrashIcon className="h-5 " style={{ cursor: "pointer" }} />
			</button>
		);
	}
}
