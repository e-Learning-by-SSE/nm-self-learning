import { findParentsOfCycledSkills } from "@e-learning-by-sse/nm-skill-lib";
import { SkillFormModel } from "@self-learning/types";
import { OnDialogCloseFn } from "@self-learning/ui/common";

export type SkillSelectHandler = OnDialogCloseFn<string>;

export type OptionalVisualizationWithRequiredId = Pick<SkillFolderVisualization, "id"> &
	Partial<Omit<SkillFolderVisualization, "id">>;

export type UpdateVisuals = (skills: OptionalVisualizationWithRequiredId[] | null) => void;

export type SkillFolderVisualization = {
	id: string;
	isSelected: boolean;
	isCycleMember: boolean;
	hasNestedCycleMembers: boolean;
	skill: SkillFormModel;
	isExpanded: boolean;
	numberChildren: number;
	shortHighlight: boolean;
	isFolder: boolean;
	isRepository: boolean;
	displayName?: string; // alt name for display. Preffered over skill.name
	massSelected?: boolean;
};

export const visualSkillDefaultValues = {
	isSelected: false,
	massSelected: false,
	isCycleMember: false,
	hasNestedCycleMembers: false,
	isExpanded: false,
	shortHighlight: false
};

const inferInformationFromSkill = (skill: SkillFormModel) => {
	return {
		isFolder: skill.children.length > 0,
		isRepository: skill.parents.length === 0,
		numberChildren: skill.children.length,
		id: skill.id,
		skill
	};
};

/**
 *
 * @param skill the skill to be visualized
 * @param existingData any data that should be used as a base for the visualization.
 * @returns
 */
export const createDisplayData = (
	skill: SkillFormModel,
	existingData?: Partial<SkillFolderVisualization>
): SkillFolderVisualization => {
	return {
		...visualSkillDefaultValues,
		...existingData,
		...inferInformationFromSkill(skill)
	};
};

export function changeDisplay({
	displayUpdate,
	skills,
	historicDisplayData
}: {
	displayUpdate: OptionalVisualizationWithRequiredId[] | null;
	skills: Map<string, SkillFormModel>;
	historicDisplayData: Map<string, SkillFolderVisualization>;
}) {
	const initialData = {
		displayData: new Map<string, SkillFolderVisualization>(historicDisplayData),
		ignoredData: [] as OptionalVisualizationWithRequiredId[]
	};

	if (!displayUpdate) {
		return initialData;
	}

	return displayUpdate.reduce((acc, updateData) => {
		const oldVisual = historicDisplayData.get(updateData.id);
		const skillData = skills.get(updateData.id);
		if (skillData) {
			acc.displayData.set(
				updateData.id,
				createDisplayData(skillData, { ...oldVisual, ...updateData })
			);
		} else {
			acc.ignoredData.push(updateData);
		}
		return acc;
	}, initialData);
}

export const switchSelectionDisplayValue = (
	previousSelectionId: string | undefined,
	newSelectionId: string | undefined
): OptionalVisualizationWithRequiredId[] => {
	const idPropertiesMap: { [key: string]: Partial<SkillFolderVisualization> } = {};

	if (previousSelectionId) {
		idPropertiesMap[previousSelectionId] = { isSelected: false };
	}

	if (newSelectionId) {
		idPropertiesMap[newSelectionId] = { shortHighlight: true, isSelected: true };
	}

	return Object.entries(idPropertiesMap).map(([id, properties]) => ({ id, ...properties }));
};

export function getCycleDisplayInformation(skills: Map<string, SkillFormModel>) {
	const libSkills = Array.from(skills.values()).map(skill => ({
		...skill,
		nestedSkills: skill.children
	}));
	const cycleParents = findParentsOfCycledSkills(libSkills);
	if (!cycleParents) return [];
	const children = cycleParents.nestingSkills.map(cycle => ({
		...cycle,
		hasNestedCycleMembers: true
	}));
	const parents = cycleParents.cycles.flat().map(cycle => ({ ...cycle, isCycleMember: true }));
	return [...children, ...parents];
}
