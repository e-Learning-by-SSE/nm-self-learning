import { MarkerType, type Edge, type Node } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@self-learning/api";

type GraphAnalysisType = inferProcedureOutput<AppRouter["course"]["getGraphContent"]>;

export type SkillNodeData = {
	label: string;
	taughtBy: string[];
	requiredBy: string[];
};

export type SkillNodeType = Node<SkillNodeData, "skill">;

export type LearningUnitNodeData = {
	label: string;
	provides: string[];
	requires: string[];
};

export type LearningUnitNodeType = Node<LearningUnitNodeData, "learningUnit">;
export type GraphNode = SkillNodeType | LearningUnitNodeType;

export function createGraph(graphData: GraphAnalysisType) {
	const luNodes: LearningUnitNodeType[] = graphData.learningUnits.map((lu, index) => ({
		id: lu.lessonId,
		type: "learningUnit",
		position: {
			x: index * 300,
			y: 100
		},
		data: {
			label: lu.title,
			provides: lu.provides.map(
				goal => graphData.skills.find(skill => skill.id === goal.id)?.name ?? ""
			),
			requires: lu.requires.map(
				req => graphData.skills.find(skill => skill.id === req.id)?.name ?? ""
			)
		}
	}));

	const skillNodes: SkillNodeType[] = graphData.skills.map((skill, index) => ({
		id: skill.id,
		type: "skill",
		position: {
			x: index * 300 - 150,
			y: 200
		},
		data: {
			label: skill.name,
			taughtBy: graphData.learningUnits
				.filter(lu => lu.provides.some(goal => goal.id === skill.id))
				.map(lu => lu.title),
			requiredBy: graphData.learningUnits
				.filter(lu => lu.requires.some(req => req.id === skill.id))
				.map(lu => lu.title)
		}
	}));

	const learningUnitIds = new Set(graphData.learningUnits.map(lu => lu.lessonId));
	const skillIds = new Set(graphData.skills.map(skill => skill.id));
	const edges: Edge[] = createEdges(graphData.edges, learningUnitIds, skillIds);
	const nodes = layoutNodes([...luNodes, ...skillNodes], edges);
	const layoutedEdges = layoutEdges(nodes, edges);
	return { nodes, edges: layoutedEdges };
}

function layoutNodes(nodes: GraphNode[], edges: Edge[]) {
	const graph = new dagre.graphlib.Graph();

	graph.setDefaultEdgeLabel(() => ({}));

	graph.setGraph({
		rankdir: "TB", // Top -> Bottom
		nodesep: 50,
		ranksep: 80
	});

	nodes.forEach(node => {
		graph.setNode(node.id, {
			width: 150,
			height: 50
		});
	});

	edges.forEach(edge => {
		graph.setEdge(edge.source, edge.target);
	});

	dagre.layout(graph);

	return nodes.map(node => {
		const position = graph.node(node.id);

		return {
			...node,
			position: {
				x: position.x - 150 / 2,
				y: position.y - 50 / 2
			}
		};
	});
}

function createEdges(
	data: { from: string; to: string }[],
	learningUnitIds: Set<string>,
	skillIds: Set<string>
) {
	return data.map((edge, index) => {
		const sourceIsLearningUnit = learningUnitIds.has(edge.from);
		const targetIsLearningUnit = learningUnitIds.has(edge.to);

		const sourceIsSkill = skillIds.has(edge.from);
		const targetIsSkill = skillIds.has(edge.to);

		const isSkillLearningUnitEdge =
			(sourceIsSkill && targetIsLearningUnit) || (sourceIsLearningUnit && targetIsSkill);

		const color = sourceIsLearningUnit
			? "#dc2626"
			: targetIsLearningUnit
				? "#16a34a"
				: "#64748b";

		return {
			id: `e-${index}`,
			source: edge.from,
			target: edge.to,
			style: {
				stroke: color,
				strokeWidth: 1
			},
			markerStart: isSkillLearningUnitEdge
				? {
						type: MarkerType.ArrowClosed,
						color,
						width: 16,
						height: 16
					}
				: undefined
		};
	});
}

function layoutEdges(nodes: GraphNode[], edges: Edge[]) {
	const nodeMap = new Map(nodes.map(node => [node.id, node]));
	const layoutedEdges = edges.map(edge => {
		const source = nodeMap.get(edge.source);
		const target = nodeMap.get(edge.target);

		if (!source || !target) {
			return edge;
		}

		const { sourceHandle, targetHandle } = getHandlePositions(source, target);

		return {
			...edge,
			sourceHandle,
			targetHandle
		};
	});
	return layoutedEdges;
}

function getHandlePositions(source: GraphNode, target: GraphNode) {
	const dx = target.position.x - source.position.x;
	const dy = target.position.y - source.position.y;

	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx > 0) {
			return {
				sourceHandle: "right-source",
				targetHandle: "left-target"
			};
		}

		return {
			sourceHandle: "left-source",
			targetHandle: "right-target"
		};
	}

	if (dy > 0) {
		return {
			sourceHandle: "bottom-source",
			targetHandle: "top-target"
		};
	}

	return {
		sourceHandle: "top-source",
		targetHandle: "bottom-target"
	};
}
