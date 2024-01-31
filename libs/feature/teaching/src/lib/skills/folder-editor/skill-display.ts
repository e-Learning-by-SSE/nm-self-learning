import { SkillFormModel } from "@self-learning/types";
import { OnDialogCloseFn } from "@self-learning/ui/common";

export type SkillSelectHandler = OnDialogCloseFn<string>;

export type OptionalVisualizationWithRequiredId = Pick<SkillFolderVisualization, "id"> &
	Partial<Omit<SkillFolderVisualization, "id">>;

export type UpdateVisuals = (skills: OptionalVisualizationWithRequiredId[] | null) => void;

export type CycleType = "parent" | "child" | "none";

export type SkillFolderVisualization = {
	id: string;
	isSelected: boolean;
	massSelected?: boolean;
	cycleType: CycleType;
	skill: SkillFormModel;
	isExpanded: boolean;
	displayName: string;
	numberChildren: number;
	shortHighlight: boolean;
	isFolder: boolean;
	skipNextRender?: boolean;
};

export const visualSkillDefaultValues = {
	isSelected: false,
	massSelected: false,
	cycleType: "none" as CycleType,
	isExpanded: false,
	shortHighlight: false
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
		displayName: skill.name,
		...existingData,
		isFolder: skill.children.length > 0,
		numberChildren: skill.children.length,
		id: skill.id,
		skill
	};
};

export function updateDisplay({
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
		displayWithoutSkill: [] as OptionalVisualizationWithRequiredId[]
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
			acc.displayWithoutSkill.push(updateData);
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
		idPropertiesMap[previousSelectionId] = { shortHighlight: false, isSelected: false };
	}

	if (newSelectionId) {
		idPropertiesMap[newSelectionId] = { shortHighlight: true, isSelected: true };
	}

	return Object.entries(idPropertiesMap).map(([id, properties]) => ({ id, ...properties }));
};
