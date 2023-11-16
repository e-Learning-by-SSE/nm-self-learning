<<<<<<< HEAD
import { trpc } from "@self-learning/api-client";
import { SkillFormModel } from "@self-learning/types";
import { ButtonActions, SimpleDialog, dispatchDialog, freeDialog, showToast } from "@self-learning/ui/common";
import { TrashIcon } from "@heroicons/react/solid";
import { FolderAddIcon } from "@heroicons/react/outline";
import { useContext } from "react";
import { FolderContext } from "./folder-editor";
=======
import {trpc} from "@self-learning/api-client";
import {SkillFormModel} from "@self-learning/types";
import {showToast} from "@self-learning/ui/common";
import {TrashIcon} from "@heroicons/react/solid";
import {FolderAddIcon} from "@heroicons/react/outline";
import {useContext} from "react";
import {FolderContext} from "./folder-editor";
import {findCycles} from "@self-learning/skills-pathfinder";
import {dispatchDetection} from "./cycle-detection/detection-hook";
import {FolderItem} from "./cycle-detection/cycle-detection";
>>>>>>> d3abb65 (feat(skill-folder-editor): add cycle checking)


export function SkillQuickAddOption({selectedSkill}: { selectedSkill: SkillFormModel }) {
    const {mutateAsync: createSkill} = trpc.skill.createSkill.useMutation();
    const {mutateAsync: updateSkill} = trpc.skill.updateSkill.useMutation();
    const {handleSelection, skillMap} = useContext(FolderContext);

    const checkForCyclen = async () => {

        const wrongSkills = Array.from(skillMap.values());
        const skills = wrongSkills.map(skill => {
            return {
                id: skill.id,
                repositoryId: skill.repositoryId,
                nestedSkills: skill.children,
            };
        });
        const cycles = findCycles(skills);
        console.log("cycles", cycles);
        const folderItems: FolderItem[] = [];
        for (const cycle of cycles) {
            folderItems.push({skill: skillMap.get(cycle[0].id)! , selectedSkill: false, cycle: "taskbar"})
            folderItems.push({skill: skillMap.get(cycle[1].id)! , selectedSkill: false, cycle: "taskbar"})
        }
        dispatchDetection(folderItems);
    }

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
                await updateSkill({skill: adaptedCurrentSkill});
                showToast({
                    type: "success",
                    title: "Skill gespeichert!",
                    subtitle: ""
                });
                handleSelection(adaptedCurrentSkill);
                skillMap.set(createdSkill.id, createdSkill)
                skillMap.set(adaptedCurrentSkill.id, adaptedCurrentSkill)
                checkForCyclen();

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
            <FolderAddIcon className="icon h-5 text-lg" style={{cursor: "pointer"}}/>
        </button>
    );
}

<<<<<<< HEAD
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
			/>
		, "simpleDialog");
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
=======
export function SkillDeleteOption({skill}: { skill: SkillFormModel }) {
    const {mutateAsync: deleteSkill} = trpc.skill.deleteSkill.useMutation();
    const {handleSelection} = useContext(FolderContext);
    const handleDelete = async () => {
        try {
            await deleteSkill({id: skill.id});
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
        <button
            className="rounded-lg border border-light-border bg-red-400 py-2 px-2  hover:bg-red-600"
            onClick={handleDelete}
        >
            <TrashIcon className="h-5 " style={{cursor: "pointer"}}/>
        </button>
    );
>>>>>>> d3abb65 (feat(skill-folder-editor): add cycle checking)
}
