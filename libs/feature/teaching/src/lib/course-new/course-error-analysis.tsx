import { AcademicCapIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import {
	Handle,
	Background,
	Controls,
	ReactFlow,
	type Edge,
	Position,
	type Node,
	type NodeProps,
	NodeMouseHandler
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { inferProcedureOutput, inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@self-learning/api";
import { useTranslation } from "react-i18next";
import { trpc } from "@self-learning/api-client";
import { skipToken } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LoadingBox } from "@self-learning/ui/common";
type GraphRawInput = inferProcedureInput<AppRouter["course"]["getGraphContent"]>;

type CoursePreviewModel = inferProcedureOutput<AppRouter["course"]["getCourse"]>;

function Warning({ title, description }: { title: string; description: string }) {
	const { t } = useTranslation("kee");
	return (
		<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
			<h3 className="heading flex gap-4 text-2xl">
				<span className="text-secondary">{t(title)}</span>
			</h3>
			<span className="mt-4 text-light">{t(description)}</span>
		</div>
	);
}

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

	const learningUnitIds = new Set(graphData.learningUnits.map(lu => lu.lessonId));

	const edges: Edge[] = graphData.edges.map((edge, index) => {
		const leavesLearningUnit = learningUnitIds.has(edge.from);
		const entersLearningUnit = learningUnitIds.has(edge.to);

		const color = leavesLearningUnit
			? "#dc2626" // red
			: entersLearningUnit
				? "#16a34a" // green
				: "#64748b"; // otherwise gray

		return {
			id: `e-${index}`,
			source: edge.from,
			target: edge.to,
			style: {
				stroke: color,
				strokeWidth: 1
			}
			// markerEnd: {
			// 	type: MarkerType.Arrow,
			// 	color
			// }
		};
	});

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

	const nodeTypes = {
		skill: SkillNode,
		learningUnit: LearningUnitNode
	};
	return (
		<div className="h-[500px] w-full">
			<ReactFlow
				nodes={[...luNodes, ...skillNodes]}
				edges={edges}
				nodeTypes={nodeTypes}
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

function isLearningUnit(
	element: LearningUnitNodeData | SkillNodeData
): element is LearningUnitNodeData {
	return "provides" in element;
}

function DetailsDialog({
	selectedElement,
	dialogPosition
}: {
	selectedElement: LearningUnitNodeData | SkillNodeData;
	dialogPosition: { x: number; y: number };
}) {
	const sections = isLearningUnit(selectedElement)
		? [
				{
					title: "Lernziel(e):",
					items: selectedElement.provides,
					className: "text-green-700"
				},
				{
					title: "Voraussetzung(en):",
					items: selectedElement.requires,
					className: "text-red-700"
				}
			]
		: [
				{
					title: "Wird gelehrt in:",
					items: selectedElement.taughtBy,
					className: "text-green-700"
				},
				{
					title: "Wird benötigt in:",
					items: selectedElement.requiredBy,
					className: "text-red-700"
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
					<h3 className={`font-semibold ${section.className}`}>{section.title}</h3>

					<ul className="list-disc pl-5">
						{section.items.map(item => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}

type SkillNodeData = {
	label: string;
	taughtBy: string[];
	requiredBy: string[];
};

type SkillNodeType = Node<SkillNodeData, "skill">;

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

			<Handle type="source" position={Position.Top} />
			<Handle type="target" position={Position.Top} />
		</div>
	);
}

type LearningUnitNodeData = {
	label: string;
	provides: string[];
	requires: string[];
};

type LearningUnitNodeType = Node<LearningUnitNodeData, "learningUnit">;

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

			<Handle type="source" position={Position.Bottom} />
			<Handle type="target" position={Position.Bottom} />
		</div>
	);
}
