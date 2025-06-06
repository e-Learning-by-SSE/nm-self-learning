import { DialogHandler, Table, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useMemo, useState } from "react";
import { ListSkillEntryWithChildren } from "./skill-row-entry";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { Skill } from "@prisma/client";
import { Droppable } from "@hello-pangea/dnd";

export function SkillTree({
	skillDisplayData,
	selectedSkill,
	onSkillSelect: handleSelection,
	updateSkillDisplay,
	authorId,
	isDragging
}: {
	skillDisplayData: Map<string, SkillFolderVisualization>;
	selectedSkill?: Skill;
	onSkillSelect: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	authorId: number;
	isDragging: boolean;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const skillsToDisplay = useMemo(() => {
		const skills = Array.from(skillDisplayData.values());
		if (!searchTerm?.trim() || isDragging) return skills;
		const normalizedSearchTerm = searchTerm.toLowerCase().trim();
		return skills.filter(
			skill =>
				skill.skill.name.toLowerCase().includes(normalizedSearchTerm) ||
				skill.displayName?.toLowerCase().includes(normalizedSearchTerm)
		);
	}, [skillDisplayData, searchTerm, isDragging]);

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
						<Table head={<TableHeaderColumn>Bezeichnung</TableHeaderColumn>}>
							<tbody
								ref={droppableProvided.innerRef}
								{...droppableProvided.droppableProps}
							>
								{skillsToDisplay
									.sort(byChildrenLength)
									.filter(IsTopLevelSkill)
									.map((element) => (
										<ListSkillEntryWithChildren
											key={element.id}
											skillDisplayData={element}
											updateSkillDisplay={updateSkillDisplay}
											handleSelection={handleSelection}
											skillResolver={skillId => skillDisplayData.get(skillId)}
											parentNodeId={""}
											authorId={authorId}
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
