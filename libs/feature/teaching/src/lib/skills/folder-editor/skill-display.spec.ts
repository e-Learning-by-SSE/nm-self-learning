//
import { switchSelectionDisplayValue } from "./skill-display";
import { createDisplayData } from "./skill-display";
import { visualSkillDefaultValues } from "./skill-display";

const skill = {
	id: "skillId",
	name: "Skill Name",
	children: [],
	repositoryId: "repoId",
	description: "description",
	parents: []
};
describe("switchSelectionDisplayValue", () => {
	it("should update the display values correctly when previousSelectionId and newSelectionId are provided", () => {
		const previousSelectionId = "previousId";
		const newSelectionId = "newId";

		const result = switchSelectionDisplayValue(previousSelectionId, newSelectionId);

		expect(result).toEqual([
			{ id: previousSelectionId, isSelected: false },
			{ id: newSelectionId, shortHighlight: true, isSelected: true }
		]);
	});

	it("should update the display values correctly when only previousSelectionId is provided", () => {
		const previousSelectionId = "previousId";
		const newSelectionId = undefined;

		const result = switchSelectionDisplayValue(previousSelectionId, newSelectionId);

		expect(result).toEqual([{ id: previousSelectionId, isSelected: false }]);
	});

	it("should update the display values correctly when only newSelectionId is provided", () => {
		const previousSelectionId = undefined;
		const newSelectionId = "newId";

		const result = switchSelectionDisplayValue(previousSelectionId, newSelectionId);

		expect(result).toEqual([{ id: newSelectionId, shortHighlight: true, isSelected: true }]);
	});

	it("should return an empty array when both previousSelectionId and newSelectionId are undefined", () => {
		const previousSelectionId = undefined;
		const newSelectionId = undefined;

		const result = switchSelectionDisplayValue(previousSelectionId, newSelectionId);

		expect(result).toEqual([]);
	});
});

describe("createDisplayData", () => {
	it("should create display data with default values when no existing data is provided", () => {
		const result = createDisplayData(skill);

		expect(result).toEqual({
			...visualSkillDefaultValues,
			isFolder: false,
			numberChildren: 0,
			id: skill.id,
			skill
		});
	});

	it("should create display data with existing data merged when existing data is provided", () => {
		const folderSkill = {
			...skill,
			children: ["childId", "childId2"]
		};

		const existingData = {
			displayName: "ExistingName",
			extraProperty: "Extra"
		};

		const result = createDisplayData(folderSkill, existingData);

		expect(result).toEqual({
			...visualSkillDefaultValues,
			...existingData,
			isFolder: true,
			numberChildren: 2,
			id: skill.id,
			skill: folderSkill
		});
	});
});
