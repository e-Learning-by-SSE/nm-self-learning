import type { inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { skipToken } from "@tanstack/react-query";
import { LoadingBox } from "@self-learning/ui/common";
import { useJob } from "./use-job";
import { Warning } from "./warning";
import { Graph } from "./course-graph";

type GraphRawInput = inferProcedureInput<AppRouter["course"]["getGraphContent"]>;

export function PathAnalysis({
	courseId,
	courseGoalIds
}: {
	courseId: string | null;
	courseGoalIds: readonly string[];
}) {
	const job = useJob(trpc.course.createCourseGraphJob, courseId ? { courseId } : undefined);

	return (
		<div className="flex w-full flex-col gap-4">
			<Warning title="noCoursePathTitle" description="noCoursePathDescription" />
			{!job.isError &&
				(job.isPending ? (
					<LoadingBox />
				) : (
					<GraphAnalysis status={job.data?.result} courseGoalIds={courseGoalIds} />
				))}
		</div>
	);
}

function GraphAnalysis({
	status,
	courseGoalIds
}: {
	status?: string | null;
	courseGoalIds: readonly string[];
}) {
	const graphRawData = status != null ? (JSON.parse(status) as GraphRawInput) : skipToken;

	const { data: graphData, isLoading: isStatusLoading } =
		trpc.course.getGraphContent.useQuery(graphRawData);

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
