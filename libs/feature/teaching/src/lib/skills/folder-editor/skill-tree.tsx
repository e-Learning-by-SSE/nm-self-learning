import { DialogHandler, Table, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useMemo, useState } from "react";
import { ListSkillEntryWithChildren } from "./skill-row-entry";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { Droppable } from "@hello-pangea/dnd";

export function SkillTree({
	skillDisplayData,
	updateSkillDisplay,
	authorId,
	isDragging,
	onSkillSelect,
	isUsedSkill
}: {
	skillDisplayData: Map<string, SkillFolderVisualization>;
	updateSkillDisplay: UpdateVisuals;
	authorId: number;
	isDragging: boolean;
	onSkillSelect: SkillSelectHandler;
	isUsedSkill: (skillId: string) => boolean;
}) {
	const [searchTerm, setSearchTerm] = useState("");

	const normalized = searchTerm.toLowerCase().trim();
	const allSkills = Array.from(skillDisplayData.values());
	const matchingSkillIds: Set<string> = new Set(
		allSkills
			.filter(
				skill =>
					skill.skill.name.toLowerCase().includes(normalized) ||
					skill.displayName?.toLowerCase().includes(normalized)
			)
			.map(skill => skill.id)
	);
	const skillIdsToAutoExpand: Set<string> = new Set();
	const skillsToDisplay = useMemo(() => {
		const skillIdsToRender: Set<string> = new Set(matchingSkillIds);
		matchingSkillIds.forEach(skillId => {
			collectAncestors(skillId, skillDisplayData, skillIdsToRender, skillIdsToAutoExpand);
		});
		if (!searchTerm?.trim() || isDragging) {
			return allSkills.filter(IsTopLevelSkill).sort(byChildrenLength);
		}

		return allSkills
			.filter(skill => IsTopLevelSkill(skill) && skillIdsToRender.has(skill.id))
			.sort(byChildrenLength);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		skillDisplayData,
		searchTerm,
		isDragging,
		matchingSkillIds,
		skillIdsToAutoExpand,
		allSkills
	]);

	function collectAncestors(
		skillId: string,
		map: Map<string, SkillFolderVisualization>,
		result: Set<string>,
		autoExpand: Set<string>
	) {
		const skill = map.get(skillId);
		if (!skill) return;

		for (const parentId of skill.skill.parents) {
			if (!result.has(parentId)) {
				result.add(parentId);
				autoExpand.add(parentId);
				collectAncestors(parentId, map, result, autoExpand);
			}
		}
	}

	return (
		<div>
			<CenteredSection>
				<SearchField
					placeholder="Suche nach Skill"
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>

				<DialogHandler id={"alert"} />
				<div className="pt-4" />
				<Droppable droppableId="skill-tree-table">
					{droppableProvided => (
						<Table head={<TableHeaderColumn>Skills</TableHeaderColumn>}>
							<tbody
								ref={droppableProvided.innerRef}
								{...droppableProvided.droppableProps}
							>
								{skillsToDisplay.sort(byChildrenLength).map(element => (
									<ListSkillEntryWithChildren
										key={element.id}
										skillDisplayData={element}
										updateSkillDisplay={updateSkillDisplay}
										skillResolver={skillId => skillDisplayData.get(skillId)}
										parentNodeId={""}
										authorId={authorId}
										matchingSkillIds={matchingSkillIds}
										autoExpandIds={skillIdsToAutoExpand}
										handleSelection={onSkillSelect}
										textClassName="hover:text-emerald-500"
										isUsedSkill={isUsedSkill}
									/>
								))}
								{droppableProvided.placeholder}
							</tbody>
						</Table>
					)}
				</Droppable>
				<DialogHandler id={"copyMoveDialog"} />
			</CenteredSection>
		</div>
	);
}

const byChildrenLength = (a: SkillFolderVisualization, b: SkillFolderVisualization) => {
	return b.numberChildren - a.numberChildren || a.skill.name.localeCompare(b.skill.name);
};

const IsTopLevelSkill = (skill: SkillFolderVisualization) => {
	return skill.skill.parents.length === 0 || skill.isCycleMember;
};
