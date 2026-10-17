import { getTopLevelSkillIds } from "./top-level-skills";

describe("getTopLevelSkillIds", () => {
	it("assigns the smallest reachable root regardless of input order or path length", () => {
		// Setup
		const skills = [
			{ id: "z-root", children: [{ id: "shared" }] },
			{ id: "shared", children: [{ id: "leaf" }] },
			{ id: "leaf", children: [] },
			{ id: "a-root", children: [{ id: "middle" }] },
			{ id: "middle", children: [{ id: "shared" }] },
			{ id: "isolated", children: [] }
		];

		// Exercise
		const roots = getTopLevelSkillIds(skills);

		// Verify
		expect(Object.fromEntries(roots)).toEqual({
			"a-root": "a-root",
			middle: "a-root",
			shared: "a-root",
			leaf: "a-root",
			isolated: "isolated",
			"z-root": "z-root"
		});
		expect(getTopLevelSkillIds([...skills].reverse())).toEqual(roots);
	});

	it("resolves reachable cycles and leaves rootless cycles unresolved", () => {
		// Setup
		const skills = [
			{ id: "root", children: [{ id: "a" }] },
			{ id: "a", children: [{ id: "b" }] },
			{ id: "b", children: [{ id: "a" }] },
			{ id: "c", children: [{ id: "d" }] },
			{ id: "d", children: [{ id: "c" }, { id: "leaf" }] },
			{ id: "leaf", children: [] }
		];

		// Exercise
		const roots = getTopLevelSkillIds(skills);

		// Verify
		expect(Object.fromEntries(roots)).toEqual({ root: "root", a: "root", b: "root" });
	});

	it("handles deep hierarchies without recursion", () => {
		// Setup
		const skills = Array.from({ length: 10_000 }, (_, index) => ({
			id: String(index),
			children: index < 9_999 ? [{ id: String(index + 1) }] : []
		}));

		// Exercise
		const roots = getTopLevelSkillIds(skills);

		// Verify
		expect(roots.size).toBe(skills.length);
		expect(roots.get("9999")).toBe("0");
	});

	it("supports an empty hierarchy", () => {
		// Setup
		const skills: { id: string; children: { id: string }[] }[] = [];

		// Exercise
		const roots = getTopLevelSkillIds(skills);

		// Verify
		expect(roots.size).toBe(0);
	});
});
