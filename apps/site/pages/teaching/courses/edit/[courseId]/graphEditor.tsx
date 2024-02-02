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

//--------- Graph Generator -----------------------------------------

// standard starting position of node and standard distance between node
const xAxisStartPosition = 40;
const yAxisStartPosition = 40;
const xAxisNodeDistance = 260;
const yAxisNodeDistance = 200;
const bgColorDisconnectedNode = "#dadada";
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

function removeDuplicates(arr: Edge[]) {
	const resultArr: Edge[] = [];
	for (const elem of arr) {
		if (!isInArray(elem, resultArr)) {
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

function getEdgesWithLabel(edges: Edge[], label: string) {
	const result: Edge[] = [];
	for (const edge of edges) {
		if (edge.label === label) {
			result.push(edge);
		}
	}
	return result;
}

function generateGraph(meshes: Mesh[]) {
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
			targetPosition: Position.Left,
			sourcePosition: Position.Right
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
				const edgesRequiringSkill = getEdgesWithLabel(edges, skill);
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

	const edgesWithoutDuplicates = removeDuplicates(edges);
	const edgesWithIds = setEdgeIds(edgesWithoutDuplicates);
	return { nodes: nodes, edges: edgesWithIds };
}

export function convertToGraph(meshes: Mesh[]) {
	const graph = generateGraph(meshes);
	return graph;
}

// --------- Component -----------------------------------------

export default function GraphEditor({
	meshes,
	graph,
	size
}: {
	meshes: Mesh[];
	graph: { nodes: Node[]; edges: Edge[] };
	size: number;
}) {
	return (
		<>
			{/**
			<div className="mb-4">
				<ul>
					{meshes.map((mesh: Mesh, index: number) => (
						<li key={index}>{mesh.lesson.title}</li>
					))}
				</ul>
			</div>
			 */}
			<div style={{ height: size }}>
				<ReactFlow nodes={graph.nodes} edges={graph.edges}>
					<Background />
					<Controls />
					<MiniMap />
				</ReactFlow>
			</div>
		</>
	);
}

// TODO: remove later
/*
// what genGraph2 needs:
function getEdgesWithSource(edges: Edge[], source: string) {
	const result: Edge[] = [];
	for (const edge of edges) {
		if (edge.source === source) {
			result.push(edge);
		}
	}
	return result;
}

// recursive function
function getChildNode(parent: Node, edges: Edge[], nodes: Node[], bgColor: string) {
	console.log("get child node from parent node ", parent.id);

	const edgesRequiringSkill = getEdgesWithSource(edges, parent.data.label);
	if (edgesRequiringSkill.length === 0) {
		return null;
	} else {
		let node: Node = { id: "", position: { x: 0, y: 0 }, data: null };
		for (const edge of edgesRequiringSkill) {
			node = {
				id: edge.target,
				position: { x: 0, y: 0 },
				data: { label: edge.target },
				targetPosition: Position.Left,
				sourcePosition: Position.Right,
				style: { background: bgColor }
			};
			nodes.push(node);
		}
		return getChildNode(node, edges, nodes, bgColor);
	}
}

function getRootNodeLabel(meshes: any, edges: Edge[]) {
	// root node is the node that never is a target for any skill
	for (const mesh of meshes) {
		const target = edges.filter(edge => edge.target === mesh.lesson);
		if (target.length < 1) {
			return mesh.lesson;
		}
	}
	return null;
}

function getEdges(meshes: any) {
	const edges: Edge[] = [];
	// getting all target nodes
	const targetEdges: any[] = [];
	for (const mesh of meshes) {
		if (mesh.requiredSkill) {
			const target = { target: mesh.lesson, label: mesh.requiredSkill };
			targetEdges.push(target);
		}
	}
	const sourceEdges: any[] = [];
	for (const mesh of meshes) {
		if (mesh.gainedSkill) {
			const source = { source: mesh.lesson, label: mesh.gainedSkill };
			sourceEdges.push(source);
		}
	}
	// combining sources with targets
	for (const targetEdge of targetEdges) {
		const label = String(targetEdge.label);
		const sourceEdgesWithLabel = getEdgesWithLabel(sourceEdges, label);
		for (const sourceEdge of sourceEdgesWithLabel) {
			const edge: Edge = {
				id: sourceEdge.source + " - " + targetEdge.target,
				source: sourceEdge.source,
				target: targetEdge.target,
				label: label,
				markerEnd: {
					type: MarkerType.Arrow,
					width: 30,
					height: 30,
					color: "#10b981"
				},
				style: { stroke: "#10b981" }
			};
			edges.push(edge);
		}
	}
	return edges;
}

function adjustNodePositionSimple(nodes: Node[]) {
	let x = xAxisStartPosition;
	const y = yAxisStartPosition;
	for (const node of nodes) {
		node.position.x = x;
		node.position.y = y;
		x += xAxisNodeDistance;
	}
}

function getSharedSkills(edges: Edge[]) {
	const sharedSkills: string[] = [];
	for (const edge of edges) {
		const skill = String(edge.label);
		const edgesWithThisSkill = edges.filter(edge => edge.label === skill);
		if (edgesWithThisSkill.length > 1) {
			if (!sharedSkills.includes(skill)) {
				sharedSkills.push(skill);
			}
		}
	}
	return sharedSkills;
}

function isInNodeArray(node: Node, arr: Node[]) {
	for (const elem of arr) {
		if (node.id === elem.id) {
			return true;
		}
	}
	return false;
}
*/
/*
function adjustNodesPosition(nodes: Node[], edges: Edge[]) {
	let edgesCopy = structuredClone(edges);
	const targetsNodesId = [];
	for (const edge of edgesCopy) {
		const edgeSource = edge.source;
		const sources = edgesCopy.filter(elem => elem.source === edgeSource);
		if (sources.length > 1) {
			console.log("sources", sources);
			const targets = sources.map(elem => elem.target);
			targetsNodesId.push(targets[1]); // TODO: change so it is working not only for second but also for 3rd etc node
		}
		// remove checked edges
		edgesCopy = edgesCopy.filter(elem => elem.source !== edgeSource);
	}
	console.log("targets", targetsNodesId);

	// change position
	const adjustedNodes: Node[] = [];
	for (const node of nodes) {
		if (targetsNodesId.includes(node.id)) {
			node.position.x -= xAxisNodeDistance;
			node.position.y += yAxisNodeDistance;
		}
		adjustedNodes.push(node);
	}

	return adjustedNodes;
}*/

/*
function getSubMeshes(nodes: Node[], meshes: any[]) {
	let submeshes = structuredClone(meshes);
	for (const node of nodes) {
		submeshes = submeshes.filter(mesh => mesh.lesson !== node.id);
	}
	console.log("submeshes", submeshes);
	return submeshes;
}
*/

/*
function generateGraphOld(meshes: any) {
	const nodes: Node[] = [];
	const edges: Edge[] = getEdges(meshes);

	console.log("Edges", edges);

	const x = xAxisStartPosition;
	const y = yAxisStartPosition;

	const rootNodeLabel = getRootNodeLabel(meshes, edges); // there can be more than one root node?
	const rootNode: Node = {
		id: rootNodeLabel,
		position: { x: x, y: y },
		data: { label: rootNodeLabel },
		type: "input", // this node is not a target for other nodes (only source)
		targetPosition: Position.Left,
		sourcePosition: Position.Right
	};
	nodes.push(rootNode);

	getChildNode(rootNode, edges, nodes, "");
	// to detected unconnected nodes compare number of nodes with number of meshes
	if (nodes.length < meshes.length) {
		console.log("there are some unconnected nodes");
		const submeshes = getSubMeshes(nodes, meshes);
		const subrootNodeLabel = getRootNodeLabel(submeshes, edges);
		console.log(subrootNodeLabel);
		const subrootNode: Node = {
			id: subrootNodeLabel,
			position: { x: x, y: y },
			data: { label: subrootNodeLabel },
			type: "input", // this node is not a target for other nodes (only source)
			targetPosition: Position.Left,
			sourcePosition: Position.Right,
			style: { background: bgColorDisconnectedNode }
		};
		nodes.push(subrootNode);

		getChildNode(subrootNode, edges, nodes, bgColorDisconnectedNode);
	}
	console.log("Nodes", nodes);
	adjustNodePositionSimple(nodes);
	const adjustedNodes = adjustNodesPosition(nodes, edges);
	console.log("Nodes with adjusted pos", adjustedNodes);
	//return { nodes: nodes, edges: edges };
	return { nodes: adjustedNodes, edges: edges };
}
*/

// ----------------------------------------------------------------------------
// TODO: remove dummy data later
/*
const dummyNodes = [
	{
		id: "1",
		position: { x: 40, y: 10 },
		data: { label: "Python Programming 1" },
		type: "input",
		sourcePosition: "right"
	} as Node,
	{
		id: "2",
		position: { x: 300, y: 10 },
		data: { label: "Python Programming 2" },
		sourcePosition: "right",
		targetPosition: "left"
	} as Node,
	{
		id: "3",
		position: { x: 560, y: 10 },
		data: { label: "Distributed Computing" },
		type: "output",
		sourcePosition: "right",
		targetPosition: "left"
	} as Node,
	{
		id: "4",
		position: { x: 300, y: 100 },
		data: { label: "Machine Learning Lab" },
		sourcePosition: "right",
		targetPosition: "left"
	} as Node
];

const dummyEdges = [
	{
		id: "1-2",
		source: "1",
		target: "2",
		label: "python basic",
		markerEnd: {
			type: MarkerType.Arrow,
			width: 30,
			height: 30,
			color: "#10b981"
		},
		style: { stroke: "#10b981" }
	} as Edge,
	{
		id: "2-3",
		source: "2",
		target: "3",
		label: "python adv.",
		markerEnd: {
			type: MarkerType.Arrow,
			width: 30,
			height: 30,
			color: "#10b981"
		},
		style: { stroke: "#10b981" }
	} as Edge,
	{
		id: "1-4",
		source: "1",
		target: "4",
		label: "python basic",
		markerEnd: {
			type: MarkerType.Arrow,
			width: 30,
			height: 30,
			color: "#10b981"
		},
		style: { stroke: "#10b981" }
	} as Edge
];

const dummyGraph = { nodes: dummyNodes, edges: dummyEdges };
*/
