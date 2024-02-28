import ReactFlow, {
	Background,
	Controls,
	Edge,
	Node,
	MarkerType,
	MiniMap,
	Position
} from "reactflow";
import { Mesh } from "apps/site/pages/teaching/courses/edit/[courseId]/learnpath";
import dagre from "@dagrejs/dagre";

// ------------ Layout with dagrejs ----------------------------------

interface ReactFlowGraph {
	nodes: Node[];
	edges: Edge[];
}

function applyLayout(graph: ReactFlowGraph, direction: string) {
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

//--------- Graph Generator -----------------------------------------
// standard starting position of node and standard distance between node
const xAxisStartPosition = 20;
const yAxisStartPosition = 20;
const xAxisNodeDistance = 260;
const yAxisDistance = 86;
const nodeWidth = 172;
const nodeHeight = 36;
const platformColor = "#10b981";

function isInArray(edge: Edge, arr: Edge[]) {
	for (const elem of arr) {
		if (edge.label === elem.label) {
			if (edge.source === elem.source && edge.target === elem.target) {
				return true;
			}
		}
	}
	return false;
}

// Function removes duplicated edges and edges without "target" value
function filterValidEdges(arr: Edge[]) {
	const resultArr: Edge[] = [];
	for (const elem of arr) {
		if (!isInArray(elem, resultArr) && elem.target !== "") {
			resultArr.push(elem);
		}
	}
	return resultArr;
}

function setEdgeIds(arr: Edge[]) {
	const resultArr: Edge[] = [];
	let id = 1;
	for (const edge of arr) {
		edge.id = String(id);
		resultArr.push(edge);
		id++;
	}
	return resultArr;
}

function getEdgesWithSkill(edges: Edge[], skill: string) {
	const result: Edge[] = [];
	for (const edge of edges) {
		if (edge.label === skill) {
			result.push(edge);
		}
	}
	return result;
}

// Function generates graph with a simplified layout (all nodes in one line)
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
					label: skill,
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
				const edgesRequiringSkill = getEdgesWithSkill(edges, skill);
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

	const validEdges = filterValidEdges(edges);
	const edgesWithIds = setEdgeIds(validEdges); // ReactFlow requires unique ids for edges
	return { nodes: nodes, edges: edgesWithIds };
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
	const rawGraph = generateGraph(meshes, Position.Left, Position.Right);
	const graph = applyLayout(rawGraph, "LR");
	return graph;
}

export function convertToLearnpath(meshes: Mesh[]) {
	const rawGraph = generateGraph(meshes, Position.Top, Position.Bottom);
	//const graph = applyLayout(rawGraph, "TB"); // TODO: remove later (version with dagrejs)
	const graph = applySimpleTopToBottomLayout(rawGraph);
	return graph;
}

// --------- Component -----------------------------------------
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
