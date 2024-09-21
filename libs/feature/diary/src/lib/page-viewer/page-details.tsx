import React, { useState } from "react";
import { LearningDiaryPageDetail } from "../access-learning-diary";
import {
	duplicateRemover,
	formatDateToGermanDate,
	formatTimeIntervalToString,
	isTruthy
} from "@self-learning/util/common";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import Link from "next/link";
import { trpc } from "@self-learning/api-client";
import { hintsUsed, isEventType, quizAttempts } from "libs/feature/analysis/src/lib/metrics";

export function DiaryLearnedContent({ page }: { page: LearningDiaryPageDetail }) {
	const [showMore, setShowMore] = useState(false);
	return (
		<div className="flex w-full flex-col space-y-2 p-4">
			<div className="flex w-full flex-wrap ">
				<DetailRow
					label="Datum"
					value={formatDateToGermanDate(page.createdAt)}
					className="w-full sm:className-1/6"
				/>
				<DetailRow
					label="Kurs"
					value={page.course.title}
					className="w-full sm:className-2/6"
				/>
				<DetailRow
					label="Dauer"
					value={formatTimeIntervalToString(page.totalDurationLearnedMs)}
					className="w-full sm:className-2/6"
				/>
				<DetailRow
					label="Lerneinheiten"
					value={`${page.lessonsLearned.length}`}
					className="w-full sm:className-1/6"
				/>
			</div>
			{showMore && <MoreDetails page={page} />}
			<button
				onClick={() => setShowMore(!showMore)}
				className="self-start px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-700"
			>
				{showMore ? "Weniger anzeigen" : "Mehr anzeigen"}
			</button>
		</div>
	);
}

function DetailRow({
	label,
	value,
	className
}: {
	label: string;
	value: string;
	className: string;
}) {
	return (
		<div className={`flex flex-shrink-0 flex-grow className-${className} flex-col`}>
			<span className="font-semibold">{label}:</span>
			<span>{value}</span>
		</div>
	);
}

type LessonDetailTableProps = {
	title: string;
	duration: number;
	tasks: { id: string }[]; // id for the case, that we want to link to the task in the future
	tasksSolved: number;
	hintsUsed: number;
	retryRatio: number;
};

export function useLessonDetails({ page }: { page: LearningDiaryPageDetail }) {
	const learnedLessons = page.lessonsLearned;
	const firstLessonLearned = learnedLessons.length > 0 ? learnedLessons[0] : null;
	const lastLessonLearned = learnedLessons.length > 0 ? learnedLessons[-1] : null;

	const { data, isLoading } = trpc.events.findMany.useQuery({
		courseId: page.course.courseId,
		start: page.createdAt,
		resourceId: learnedLessons.map(({ lesson }) => lesson.lessonId),
		end: lastLessonLearned?.createdAt
	});

	if (!data || isLoading) {
		return {
			earliestDate: firstLessonLearned?.createdAt,
			latestDate: lastLessonLearned?.createdAt,
			lessonDetails: []
		};
	}

	const aggregation = learnedLessons.map(lesson => {
		const lessonEvents = data.filter(event => event.resourceId === lesson.lesson.lessonId);
		console.log(lessonEvents);
		const { successful, failed } = lessonEvents
			.filter(e => isEventType(e, "LESSON_QUIZ_SUBMISSION"))
			.reduce(quizAttempts, { successful: 0, failed: 0 });

		const nHints = lessonEvents
			.filter(e => isEventType(e, "LESSON_QUIZ_SUBMISSION"))
			.reduce(hintsUsed, 0);

		// create a list of unique taskIds for this specific lessons
		const taskIds: { id: string }[] = lessonEvents
			.filter(e => isEventType(e, "LESSON_QUIZ_SUBMISSION"))
			.map(e => e.payload.questionId)
			.filter(isTruthy)
			.map(e => ({ id: e }))
			.filter(duplicateRemover());

		return {
			title: lesson.lesson.title,
			duration: 0,
			tasks: taskIds,
			tasksSolved: successful,
			hintsUsed: nHints,
			retryRatio: failed / (successful + failed)
		} satisfies LessonDetailTableProps;
	});

	return {
		earliestDate: firstLessonLearned?.createdAt,
		latestDate: lastLessonLearned?.createdAt,
		lessonDetails: aggregation
	};
}

function MoreDetails({ page }: { page: LearningDiaryPageDetail }) {
	const { latestDate, lessonDetails } = useLessonDetails({ page });

	const latestDateString = latestDate ? formatDateToGermanDate(latestDate) : "unbekannt";
	return (
		<div className="flex w-full flex-col space-y-4 mt-4">
			<DetailRow
				label="Datum der letzten Bearbeitung"
				value={latestDateString}
				className="1/6"
			/>

			<Table
				head={
					<>
						<TableHeaderColumn>Titel</TableHeaderColumn>
						<TableHeaderColumn>Dauer</TableHeaderColumn>
						<TableHeaderColumn>Aufgaben gelöst</TableHeaderColumn>
						<TableHeaderColumn>Wiederholungsrate</TableHeaderColumn>
						<TableHeaderColumn>Hinweise verwendet</TableHeaderColumn>
					</>
				}
			>
				{lessonDetails.map((lessonDetail, index) => (
					<tr key={index}>
						<TableDataColumn>
							<Link href={""} className="hover:text-blue-300">
								{lessonDetail.title}
							</Link>
						</TableDataColumn>
						<TableDataColumn>
							{formatTimeIntervalToString(lessonDetail.duration)}
						</TableDataColumn>
						<TableDataColumn>
							{lessonDetail.tasksSolved}/{lessonDetail.tasks.length}
						</TableDataColumn>
						<TableDataColumn> {lessonDetail.retryRatio}</TableDataColumn>
						<TableDataColumn>{lessonDetail.hintsUsed}</TableDataColumn>
					</tr>
				))}
			</Table>
		</div>
	);
}
