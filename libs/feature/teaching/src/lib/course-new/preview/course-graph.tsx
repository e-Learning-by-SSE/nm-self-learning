import { AcademicCapIcon, PlayCircleIcon, StarIcon } from "@heroicons/react/24/outline";
import {
	Handle,
	Background,
	Controls,
	Panel,
	ReactFlow,
	Position,
	type NodeProps,
	type ReactFlowInstance,
	type NodeMouseHandler,
	useNodesState
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type GraphAnalysisType,
	type GraphNode as GraphNodeType,
	createGraph,
	layoutGraph
} from "./graph-analysis";

const nodeStyles = {
	skill: {
		border: "border-blue-300",
		color: "bg-blue-50 text-blue-800",
		Icon: AcademicCapIcon,
		iconSize: "10px"
	},
	courseGoal: {
		border: "border-purple-300",
		color: "bg-purple-50 text-purple-800",
		Icon: StarIcon,
		iconSize: "10px"
	},
	learningUnit: {
		border: "border-green-300",
		color: "bg-green-50 text-green-800",
		Icon: PlayCircleIcon,
		iconSize: "12px"
	}
};

const untaughtBorder = "border-2 border-red-500";

const sectionStyles = {
	provides: { border: "border-green-300", title: "text-green-700" },
	requires: { border: "border-red-300", title: "text-red-700" }
};

type NodeVariant = keyof typeof nodeStyles;

export function Graph({
	graphData,
	courseGoalIds
}: {
	graphData: GraphAnalysisType;
	courseGoalIds: readonly string[];
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const [selection, setSelection] = useState<{
		data: GraphNodeType["data"];
		position: { x: number; y: number };
	} | null>(null);
	const [initialGraph] = useState(() => createGraph(graphData, courseGoalIds));

	const [nodes, setNodes, onNodesChange] = useNodesState<GraphNodeType>(initialGraph.nodes);

	const [edges, setEdges] = useState(initialGraph.edges);
	const [flow, setFlow] = useState<ReactFlowInstance<GraphNodeType> | null>(null);
	const lastDimensions = useRef("");

	useEffect(() => {
		if (
			!flow ||
			nodes.length === 0 ||
			nodes.some(node => !node.measured?.width || !node.measured?.height)
		)
			return;
		const dimensions = JSON.stringify(
			nodes.map(node => [node.id, node.measured?.width, node.measured?.height])
		);
		if (dimensions === lastDimensions.current) return;
		lastDimensions.current = dimensions;
		const layout = layoutGraph(nodes, edges);
		setNodes(layout.nodes);
		setEdges(layout.edges);
		// Wait for ReactFlow to apply the new positions before fitting the viewport.
		requestAnimationFrame(() => {
			void flow.fitView();
		});
	}, [nodes, edges, flow, setNodes]);

	const onNodeClick: NodeMouseHandler<GraphNodeType> = (event, node) => {
		const element = (event.target as HTMLElement).closest(".react-flow__node");
		if (!element) return;
		const rect = element.getBoundingClientRect();
		setSelection({ data: node.data, position: { x: rect.left + rect.width / 2, y: rect.top } });
	};

	return (
		<div className="w-full shrink-0 bg-gray-100 rounded-lg" style={{ height: 650 }}>
			<ReactFlow
				onInit={setFlow}
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				nodeTypes={nodeTypes}
				fitView
				proOptions={{ hideAttribution: true }}
				ariaLabelConfig={{
					"controls.zoomIn.ariaLabel": t("Graph_Analysis.Zoom_In"),
					"controls.zoomOut.ariaLabel": t("Graph_Analysis.Zoom_Out"),
					"controls.fitView.ariaLabel": t("Graph_Analysis.Fit_View"),
					"controls.interactive.ariaLabel": t("Graph_Analysis.Toggle_Interactivity")
				}}
				onNodeClick={onNodeClick}
				onPaneClick={() => setSelection(null)}
			>
				<Background />
				<Controls position="bottom-left" />
				<Panel
					position="bottom-left"
					style={{
						left: "48px"
					}}
				>
					<ul className="flex flex-wrap gap-3 rounded border border-gray-400 bg-white/95 px-3 py-2 text-xs text-gray-700 shadow-sm">
						<LegendItem variant="skill" label={t("common:Skill", { count: 1 })} />
						<LegendItem
							variant="skill"
							untaught
							label={t("Graph_Analysis.Untaught_Skill")}
						/>
						<LegendItem variant="courseGoal" label={t("Graph_Analysis.Course_Goal")} />
						<LegendItem variant="learningUnit" label={t("common:Lesson")} />
					</ul>
				</Panel>
			</ReactFlow>

			{selection && (
				<DetailsDialog
					selectedElement={selection.data}
					dialogPosition={selection.position}
				/>
			)}
		</div>
	);
}

function LegendItem({
	variant,
	label,
	untaught = false
}: {
	variant: NodeVariant;
	label: string;
	untaught?: boolean;
}) {
	const { border, color } = nodeStyles[variant];
	return (
		<li className="flex items-center gap-1.5">
			<span
				aria-hidden="true"
				className={`h-3 w-3 rounded-sm ${color} ${untaught ? untaughtBorder : `border ${border}`}`}
			/>
			{label}
		</li>
	);
}

function DetailsDialog({
	selectedElement,
	dialogPosition
}: {
	selectedElement: GraphNodeType["data"];
	dialogPosition: { x: number; y: number };
}) {
	const { t } = useTranslation("feature-teaching");
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const dragStart = useRef({ x: 0, y: 0 });
	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		dragStart.current = { x: event.clientX - dragOffset.x, y: event.clientY - dragOffset.y };
	};
	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
		setDragOffset({
			x: event.clientX - dragStart.current.x,
			y: event.clientY - dragStart.current.y
		});
	};

	const sections =
		"provides" in selectedElement
			? [
					// Learning Units
					{
						title: t("Graph_Analysis.Learning_Goals", {
							count: selectedElement.provides.length
						}),
						items: selectedElement.provides,
						style: sectionStyles.provides
					},
					{
						title: t("Graph_Analysis.Prerequisites", {
							count: selectedElement.requires.length
						}),
						items: selectedElement.requires,
						style: sectionStyles.requires
					}
				]
			: [
					// Skills
					{
						title: t("Graph_Analysis.Taught_In"),
						items: [...selectedElement.taughtBy, ...selectedElement.children],
						style: sectionStyles.provides
					},
					{
						title: t("Graph_Analysis.Required_In"),
						items: [...selectedElement.requiredBy, ...selectedElement.parents],
						style: sectionStyles.requires
					}
				];

	const visibleSections = sections.filter(section => section.items.length > 0);
	const headerStyle = nodeStyles[getNodeVariant(selectedElement)];
	const HeaderIcon = headerStyle.Icon;

	return (
		<div
			className="fixed z-50 w-[340px] -translate-x-1/2 -translate-y-full overflow-hidden rounded-xl border border-gray-400 bg-gray-100 shadow-xl"
			style={{
				left: dialogPosition.x + dragOffset.x,
				top: dialogPosition.y - 10 + dragOffset.y
			}}
			onClick={event => event.stopPropagation()}
		>
			<div
				className={`flex cursor-move touch-none select-none items-center gap-2 border-b px-4 py-2 ${headerStyle.border} ${headerStyle.color}`}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
			>
				<HeaderIcon className="h-5 w-5 shrink-0" />

				<h2 className="font-semibold">{selectedElement.label}</h2>
			</div>

			<div className="space-y-3 p-4">
				{visibleSections.map(section => (
					<div key={section.title} className={`border-l-4 pl-3 ${section.style.border}`}>
						<h3 className={`mb-1 text-sm font-medium ${section.style.title}`}>
							{section.title}
						</h3>
						<ul className="list-disc space-y-0.5 pl-5 text-sm text-gray-700">
							{section.items.map(item => (
								<li key={item} className="pl-0.5">
									{item}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}

function GraphNode({ data }: NodeProps<GraphNodeType>) {
	const { label } = data;
	const variant = getNodeVariant(data);
	const untaught = "taughtBy" in data && data.taughtBy.length === 0 && data.children.length === 0;
	const { border, color, Icon, iconSize } = nodeStyles[variant];
	return (
		<div
			className={`relative flex items-center rounded px-4 py-2 ${untaught ? untaughtBorder : `border ${border}`} ${color}`}
			title={label}
		>
			<Icon
				style={{
					position: "absolute",
					top: "4px",
					right: "4px",
					width: iconSize,
					height: iconSize
				}}
			/>
			<div className="whitespace-nowrap">{label}</div>
			<NodeHandles />
		</div>
	);
}

function NodeHandles() {
	return Object.values(Position).flatMap(position =>
		(["source", "target"] as const).map(type => (
			<Handle
				key={`${position}-${type}`}
				id={`${position}-${type}`}
				type={type}
				position={position}
			/>
		))
	);
}

function getNodeVariant(data: GraphNodeType["data"]): NodeVariant {
	return "provides" in data ? "learningUnit" : data.isCourseGoal ? "courseGoal" : "skill";
}

const nodeTypes = { skill: GraphNode, learningUnit: GraphNode };
