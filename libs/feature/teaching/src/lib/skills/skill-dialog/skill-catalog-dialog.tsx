import { createSkillFormModelFromSkillResolved, SkillFormModel } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { AddSkillDialog, SkillDialogResult } from "./add-skill-dialog";

export type SkillCatalogDialogState =
	| { kind: "closed" }
	| { kind: "create"; defaultName: string; parentId?: string }
	| { kind: "edit"; skillId: string };

export function SkillCatalogDialog({
	dialog,
	skills,
	onClose,
	onUpdated
}: {
	dialog: SkillCatalogDialogState;
	skills: Map<string, SkillFormModel>;
	onClose: () => void;
	onUpdated?: (skillId: string, name: string, description: string) => void;
}) {
	// get author for newly created skills
	const session = useRequiredSession();
	const username = session.data?.user?.name;
	const { data: author } = trpc.author.getByUsername.useQuery(
		{ username: username as string },
		{ enabled: !!username }
	);
	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();

	const editingSkill = dialog.kind === "edit" ? skills.get(dialog.skillId) : undefined;
	if (dialog.kind === "closed" || (dialog.kind === "edit" && !editingSkill)) return null;

	async function onSubmit(result?: SkillDialogResult) {
		if (!result) {
			onClose();
			return;
		}
		if (!author) {
			showToast({
				type: "error",
				title: "Skill konnte nicht gespeichert werden",
				subtitle: "Autor nicht gefunden."
			});
			return;
		}

		try {
			if (editingSkill) {
				await updateSkill({
					skill: {
						...editingSkill,
						name: result.name,
						description: result.description,
						parents: result.parents
					}
				});
				onUpdated?.(editingSkill.id, result.name, result.description);
			} else {
				const created = await createSkill({
					authorId: author.id,
					skill: {
						name: result.name,
						description: result.description,
						children: []
					}
				});
				if (result.parents.length) {
					await updateSkill({
						skill: {
							...createSkillFormModelFromSkillResolved(created),
							parents: result.parents
						}
					});
				}
			}
			onClose();
			showToast({ type: "success", title: "Skill gespeichert!", subtitle: "" });
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: "Skill konnte nicht gespeichert werden",
				subtitle: ""
			});
		}
	}

	return (
		<AddSkillDialog
			skills={Array.from(skills.values())}
			skill={editingSkill}
			defaultName={dialog.kind === "create" ? dialog.defaultName : undefined}
			selectedSkill={
				dialog.kind === "create" && dialog.parentId ? { id: dialog.parentId } : undefined
			}
			onClose={onSubmit}
		/>
	);
}
