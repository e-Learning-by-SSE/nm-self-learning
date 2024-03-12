import ReactFlow, {
	Background,
	Controls,
	Edge,
	Node,
	MarkerType,
	MiniMap,
	Position
} from "reactflow";
import dagre from "@dagrejs/dagre";
import { Mesh } from "@self-learning/types";

interface ReactFlowGraph {
	nodes: Node[];
	edges: Edge[];
}

const xAxisStartPosition = 20;
const yAxisStartPosition = 20;
const xAxisNodeDistance = 260;
const yAxisDistance = 86;
const nodeWidth = 172;
const nodeHeight = 36;
const platformColor = "#10b981";

function isEdgeInArray(edge: Edge, edges: Edge[]) {
	for (const elem of edges) {
		if (edge.label === elem.label) {
			if (edge.source === elem.source && edge.target === elem.target) {
				return true;
			}
		}
	}
	return false;
}

function removeDuplicateEdges(edges: Edge[]) {
	const result: Edge[] = [];
	for (const edge of edges) {
		if (!isEdgeInArray(edge, result) && edge.target !== "") {
			result.push(edge);
		}
	}
	return result;
}

function setEdgeIds(edges: Edge[]) {
	const result: Edge[] = [];
	let id = 1;
	for (const edge of edges) {
		edge.id = String(id);
		result.push(edge);
		id++;
	}
	return result;
}

function getEdgesWithSkill(edges: Edge[], skill: string) {
	return edges.filter(edge => edge.label === skill);
}

function generateGraph(meshes: Mesh[], target: Position, source: Position) {
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	let id = 1;
	let x = xAxisStartPosition;
	const y = yAxisStartPosition;

	for (const mesh of meshes) {
		const node: Node = {
			id: String(id),
			position: { x: x, y: y },
			data: { label: mesh.lesson.title },
			targetPosition: target,
			sourcePosition: source
		};
		nodes.push(node);

		if (mesh.gainedSkills) {
			for (const skill of mesh.gainedSkills) {
				const edge: Edge = {
					id: "",
					source: String(id),
					target: "",
					label: skill.name,
					markerEnd: {
						type: MarkerType.Arrow,
						width: 30,
						height: 30,
						color: platformColor
					},
					style: { stroke: platformColor }
				};
				edges.push(edge);
			}
		}
		id++;
		x += xAxisNodeDistance;
	}
	id = 1;
	for (const mesh of meshes) {
		if (mesh.requiredSkills) {
			for (const skill of mesh.requiredSkills) {
				const edgesRequiringSkill = getEdgesWithSkill(edges, skill.name);
				for (const edge of edgesRequiringSkill) {
					if (edge) {
						const newEdge = structuredClone(edge);
						newEdge.target = String(id);
						edges.push(newEdge);
					}
				}
			}
		}
		id++;
	}

	const validEdges = removeDuplicateEdges(edges);
	const edgesWithIds = setEdgeIds(validEdges); // ReactFlow requires unique ids for edges
	return { nodes: nodes, edges: edgesWithIds };
}

function applyDagreLayout(graph: ReactFlowGraph, direction: string) {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	const isHorizontal = direction === "LR";
	dagreGraph.setGraph({ rankdir: direction });

	const nodes = graph.nodes;
	const edges = graph.edges;

	nodes.forEach(node => {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	});
	edges.forEach(edge => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	nodes.forEach(node => {
		const nodeWithPosition = dagreGraph.node(node.id);
		node.targetPosition = isHorizontal ? Position.Left : Position.Top;
		node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
		node.position = {
			x: nodeWithPosition.x - nodeWidth / 2,
			y: nodeWithPosition.y - nodeHeight / 2
		};
	});

	return { nodes: nodes, edges: edges };
}

function applySimpleTopToBottomLayout(graph: ReactFlowGraph) {
	const rawNodes = graph.nodes;
	let i = 0;
	for (const node of rawNodes) {
		node.position.y = i;
		node.position.x = xAxisStartPosition;
		i += yAxisDistance;
	}
	return graph;
}

export function convertToGraph(meshes: Mesh[]) {
	if (meshes.length > 0) {
		const graphWithoutLayout = generateGraph(meshes, Position.Left, Position.Right);
		const graph = applyDagreLayout(graphWithoutLayout, "LR");
		return graph;
	} else {
		return { nodes: [], edges: [] };
	}
}

export function convertToLearnpath(meshes: Mesh[]) {
	if (meshes.length > 0) {
		const graphWithoutLayout = generateGraph(meshes, Position.Top, Position.Bottom);
		const graph = applySimpleTopToBottomLayout(graphWithoutLayout);
		return graph;
	} else {
		return { nodes: [], edges: [] };
	}
}

export default function GraphEditor({
	graph,
	height,
	hasControls,
	hasMiniMap
}: {
	graph: { nodes: Node[]; edges: Edge[] };
	height: number;
	hasControls: boolean;
	hasMiniMap: boolean;
}) {
	return (
		<div style={{ height: height }}>
			<ReactFlow nodes={graph.nodes} edges={graph.edges}>
				<Background />
				{hasControls && <Controls />}
				{hasMiniMap && <MiniMap />}
			</ReactFlow>
		</div>
	);
}
