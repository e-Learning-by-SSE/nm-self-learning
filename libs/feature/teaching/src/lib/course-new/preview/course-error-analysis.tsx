import { AcademicCapIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import {
	Handle,
	Background,
	Controls,
	Panel,
	ReactFlow,
	Position,
	type NodeProps,
	NodeMouseHandler,
	useNodesState
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { inferProcedureOutput, inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { skipToken } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useJob } from "./use-job";
import { LoadingBox } from "@self-learning/ui/common";
import { Warning } from "./warning";
import {
	type LearningUnitNodeData,
	type SkillNodeData,
	type LearningUnitNodeType,
	type SkillNodeType,
	createGraph
} from "./graph-analysis";

type GraphRawInput = inferProcedureInput<AppRouter["course"]["getGraphContent"]>;

type CoursePreviewModel = inferProcedureOutput<AppRouter["course"]["getCourse"]>;

/**
 * Entry Point component.
 * Fetches analysis data and returns error if no valid data was computed, otherwise handles over to the GraphAnalysis component.
 * @param param0
 * @returns
 */
export function PathAnalysis({ course }: { course: CoursePreviewModel }) {
	const job = useJob(
		trpc.course.createCourseGraphJob,
		course.courseId ? { courseId: course.courseId } : undefined
	);

	return (
		<>
			<Warning title="noCoursePathTitle" description="noCoursePathDescription" />
			{job.isPending ? (
				<LoadingBox />
			) : (
				<GraphAnalysis
					status={job.data?.result}
					courseGoalIds={course.provides.map(skill => skill.id)}
				/>
			)}
		</>
	);
}

/**
 * Graph drawing component
 * @param param0
 * @returns
 */
function GraphAnalysis({
	status,
	courseGoalIds
}: {
	status?: string | null;
	courseGoalIds: readonly string[];
}) {
	let graphRawData: GraphRawInput | undefined;

	if (status != null) {
		graphRawData = JSON.parse(status) as GraphRawInput;
	}

	const { data: graphData, isLoading: isStatusLoading } = trpc.course.getGraphContent.useQuery(
		graphRawData ?? skipToken
	);

	if (isStatusLoading) {
		return <LoadingBox />;
	}

	if (!graphData) {
		return null;
	}

	if (graphData.learningUnits.length === 0) {
		return (
			<Warning title="No_Learning_Units.Title" description="No_Learning_Units.Description" />
		);
	}

	return <Graph graphData={graphData} courseGoalIds={courseGoalIds} />;
}

function Graph({
	graphData,
	courseGoalIds
}: {
	graphData: inferProcedureOutput<AppRouter["course"]["getGraphContent"]>;
	courseGoalIds: readonly string[];
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const [selectedElement, setSelectedElement] = useState<
		LearningUnitNodeData | SkillNodeData | null
	>(null);

	const [dialogPosition, setDialogPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const initialGraph = createGraph(graphData, courseGoalIds);

	const [nodes, , onNodesChange] = useNodesState<LearningUnitNodeType | SkillNodeType>(
		initialGraph.nodes
	);

	const edges = initialGraph.edges;

	const onNodeClick: NodeMouseHandler<LearningUnitNodeType | SkillNodeType> = (event, node) => {
		if (node.type === "learningUnit" || node.type === "skill") {
			setSelectedElement(node.data);

			const element = (event.target as HTMLElement).closest(".react-flow__node");

			if (element) {
				const rect = element.getBoundingClientRect();

				setDialogPosition({
					x: rect.left + rect.width / 2,
					y: rect.top
				});
			}
		}
	};

	const onPaneClick = () => {
		setSelectedElement(null);
		setDialogPosition(null);
	};

	return (
		<div className="h-[500px] w-full bg-gray-100 rounded-lg">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				nodeTypes={{
					skill: SkillNode,
					learningUnit: LearningUnitNode
				}}
				fitView
				proOptions={{ hideAttribution: true }}
				ariaLabelConfig={{
					"controls.zoomIn.ariaLabel": t("Graph_Analysis.Zoom_In"),
					"controls.zoomOut.ariaLabel": t("Graph_Analysis.Zoom_Out"),
					"controls.fitView.ariaLabel": t("Graph_Analysis.Fit_View"),
					"controls.interactive.ariaLabel": t("Graph_Analysis.Toggle_Interactivity")
				}}
				onNodeClick={onNodeClick}
				onPaneClick={onPaneClick}
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
						<li className="flex items-center gap-1.5">
							<span
								aria-hidden="true"
								className="h-3 w-3 rounded-sm border border-blue-300 bg-blue-50"
							/>
							{t("common:Skill", { count: 1 })}
						</li>
						<li className="flex items-center gap-1.5">
							<span
								aria-hidden="true"
								className="h-3 w-3 rounded-sm border-red-500 border-2 bg-blue-50"
							/>
							{t("Graph_Analysis.Untaught_Skill")}
						</li>
						<li className="flex items-center gap-1.5">
							<span
								aria-hidden="true"
								className="h-3 w-3 rounded-sm border border-purple-300 bg-purple-50"
							/>
							{t("Graph_Analysis.Course_Goal")}
						</li>
						<li className="flex items-center gap-1.5">
							<span
								aria-hidden="true"
								className="h-3 w-3 rounded-sm border border-green-300 bg-green-50"
							/>
							{t("common:Lesson")}
						</li>
					</ul>
				</Panel>
			</ReactFlow>

			{selectedElement && dialogPosition && (
				<DetailsDialog selectedElement={selectedElement} dialogPosition={dialogPosition} />
			)}
		</div>
	);
}

function DetailsDialog({
	selectedElement,
	dialogPosition
}: {
	selectedElement: LearningUnitNodeData | SkillNodeData;
	dialogPosition: { x: number; y: number };
}) {
	const { t } = useTranslation("feature-teaching");
	function isLearningUnit(
		element: LearningUnitNodeData | SkillNodeData
	): element is LearningUnitNodeData {
		return "provides" in element;
	}

	// Used for dragging the details dialog
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const dragStart = useRef({ x: 0, y: 0 });
	const offsetStart = useRef({ x: 0, y: 0 });
	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault();

		dragStart.current = {
			x: event.clientX,
			y: event.clientY
		};

		offsetStart.current = dragOffset;

		const handlePointerMove = (event: PointerEvent) => {
			setDragOffset({
				x: offsetStart.current.x + event.clientX - dragStart.current.x,
				y: offsetStart.current.y + event.clientY - dragStart.current.y
			});
		};

		const handlePointerUp = () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	};

	const sections = isLearningUnit(selectedElement)
		? [
				// Learning Units
				{
					title: t("Graph_Analysis.Learning_Goals", {
						count: selectedElement.provides.length
					}),
					items: selectedElement.provides,
					box: "rounded-lg border bg-green-50 border-green-300"
				},
				{
					title: t("Graph_Analysis.Prerequisites", {
						count: selectedElement.requires.length
					}),
					items: selectedElement.requires,
					box: "rounded-lg border bg-red-50 border-red-300"
				}
			]
		: [
				// Skills
				{
					title: t("Graph_Analysis.Taught_In"),
					items: [...selectedElement.taughtBy, ...selectedElement.children],
					box: "rounded-lg border bg-green-50 border-green-300"
				},
				{
					title: t("Graph_Analysis.Required_In"),
					items: [...selectedElement.requiredBy, ...selectedElement.parents],
					box: "rounded-lg border bg-red-50 border-red-300"
				}
			];

	const visibleSections = sections.filter(section => section.items.length > 0);
	const learningUnit = isLearningUnit(selectedElement);
	const isCourseGoal = !learningUnit && selectedElement.isCourseGoal;
	const headerStyle = learningUnit
		? "border-green-300 bg-green-50 text-green-800"
		: isCourseGoal
			? "border-purple-300 bg-purple-50 text-purple-800"
			: "border-blue-300 bg-blue-50 text-blue-800";

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
				className={`flex cursor-move select-none items-center gap-2 border-b px-4 py-2 ${headerStyle}`}
				onPointerDown={handlePointerDown}
			>
				{learningUnit ? (
					<PlayCircleIcon className="h-5 w-5 shrink-0" />
				) : (
					<AcademicCapIcon className="h-5 w-5 shrink-0" />
				)}

				<h2 className="font-semibold">{selectedElement.label}</h2>
			</div>

			<div className="space-y-3 p-4">
				{visibleSections.map((section, index) => {
					const positive = index === 0;

					return (
						<div
							key={section.title}
							className={`border-l-4 pl-3 ${
								positive ? "border-green-300" : "border-red-300"
							}`}
						>
							<h3
								className={`mb-1 text-sm font-medium ${
									positive ? "text-green-700" : "text-red-700"
								}`}
							>
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
					);
				})}
			</div>
		</div>
	);
}

function SkillNode({ data }: NodeProps<SkillNodeType>) {
	const notTaught = data.taughtBy.length === 0 && data.children.length === 0;
	const border = notTaught
		? "border-red-500 border-2"
		: data.isCourseGoal
			? "border border-purple-300"
			: "border border-blue-300";

	const color = data.isCourseGoal ? "bg-purple-50 text-purple-800" : "bg-blue-50 text-blue-800";

	return (
		<div className={`relative min-w-[150px] rounded px-4 py-2 ${border} ${color}`}>
			<AcademicCapIcon
				style={{
					position: "absolute",
					top: "4px",
					right: "4px",
					width: "10px",
					height: "10px"
				}}
			/>
			<div>{data.label}</div>

			<NodeHandles />
		</div>
	);
}

function LearningUnitNode({ data }: NodeProps<LearningUnitNodeType>) {
	return (
		<div className="relative min-w-[150px] rounded border border-green-300 bg-green-50 px-4 py-2 text-green-800">
			<PlayCircleIcon
				style={{
					position: "absolute",
					top: "4px",
					right: "4px",
					width: "12px",
					height: "12px"
				}}
			/>

			<div>{data.label}</div>

			<NodeHandles />
		</div>
	);
}

function NodeHandles() {
	return (
		<>
			<Handle id="top-source" type="source" position={Position.Top} />
			<Handle id="right-source" type="source" position={Position.Right} />
			<Handle id="bottom-source" type="source" position={Position.Bottom} />
			<Handle id="left-source" type="source" position={Position.Left} />

			<Handle id="top-target" type="target" position={Position.Top} />
			<Handle id="right-target" type="target" position={Position.Right} />
			<Handle id="bottom-target" type="target" position={Position.Bottom} />
			<Handle id="left-target" type="target" position={Position.Left} />
		</>
	);
}
