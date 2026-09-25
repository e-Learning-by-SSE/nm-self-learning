import * as ToC from "@self-learning/ui/course";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@self-learning/api";
import { useTranslation } from "react-i18next";
import { trpc } from "@self-learning/api-client";
import { useEffect } from "react";
import { LoadingBox } from "@self-learning/ui/common";

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
	// TODO SE: Use ReactFlow to visualize graph
	return <div>{status}</div>;
}
