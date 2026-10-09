import { MarkerType } from "@xyflow/react";
import { createGraph, layoutGraph, type GraphAnalysisType } from "./graph-analysis";

// Setup
const graphData: GraphAnalysisType = {
	skills: [
		{ id: "goal", name: "Course goal", children: [{ id: "basics" }] },
		{ id: "basics", name: "Basics", children: [] },
		{ id: "prerequisite", name: "Prerequisite", children: [] }
	],
	learningUnits: [
		{
			lessonId: "lesson",
			title: "Lesson",
			slug: "lesson",
			provides: [{ id: "basics" }],
			requires: [{ id: "prerequisite" }]
		}
	],
	edges: [
		{ from: "goal", to: "basics" },
		{ from: "basics", to: "lesson" },
		{ from: "lesson", to: "prerequisite" }
	]
};

describe("course preview graph", () => {
	it("resolves lesson and skill relationships and marks course goals", () => {
		// Exercise
		const { nodes } = createGraph(graphData, ["goal"]);

		// Verify
		expect(nodes.find(node => node.id === "lesson")?.data).toEqual({
			label: "Lesson",
			provides: ["Basics"],
			requires: ["Prerequisite"]
		});
		expect(nodes.find(node => node.id === "basics")?.data).toEqual({
			label: "Basics",
			isCourseGoal: false,
			taughtBy: ["Lesson"],
			requiredBy: [],
			children: [],
			parents: ["Course goal"]
		});
		expect(nodes.find(node => node.id === "goal")?.data).toMatchObject({
			isCourseGoal: true,
			children: ["Basics"]
		});
	});

	it.each([
		["goal", "basics", "markerStart"],
		["basics", "goal", "markerEnd"]
	] as const)("points hierarchy arrows at the parent for %s -> %s", (from, to, marker) => {
		// Exercise
		const { edges } = createGraph({ ...graphData, edges: [{ from, to }] });

		// Verify
		expect(edges[0][marker]).toMatchObject({ type: MarkerType.ArrowClosed });
		expect(edges[0][marker === "markerStart" ? "markerEnd" : "markerStart"]).toBeUndefined();
	});

	it("distinguishes taught skills from prerequisites using edge colors and direction", () => {
		// Exercise
		const { edges } = createGraph(graphData);

		// Verify
		expect(edges.find(edge => edge.source === "basics")).toMatchObject({
			style: { stroke: "#16a34a" },
			markerStart: { type: MarkerType.ArrowClosed },
			markerEnd: undefined
		});
		expect(edges.find(edge => edge.source === "lesson")).toMatchObject({
			style: { stroke: "#dc2626" },
			markerStart: { type: MarkerType.ArrowClosed },
			markerEnd: undefined
		});
	});

	it("lays out measured nodes without overlap and reconnects their handles", () => {
		// Exercise
		const initial = createGraph(graphData);
		const { nodes, edges } = layoutGraph(
			initial.nodes.map(node => ({ ...node, measured: { width: 600, height: 150 } })),
			initial.edges
		);

		// Verify
		for (const [index, node] of nodes.entries()) {
			expect(Number.isFinite(node.position.x)).toBe(true);
			expect(Number.isFinite(node.position.y)).toBe(true);
			for (const other of nodes.slice(index + 1)) {
				expect(
					Math.abs(node.position.x - other.position.x) >= 600 ||
						Math.abs(node.position.y - other.position.y) >= 150
				).toBe(true);
			}
		}
		for (const edge of edges) {
			expect(edge.sourceHandle).toMatch(/^(top|right|bottom|left)-source$/);
			expect(edge.targetHandle).toMatch(/^(top|right|bottom|left)-target$/);
		}
		expect(initial.nodes.every(node => node.measured === undefined)).toBe(true);
	});

	it("supports an empty graph", () => {
		// Exercise
		const graph = createGraph({ skills: [], learningUnits: [], edges: [] });

		// Verify
		expect(graph).toEqual({
			nodes: [],
			edges: []
		});
	});
});
