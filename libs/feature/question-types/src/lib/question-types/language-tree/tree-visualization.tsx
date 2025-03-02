"use client";

import type React from "react";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import dagre from "@dagrejs/dagre";
import type { TreeNode } from "./tree-parser";

interface NodePosition {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	node: TreeNode;
}

interface Edge {
	from: string;
	to: string;
}

function createGraph(root: TreeNode): { nodes: NodePosition[]; edges: Edge[] } {
	const graph = new dagre.graphlib.Graph();
	graph.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 50 });
	graph.setDefaultEdgeLabel(() => ({}));

	const nodes: NodePosition[] = [];
	const edges: Edge[] = [];

	function addNode(node: TreeNode, id: string) {
		const nodeWidth = Math.max(node.value.length * 10, 50);
		const nodeHeight = 30;

		graph.setNode(id, { width: nodeWidth, height: nodeHeight });
		nodes.push({ id, x: 0, y: 0, width: nodeWidth, height: nodeHeight, node });

		node.children.forEach((child, index) => {
			const childId = `${id}-${index}`;
			addNode(child, childId);
			graph.setEdge(id, childId);
			edges.push({ from: id, to: childId });
		});
	}

	addNode(root, "root");
	dagre.layout(graph);

	nodes.forEach(node => {
		const dagreNode = graph.node(node.id);
		node.x = dagreNode.x;
		node.y = dagreNode.y;
	});

	return { nodes, edges };
}

function calculateViewBox(nodes: NodePosition[]): {
	minX: number;
	minY: number;
	width: number;
	height: number;
} {
	const minX = Math.min(...nodes.map(n => n.x - n.width / 2));
	const maxX = Math.max(...nodes.map(n => n.x + n.width / 2));
	const minY = Math.min(...nodes.map(n => n.y - n.height / 2));
	const maxY = Math.max(...nodes.map(n => n.y + n.height / 2));

	return {
		minX: minX - 20,
		minY: minY - 20,
		width: maxX - minX + 40,
		height: maxY - minY + 40
	};
}

export function TreeVisualization({ root }: { root: TreeNode }): React.ReactElement {
	const { nodes, edges } = useMemo(() => createGraph(root), [root]);
	const viewBox = useMemo(() => calculateViewBox(nodes), [nodes]);

	const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
	const svgRef = useRef<SVGSVGElement>(null);
	const isDragging = useRef(false);
	const lastPosition = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const preventZoom = (event: WheelEvent) => {
			if (event.ctrlKey) {
				event.preventDefault();
			}
		};

		window.addEventListener("wheel", preventZoom, { passive: false });

		return () => {
			window.removeEventListener("wheel", preventZoom);
		};
	}, []);

	const handleWheel = useCallback(
		(event: React.WheelEvent) => {
			if (!event.ctrlKey) return;
			const scaleChange = event.deltaY * -0.001;
			const newScale = Math.max(0.1, Math.min(transform.scale + scaleChange, 4));

			setTransform(prev => ({
				...prev,
				scale: newScale
			}));
		},
		[transform.scale]
	);

	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		isDragging.current = true;
		lastPosition.current = { x: event.clientX, y: event.clientY };
	}, []);

	const handleMouseMove = useCallback((event: React.MouseEvent) => {
		if (!isDragging.current) return;

		const dx = event.clientX - lastPosition.current.x;
		const dy = event.clientY - lastPosition.current.y;

		setTransform(prev => ({
			...prev,
			x: prev.x + dx / prev.scale,
			y: prev.y + dy / prev.scale
		}));

		lastPosition.current = { x: event.clientX, y: event.clientY };
	}, []);

	const handleMouseUp = useCallback(() => {
		isDragging.current = false;
	}, []);

	function renderEdge(edge: Edge): React.ReactElement | null {
		const fromNode = nodes.find(n => n.id === edge.from);
		const toNode = nodes.find(n => n.id === edge.to);
		if (!fromNode || !toNode) return null;
		return (
			<line
				key={`${edge.from}-${edge.to}`}
				x1={fromNode.x}
				y1={fromNode.y + fromNode.height / 2}
				x2={toNode.x}
				y2={toNode.y - toNode.height / 2}
				stroke="black"
				strokeWidth="1"
			/>
		);
	}

	function renderNode(pos: NodePosition): React.ReactElement {
		return (
			<g key={pos.id} transform={`translate(${pos.x},${pos.y})`}>
				<rect
					x={-pos.width / 2}
					y={-pos.height / 2}
					width={pos.width}
					height={pos.height}
					rx={5}
					ry={5}
					fill="white"
					stroke={pos.node.isLeaf ? "green" : "blue"}
					strokeWidth="2"
				/>
				<text
					textAnchor="middle"
					dominantBaseline="middle"
					className={`text-sm font-bold ${pos.node.isLeaf ? "fill-green-600" : "fill-blue-600"}`}
				>
					{pos.node.value}
				</text>
			</g>
		);
	}

	return (
		<div className={`${ isDragging.current ? "cursor-grabbing" : "cursor-grab" }`}>
			<span className="text-base p-2">strg + wheel to zoom</span>
				<svg
					ref={svgRef}
					width="100%"
					height="100%"
					viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
					preserveAspectRatio="xMidYMid meet"
					onWheel={handleWheel}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				>
					<g
						transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}
					>
						{edges.map(renderEdge)}
						{nodes.map(renderNode)}
					</g>
				</svg>
		</div>
	);
}
