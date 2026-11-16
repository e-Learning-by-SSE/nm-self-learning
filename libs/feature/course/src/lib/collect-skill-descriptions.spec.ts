import { collectSkillDescriptions, SkillGoalNode } from "./collect-skill-descriptions";

function skillMap(nodes: SkillGoalNode[]): Map<string, SkillGoalNode> {
	return new Map(nodes.map(node => [node.id, node]));
}

describe("collectSkillDescriptions", () => {
	it("returns the descriptions of the given skills in order", () => {
		const skills = skillMap([
			{ id: "a", description: "Search literature", childIds: [] },
			{ id: "b", description: "Structure a paper", childIds: [] }
		]);

		expect(collectSkillDescriptions(["a", "b"], skills)).toEqual([
			"Search literature",
			"Structure a paper"
		]);
	});

	it("uses the descriptions of the children (recursively) if a goal has no description", () => {
		const skills = skillMap([
			{ id: "root", description: null, childIds: ["group", "leaf1"] },
			{ id: "group", description: "   ", childIds: ["leaf2", "leaf3"] },
			{ id: "leaf1", description: "Leaf 1", childIds: [] },
			{ id: "leaf2", description: "Leaf 2", childIds: [] },
			{ id: "leaf3", description: "Leaf 3", childIds: [] }
		]);

		expect(collectSkillDescriptions(["root"], skills)).toEqual(["Leaf 2", "Leaf 3", "Leaf 1"]);
	});

	it("does not descend into children of skills that have a description", () => {
		const skills = skillMap([
			{ id: "root", description: "Root goal", childIds: ["child"] },
			{ id: "child", description: "Child goal", childIds: [] }
		]);

		expect(collectSkillDescriptions(["root"], skills)).toEqual(["Root goal"]);
	});

	it("ignores skills without description and without children", () => {
		const skills = skillMap([
			{ id: "a", description: null, childIds: [] },
			{ id: "b", description: "B", childIds: [] }
		]);

		expect(collectSkillDescriptions(["a", "b"], skills)).toEqual(["B"]);
	});

	it("removes duplicate skills and duplicate descriptions", () => {
		const skills = skillMap([
			{ id: "a", description: null, childIds: ["shared"] },
			{ id: "b", description: null, childIds: ["shared"] },
			{ id: "shared", description: "Shared goal", childIds: [] },
			{ id: "c", description: " Shared goal ", childIds: [] }
		]);

		expect(collectSkillDescriptions(["a", "b", "c"], skills)).toEqual(["Shared goal"]);
	});

	it("terminates on cyclic skill graphs", () => {
		const skills = skillMap([
			{ id: "a", description: null, childIds: ["b"] },
			{ id: "b", description: null, childIds: ["a", "c"] },
			{ id: "c", description: "C", childIds: [] }
		]);

		expect(collectSkillDescriptions(["a"], skills)).toEqual(["C"]);
	});

	it("ignores unknown skill ids", () => {
		expect(collectSkillDescriptions(["missing"], skillMap([]))).toEqual([]);
	});
});
