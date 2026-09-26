import { AcademicCapIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import {
	Handle,
	Background,
	Controls,
	ReactFlow,
	Position,
	type NodeProps,
	NodeMouseHandler
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { inferProcedureOutput, inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { skipToken } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
	// Mutation definition
	const { mutate: createGraph, data: jobId } = trpc.course.createCourseGraphJob.useMutation();

	// Submits the job
	useEffect(() => {
		if (!course.courseId) return;

		createGraph({
			courseId: course.courseId
		});
	}, [course.courseId, createGraph]);

	// Fetch job status
	const { data: status, isLoading: isStatusLoading } = trpc.jobQueue.getStatus.useQuery(
		{
			jobId: jobId ?? ""
		},
		{
			enabled: !!jobId,
			refetchInterval: query => (query.state.data?.status === "FINISHED" ? false : 1000)
		}
	);

	return (
		<>
			<Warning title="noCoursePathTitle" description="noCoursePathDescription" />
			{isStatusLoading ? <LoadingBox /> : <GraphAnalysis status={status?.result} />}
		</>
	);
}

/**
 * Graph drawing component
 * @param param0
 * @returns
 */
function GraphAnalysis({ status }: { status?: string | null }) {
	const [selectedElement, setSelectedElement] = useState<
		LearningUnitNodeData | SkillNodeData | null
	>(null);
	const [dialogPosition, setDialogPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	let graphRawData: GraphRawInput | undefined;
	if (status != null) {
		graphRawData = JSON.parse(status) as {
			nodes: string[];
			edges: { from: string; to: string }[];
			learningUnits: string[];
			skills: string[];
		};
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

		return;
	};

	const onPaneClick = () => {
		setSelectedElement(null);
		setDialogPosition(null);
	};

	const { nodes, edges } = createGraph(graphData);

	return (
		<div className="h-[500px] w-full">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={{
					skill: SkillNode,
					learningUnit: LearningUnitNode
				}}
				fitView
				proOptions={{ hideAttribution: true }}
				onNodeClick={onNodeClick}
				onPaneClick={onPaneClick}
			>
				<Background />
				<Controls />
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
	function isLearningUnit(
		element: LearningUnitNodeData | SkillNodeData
	): element is LearningUnitNodeData {
		return "provides" in element;
	}
	const sections = isLearningUnit(selectedElement)
		? [
				{
					title: "Lernziel(e):",
					items: selectedElement.provides,
					box: "rounded-lg border bg-green-50 border-green-300"
				},
				{
					title: "Voraussetzung(en):",
					items: selectedElement.requires,
					box: "rounded-lg border bg-red-50 border-red-300"
				}
			]
		: [
				{
					title: "Wird gelehrt in:",
					items: selectedElement.taughtBy,
					box: "rounded-lg border bg-green-50 border-green-300"
				},
				{
					title: "Wird benötigt in:",
					items: selectedElement.requiredBy,
					box: "rounded-lg border bg-red-50 border-red-300"
				}
			];

	return (
		<div
			className="fixed z-50 w-[320px] -translate-x-1/2 -translate-y-full rounded-lg border bg-gray-100 p-4 shadow-xl"
			style={{
				left: dialogPosition.x,
				top: dialogPosition.y - 8
			}}
			onClick={event => event.stopPropagation()}
		>
			<h2 className="mb-3 font-semibold">{selectedElement.label}</h2>

			{sections.map((section, index) => (
				<div
					key={section.title}
					className={index < sections.length - 1 ? "mb-3" : undefined}
				>
					<div className={`${section.box}`}>
						<h3>{section.title}</h3>

						<ul className="list-disc pl-5">
							{section.items.map(item => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				</div>
			))}
		</div>
	);
}

function SkillNode({ data }: NodeProps<SkillNodeType>) {
	return (
		<div className="relative min-w-[150px] rounded border border-blue-300 bg-blue-50 px-4 py-2 text-blue-800">
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
