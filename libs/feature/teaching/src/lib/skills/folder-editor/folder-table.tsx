import {
	CopyMoveButtonActions,
	CopyMoveDialog,
	DialogHandler,
	dispatchDialog,
	freeDialog,
	Table,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useMemo, useState } from "react";
import { ListSkillEntryWithChildren } from "./skilltree/skill-row-entry";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { Skill } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AddSkillDialog } from "../skill-dialog/add-skill-dialog";
import { trpc } from "@self-learning/api-client";
import { DragDropContext, OnDragEndResponder } from "@hello-pangea/dnd";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { SkillFormModel } from "@self-learning/types";

export function SkillFolderTable({
	skillDisplayData,
	selectedSkill,
	onSkillSelect: handleSelection,
	updateSkillDisplay,
	authorId
}: {
	skillDisplayData: Map<string, SkillFolderVisualization>;
	selectedSkill?: Skill;
	onSkillSelect: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	authorId: number;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const skillsToDisplay = useMemo(() => {
		const skills = Array.from(skillDisplayData.values());

		if (!searchTerm?.trim()) return skills;

		const normalizedSearchTerm = searchTerm.toLowerCase().trim();
		return skills.filter(
			skill =>
				skill.skill.name.toLowerCase().includes(normalizedSearchTerm) ||
				skill.displayName?.toLowerCase().includes(normalizedSearchTerm)
		);
	}, [skillDisplayData, searchTerm]);
	const [openNewSkillDialog, setOpenNewSkillDialog] = useState(false);
	const { mutateAsync: createNewSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: addSkillOnParent } = trpc.skill.createSkillWithParents.useMutation();
	const { mutateAsync: updateSkillParent } = trpc.skill.updateSkill.useMutation();

	function handleAddSkillDialogClose(result?: {
		name: string;
		description: string | null;
		parent?: string;
	}) {
		if (result) {
			let addSkill;
			if (result.parent) {
				const newSkill = {
					parentSkillId: result.parent,
					authorId: authorId,
					skill: { ...result, children: [] }
				};
				addSkill = async () => await addSkillOnParent(newSkill);
			} else {
				const newSkill = {
					authorId: authorId,
					skill: { ...result, children: [] }
				};
				addSkill = async () => {
					await createNewSkill(newSkill);
				};
			}

			addSkill();
			if (result.parent) {
				updateSkillDisplay([
					{
						id: result.parent,
						shortHighlight: true,
						isExpanded: true
					}
				]);
			}
		}
		setOpenNewSkillDialog(false);
	}

	const updateSourceSkillParents = (
		sourceSkill: SkillFormModel,
		sourceParentId: string | undefined,
		destinationSkill: SkillFormModel,
		isMoving: boolean
	) => {
		if (isMoving) {
			sourceSkill.parents = sourceSkill.parents.filter(parent => parent !== sourceParentId);
		}

		sourceSkill.parents.push(destinationSkill.id);

		const updateSkill = async () => await updateSkillParent({ skill: sourceSkill });
		updateSkill();
	};

	const onDragEnd: OnDragEndResponder = result => {
		const { source, destination } = result;
		if (!destination) return;

		const sourceNodeId = DecodeNodeId(source.droppableId, "Node");
		const sourceParentId = DecodeNodeId(source.droppableId, "Parent");
		const destinationNodeId = DecodeNodeId(destination.droppableId, "Node");

		if (source.droppableId === destination.droppableId) return;
		if (!sourceNodeId || !destinationNodeId) return;

		console.log(`Source is ${destination.droppableId}`);
		console.log(`destination is ${source.droppableId}`);

		const sourceSkill = skillDisplayData.get(sourceNodeId)?.skill;
		const destinationSkill = skillDisplayData.get(destinationNodeId)?.skill;

		if (!sourceSkill || !destinationSkill) return;

		console.log(`sourceSkill is ${sourceSkill.name}`);
		console.log(`destinationSkill is ${destinationSkill.name}`);

		if (!sourceSkill.parents.includes(destinationSkill.id)) {
			if (isHotkeyPressed("ctrl") || isHotkeyPressed("alt")) {
				updateSourceSkillParents(
					sourceSkill,
					sourceParentId,
					destinationSkill,
					isHotkeyPressed("alt")
				);
			} else {
				dispatchDialog(
					<CopyMoveDialog
						name="Warnung"
						onClose={async (type: CopyMoveButtonActions) => {
							if (type !== CopyMoveButtonActions.CANCEL) {
								updateSourceSkillParents(
									sourceSkill,
									sourceParentId,
									destinationSkill,
									type === CopyMoveButtonActions.MOVE
								);
								freeDialog("copyMoveDialog");
							}
							freeDialog("copyMoveDialog");
						}}
					>
						Which action would you like to perform on {sourceSkill.name}? Copy or Move
						To {destinationSkill.name}?
					</CopyMoveDialog>,
					"copyMoveDialog"
				);
			}
		}
	};

	const skills = Array.from(skillDisplayData.values()).map(skillDisplay => skillDisplay.skill);

	return (
		<div>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<button className="btn-primary" onClick={() => setOpenNewSkillDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Skill hinzufügen</span>
					</button>
					{openNewSkillDialog && (
						<AddSkillDialog
							skills={skills ?? []}
							selectedSkill={selectedSkill}
							onClose={handleAddSkillDialogClose}
						/>
					)}
				</div>

				<SearchField
					placeholder="Suche nach Skill"
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>

				<DialogHandler id={"alert"} />
				<div className="pt-4" />
				<DragDropContext onDragEnd={onDragEnd} key={"element.id"}>
					<Table head={<TableHeaderColumn>Bezeichnung</TableHeaderColumn>}>
						{skillsToDisplay
							.sort(byChildrenLength)
							.filter(IsTopLevelSkill)
							.map(element => (
								<ListSkillEntryWithChildren
									key={`${element.id}-0`}
									skillDisplayData={element}
									updateSkillDisplay={updateSkillDisplay}
									handleSelection={handleSelection}
									skillResolver={skillId => skillDisplayData.get(skillId)}
									parentNodeId={""} // No parent for the top level - Repositories
									authorId={authorId}
								/>
							))}
					</Table>
				</DragDropContext>
				<DialogHandler id={"copyMoveDialog"} />
			</CenteredSection>
		</div>
	);
}

function DecodeNodeId(nodeId: string, nodeType: string): string | undefined {
	const nodeIds: string[] = nodeId.split(":::");
	if (nodeType === "Node") {
		return nodeIds.pop();
	} else if (nodeType === "Parent") {
		nodeIds.pop();
		return nodeIds.pop();
	}
	return nodeId;
}

const byChildrenLength = (a: SkillFolderVisualization, b: SkillFolderVisualization) => {
	return b.numberChildren - a.numberChildren || a.skill.name.localeCompare(b.skill.name);
};

const IsTopLevelSkill = (skill: SkillFolderVisualization) => {
	return skill.skill.parents.length === 0 || skill.isCycleMember;
};
