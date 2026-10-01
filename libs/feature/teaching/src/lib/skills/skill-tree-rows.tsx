import { compareSkills } from "./compare-skills";
import type { ReactNode } from "react";
import { isTruthy } from "@self-learning/util/common";
import type { SkillFolderVisualization } from "./folder-editor/skill-display";

export type SkillTreeRowPosition = {
	skill: SkillFolderVisualization;
	depth: number;
	nodeId: string;
};

export function SkillTreeRows({
	skillResolver,
	skillDisplayData,
	depth = 0,
	renderedIds = new Set(),
	parentNodeId,
	renderRow,
	matchingSkillIds,
	autoExpandIds
}: {
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth?: number;
	renderedIds?: Set<string>;
	parentNodeId: string;
	renderRow: (props: SkillTreeRowPosition) => ReactNode;
	matchingSkillIds?: Set<string>;
	autoExpandIds?: Set<string>;
}) {
	const wasNotRendered = (skill: SkillFolderVisualization) => !renderedIds.has(skill.id);
	const showChildren = skillDisplayData.isExpanded ?? false;

	const nodeId = generateNodeId(parentNodeId, skillDisplayData.id);

	if (autoExpandIds?.has(skillDisplayData.id)) {
		skillDisplayData.isExpanded = true;
	}

	return (
		<>
			{renderRow({ skill: skillDisplayData, depth, nodeId })}
			{showChildren &&
				skillDisplayData.children
					.map(childId => skillResolver(childId))
					.sort(byChildrenLength)
					.filter(isTruthy)
					.filter(wasNotRendered)
					.map(element => {
						// Render descendants with the same row renderer.
						if (matchingSkillIds) {
							const hasMatchingDescendant = (
								skill: SkillFolderVisualization
							): boolean => {
								if (matchingSkillIds.has(skill.id)) return true;
								return skill.children
									.map(childId => skillResolver(childId))
									.filter(isTruthy)
									.some(child => hasMatchingDescendant(child));
							};

							if (!hasMatchingDescendant(element)) {
								return null;
							}
						}
						const newSet = new Set(renderedIds);
						newSet.add(element.id);
						return (
							<SkillTreeRows
								key={`${element.id}-${depth + 1}`}
								skillDisplayData={element}
								skillResolver={skillResolver}
								depth={depth + 1}
								renderedIds={newSet}
								parentNodeId={nodeId}
								renderRow={renderRow}
								matchingSkillIds={matchingSkillIds}
								autoExpandIds={autoExpandIds}
							/>
						);
					})}
		</>
	);
}

// TODO separator must be invalid symbol for ids, otherwise it overlaps
// TODO this contract must be declared in one place or use separator as constant
const generateNodeId = (parentsId: string, skillId: string) => {
	return parentsId.length > 0 ? parentsId + ":::" + skillId : skillId;
};

const byChildrenLength = (
	a: SkillFolderVisualization | undefined,
	b: SkillFolderVisualization | undefined
) => {
	if (a && b) {
		return compareSkills(
			{ numberChildren: a.numberChildren, name: a.skill.name },
			{ numberChildren: b.numberChildren, name: b.skill.name }
		);
	}
	return 0;
};
