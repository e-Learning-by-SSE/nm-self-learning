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
import { SkillRepository } from "@prisma/client";
import { ListSkillEntryWithChildren } from "./skill-row-entry";
import {
	isSkillFormModel,
	SkillFolderVisualization,
	SkillSelectHandler,
	UpdateVisuals
} from "./skill-display";
import { Skill } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AddSkillDialog } from "../skill-dialog/add-skill-dialog";
import { trpc } from "@self-learning/api-client";
import { DragDropContext, OnDragEndResponder } from "@hello-pangea/dnd";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { SkillFormModel, SkillRepositoryTreeNodeModel } from "@self-learning/types";

export function SkillFolderTable({
	repository,
	skillDisplayData,
	selectedSkill,
	onSkillSelect: handleSelection,
	updateSkillDisplay
}: {
	repository: SkillRepository;
	skillDisplayData: Map<string, SkillFolderVisualization>;
	selectedSkill?: Skill;
	onSkillSelect: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
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
					repoId: repository.id,
					parentSkillId: result.parent,
					skill: { ...result, children: [] }
				};
				addSkill = async () => await addSkillOnParent(newSkill);
			} else {
				const newSkill = {
					repoId: repository.id,
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

	function updateSourceSkillParents(
		sourceSkill: SkillFormModel,
		sourceParentId: string | undefined,
		destinationSkill: SkillRepositoryTreeNodeModel,
		isMoving: boolean
	) {
		if (isMoving) {
			sourceSkill.parents = sourceSkill.parents.filter(parent => parent !== sourceParentId);
		}

		if (isSkillFormModel(destinationSkill)) {
			sourceSkill.parents.push(destinationSkill.id);
		}

		const updateSkill = async () => await updateSkillParent({ skill: sourceSkill });
		updateSkill();
	}

	const onDragEnd: OnDragEndResponder = result => {
		const { source, destination } = result;
		if (!destination) return;

		const sourceNodeId = DecodeNodeId(source.droppableId, "Node");
		const sourceParentId = DecodeNodeId(source.droppableId, "Parent");
		const destinationNodeId = DecodeNodeId(destination.droppableId, "Node");

		if (source.droppableId === destination.droppableId) return;
		if (!sourceNodeId || !destinationNodeId) return;

		const sourceSkill = skillDisplayData.get(sourceNodeId)?.skill;
		const destinationSkill = skillDisplayData.get(destinationNodeId)?.skill;

		if (!sourceSkill || !destinationSkill) return;

		if (isSkillFormModel(sourceSkill)) {
			if (!sourceSkill.parents.includes(destinationSkill.id)) {
				if (isHotkeyPressed("ctrl") || isHotkeyPressed("alt")) {
					if (isHotkeyPressed("ctrl")) {
						console.log(`Copying the skill, pressing ctrl`);
					} else {
						console.log(`Moving the skill, pressing alt`);
					}
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
							Which action would you like to perform on {sourceSkill.name}? Copy or
							Move To {destinationSkill.name}?
						</CopyMoveDialog>,
						"copyMoveDialog"
					);
				}
			}
		}
	};

	return (
		<div>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<RepositoryInfo repository={repository} />
					<button className="btn-primary" onClick={() => setOpenNewSkillDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Skill hinzufügen</span>
					</button>
					{openNewSkillDialog && (
						<AddSkillDialog
							repositoryId={repository.id}
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
				<Table head={<TableHeaderColumn>Bezeichnung</TableHeaderColumn>}>
					{skillsToDisplay
						.sort(byChildrenLength)
						.filter(isTopLevelSkill)
						.map(element => (
							<DragDropContext onDragEnd={onDragEnd} key={element.id}>
								<ListSkillEntryWithChildren
									key={`${element.id}-0`}
									skillDisplayData={element}
									updateSkillDisplay={updateSkillDisplay}
									handleSelection={handleSelection}
									skillResolver={skillId => skillDisplayData.get(skillId)}
									parentNodeId="" // No parent for the top level - Repositories
								/>
							</DragDropContext>
						))}
				</Table>
				<DialogHandler id={"copyMoveDialog"} />
			</CenteredSection>
		</div>
	);
}

const DecodeNodeId = (nodeId: string, nodeType: string) => {
	const nodeIds = nodeId.split(":::");
	if (nodeType === "Node") {
		return nodeIds.pop();
	} else if (nodeType === "Parent") {
		nodeIds.pop();
		return nodeIds.pop();
	}
	return nodeId;
};

const byChildrenLength = (a: SkillFolderVisualization, b: SkillFolderVisualization) => {
	return b.numberChildren - a.numberChildren || a.skill.name.localeCompare(b.skill.name);
};

const isTopLevelSkill = (skill: SkillFolderVisualization) => {
	return skill.isRepository || skill.isCycleMember;
};

function RepositoryInfo({ repository }: { repository: SkillRepository }) {
	const [showFullDescription, setShowFullDescription] = useState(false);

	const descLength = repository.description?.length ?? 0;
	const shouldShowMoreButton = !showFullDescription && descLength > 400;

	const displayedDescription = showFullDescription
		? repository.description
		: repository.description?.substring(0, 250);

	return (
		<div>
			<h1 className="text-5xl">{repository.name}</h1>
			<div className="mt-2 text-gray-500" style={{ maxWidth: "700px" }}>
				{displayedDescription}
				{shouldShowMoreButton && (
					<button
						onClick={() => setShowFullDescription(true)}
						className="pl-4 text-blue-500"
					>
						Mehr anzeigen
					</button>
				)}
			</div>
		</div>
	);
}
