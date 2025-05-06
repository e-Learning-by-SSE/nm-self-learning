"use client";
import React, { useState } from "react";
import { LearningDiaryPageDetail } from "../access-learning-diary";
import {
	duplicateRemover,
	formatDateStringFull,
	formatTimeIntervalToString,
	isTruthy
} from "@self-learning/util/common";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import Link from "next/link";
import { trpc } from "@self-learning/api-client";
import { hintsUsed, isEventType, quizAttempts } from "libs/feature/analysis/src/lib/metrics";

export function DiaryLearnedContent({
	page,
	endDate
}: {
	page: LearningDiaryPageDetail;
	endDate: Date;
}) {
	const [showMore, setShowMore] = useState(false);
	return (
		<div className="flex w-full flex-col space-y-2 p-4">
			<div className="flex w-full flex-wrap ">
				<DetailRow
					label="Datum"
					value={formatDateStringFull(page.createdAt)}
					className="w-full sm:className-1/6"
				/>
				<DetailRow
					label="Kurs"
					value={page.course.title}
					className="w-full sm:className-2/6"
				/>
				<DetailRow
					label="Dauer"
					value={formatTimeIntervalToString(page.totalDurationLearnedMs ?? 0)}
					className="w-full sm:className-2/6"
				/>
				<DetailRow
					label="Lerneinheiten"
					value={`${page.lessonsLearned.length}`}
					className="w-full sm:className-1/6"
				/>
			</div>
			{showMore && <MoreDetails page={page} endDate={endDate} />}
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
	slug: string;
	duration: number;
	tasks: { id: string }[]; // id for the case, that we want to link to the task in the future
	tasksSolved: number;
	hintsUsed: number;
	successRate: number;
};

export function useLessonDetails({
	page,
	endDate
}: {
	page: LearningDiaryPageDetail;
	endDate: Date;
}) {
	const learnedLessons = page.lessonsLearned;
	const firstLessonLearned = learnedLessons.length > 0 ? learnedLessons[0] : null;
	let latestDate =
		learnedLessons.length > 0 ? learnedLessons[learnedLessons.length - 1].createdAt : null;

	const { data, isLoading } = trpc.events.findMany.useQuery({
		start: page.createdAt,
		resourceId: learnedLessons.map(({ lesson }) => lesson.lessonId),
		end: endDate
	});

	if (!data || isLoading) {
		return {
			earliestDate: firstLessonLearned?.createdAt,
			latestDate: endDate,
			lessonDetails: []
		};
	}

	if (data.length > 0) {
		latestDate = data[data.length - 1].createdAt;
	}

	const aggregation = learnedLessons.map(lesson => {
		const lessonEvents = data.filter(event => event.resourceId === lesson.lesson.lessonId);
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

		// Duration last - first; relies on sorted events
		const duration =
			lessonEvents.length > 0
				? lessonEvents[lessonEvents.length - 1].createdAt.getTime() -
					lessonEvents[0].createdAt.getTime()
				: 0;

		return {
			title: lesson.lesson.title,
			slug: `${page.course.slug}/${lesson.lesson.slug}`,
			duration: duration,
			tasks: taskIds,
			tasksSolved: successful,
			hintsUsed: nHints,
			successRate: successful !== 0 ? successful / (successful + failed) : 0
		} satisfies LessonDetailTableProps;
	});

	return {
		earliestDate: firstLessonLearned?.createdAt,
		latestDate: latestDate,
		lessonDetails: aggregation
	};
}

function toPercentage(value: number) {
	let percentage = (value * 100).toFixed(2);
	// Remove trailing zeros
	percentage = percentage.replace(/\.?0+$/, "");
	// German formatting (replace . with ,)
	return percentage.replace(".", ",") + " %";
}

function MoreDetails({ page, endDate }: { page: LearningDiaryPageDetail; endDate: Date }) {
	const { lessonDetails } = useLessonDetails({ page, endDate });

	return (
		<div className="flex w-full flex-col space-y-4 mt-4">
			<div className="hidden xl:block">
				<Table
					head={
						<>
							<TableHeaderColumn>Titel</TableHeaderColumn>
							<TableHeaderColumn>Dauer</TableHeaderColumn>
							<TableHeaderColumn>Aufgaben gelöst</TableHeaderColumn>
							<TableHeaderColumn>Erfolgsrate</TableHeaderColumn>
							<TableHeaderColumn>Hinweise verwendet</TableHeaderColumn>
						</>
					}
				>
					{lessonDetails.map((lessonDetail, index) => (
						<tr key={index}>
							<TableDataColumn>
								<Link
									href={`/courses/${lessonDetail.slug}`}
									className="hover:text-blue-300"
								>
									{lessonDetail.title}
								</Link>
							</TableDataColumn>
							<TableDataColumn>
								{formatTimeIntervalToString(lessonDetail.duration)}
							</TableDataColumn>
							<TableDataColumn>
								{lessonDetail.tasksSolved}/{lessonDetail.tasks.length}
							</TableDataColumn>
							<TableDataColumn>
								{" "}
								{toPercentage(lessonDetail.successRate)}
							</TableDataColumn>
							<TableDataColumn>{lessonDetail.hintsUsed}</TableDataColumn>
						</tr>
					))}
				</Table>
			</div>
			<div className="block xl:hidden">
				{lessonDetails.map((lessonDetail, index) => (
					<div key={index} className="border rounded-lg p-4 mb-4">
						<div className="mb-2">
							<strong>Titel:</strong> {lessonDetail.title}
						</div>
						<div className="mb-2">
							<strong>Dauer:</strong>{" "}
							{formatTimeIntervalToString(lessonDetail.duration)}
						</div>
						<div className="mb-2">
							<strong>Aufgaben gelöst:</strong> {lessonDetail.tasksSolved}/
							{lessonDetail.tasks.length}
						</div>
						<div className="mb-2">
							<strong>Erfolgsrate:</strong> {toPercentage(lessonDetail.successRate)}
						</div>
						<div className="mb-2">
							<strong>Hinweise verwendet:</strong> {lessonDetail.hintsUsed}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
