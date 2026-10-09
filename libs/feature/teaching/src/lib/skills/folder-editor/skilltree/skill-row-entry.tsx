import { AddChildButton } from "../skill-taskbar";
import type { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "../skill-display";
import { SkillTreeRows } from "../../skill-tree-rows";
import { SkillTreeRow } from "../../skill-tree-row";
import { SkillRowDeleteButton } from "../../skill-row-delete-button";

export function ListSkillEntryWithChildren({
	authorId,
	handleSelection,
	updateSkillDisplay,
	...treeProps
}: {
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth?: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	renderedIds?: Set<string>;
	parentNodeId: string;
	authorId: number;
	matchingSkillIds?: Set<string>;
	autoExpandIds?: Set<string>;
}) {
	return (
		<SkillTreeRows
			{...treeProps}
			renderRow={position => (
				<SkillTreeRow
					key={`${position.skill.id}-${position.depth}`}
					{...position}
					handleSelection={handleSelection}
					updateSkillDisplay={updateSkillDisplay}
					isRepository={position.skill.skill.parents.length === 0}
					isDragDisabled={
						position.skill.skill.children.length > 0 &&
						position.skill.skill.parents.length === 0
					}
					selectionClassName={position.skill.isFolder ? "hover:text-secondary" : ""}
					actions={
						<>
							<AddChildButton
								parentSkill={position.skill.skill}
								childrenNumber={position.skill.numberChildren}
								updateSkillDisplay={updateSkillDisplay}
								handleSelection={handleSelection}
								authorId={authorId}
							/>
							<SkillRowDeleteButton skillId={position.skill.id} />
						</>
					}
				/>
			)}
		/>
	);
}
