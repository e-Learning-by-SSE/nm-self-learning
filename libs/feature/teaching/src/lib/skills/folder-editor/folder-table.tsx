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
import { OnlyOwnSkillsCheckbox } from "../only-own-skills-checkbox";
import { AddSkillDialog, SkillDialogResult } from "../skill-dialog/add-skill-dialog";
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
	const [onlyOwnSkills, setOnlyOwnSkills] = useState(false);
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
	// Ids created by this author. Ancestors stay visible so an own skill under someone else's area is not lost.
	const ownSkillIds = useMemo(() => {
		if (!onlyOwnSkills) return undefined;
		const ids = new Set<string>();
		for (const row of skillDisplayData.values()) {
			if (row.skill.authorId === authorId) ids.add(row.id);
		}
		return ids;
	}, [onlyOwnSkills, skillDisplayData, authorId]);
	const [openNewSkillDialog, setOpenNewSkillDialog] = useState(false);
	const { mutateAsync: createNewSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkillParent } = trpc.skill.updateSkill.useMutation();

	async function handleAddSkillDialogClose(result?: SkillDialogResult) {
		if (result) {
			const created = await createNewSkill({
				authorId: authorId,
				skill: { name: result.name, description: result.description, children: [] }
			});
			if (result.parents.length) {
				await updateSkillParent({
					skill: {
						id: created.id,
						name: created.name,
						description: created.description,
						authorId: created.authorId,
						children: created.children.map(child => child.id),
						parents: result.parents
					}
				});
				updateSkillDisplay(
					result.parents.map(id => ({
						id,
						shortHighlight: true,
						isExpanded: true
					}))
				);
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

		const hasParent = (skill: SkillFormModel): boolean => {
			if (!skill.parents) {
				return false;
			}
			return skill.parents.length > 0;
		};

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
						hasParent={hasParent(sourceSkill)}
					>
						<div className="">
							Sie haben <span className="text-secondary">{sourceSkill.name}</span> auf
							<span className="text-secondary"> {destinationSkill.name} </span>{" "}
							gezogen.
						</div>
						{hasParent(sourceSkill) ? (
							<div className="text-sm mt-2">
								Soll {destinationSkill.name} als zusätzlichen Eltern-Skill
								hinzugefügt werden oder den aktuellen Eltern-Skill ersetzen?
							</div>
						) : (
							<div className="text-sm mt-2">
								Soll {destinationSkill.name} als Eltern-Skill hinzugefügt werden?
							</div>
						)}
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
						<span>
							{selectedSkill ? "Skill hinzufügen" : "Skillbereich hinzufügen"}
						</span>
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
					placeholder="Suche nach Skills"
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>
				<OnlyOwnSkillsCheckbox checked={onlyOwnSkills} onChange={setOnlyOwnSkills} />

				<DialogHandler id={"alert"} />
				<DragDropContext onDragEnd={onDragEnd} key={"element.id"}>
					<Table head={<TableHeaderColumn>Bezeichnung</TableHeaderColumn>}>
						{skillsToDisplay
							.sort(byChildrenLength)
							.filter(
								skill =>
									IsTopLevelSkill(skill) &&
									(!ownSkillIds ||
										subtreeHasOwnSkill(skill, ownSkillIds, skillDisplayData))
							)
							.map(element => (
								<ListSkillEntryWithChildren
									key={`${element.id}-0`}
									skillDisplayData={element}
									updateSkillDisplay={updateSkillDisplay}
									handleSelection={handleSelection}
									skillResolver={skillId => skillDisplayData.get(skillId)}
									parentNodeId={""} // No parent for the top level - Repositories
									authorId={authorId}
									matchingSkillIds={ownSkillIds}
								/>
							))}
					</Table>
				</DragDropContext>
				<DialogHandler id={"copyMoveDialog"} />
			</CenteredSection>
		</div>
	);
}

// TODO separator must be invalid symbol for ids, otherwise it overlaps
// TODO this contract must be declared in one place or use separator as constant
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

// True when this node or a descendant was created by the current author. Seen stops cycles.
function subtreeHasOwnSkill(
	skill: SkillFolderVisualization,
	ownIds: Set<string>,
	skillMap: Map<string, SkillFolderVisualization>
): boolean {
	const seen = new Set<string>();
	const visit = (node: SkillFolderVisualization): boolean => {
		if (seen.has(node.id)) return false;
		seen.add(node.id);
		if (ownIds.has(node.id)) return true;
		for (const childId of node.children) {
			const child = skillMap.get(childId);
			if (child && visit(child)) return true;
		}
		return false;
	};
	return visit(skill);
}
