import React, { useState } from "react";
import { LearningDiaryPageDetail } from "../access-learning-diary";
import { formatDateToGermanDate, formatTimeIntervalToString } from "@self-learning/util/common";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import Link from "next/link";

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

export function DetailRow({
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

export function MoreDetails({ page }: { page: LearningDiaryPageDetail }) {
	let latestDate = "/";
	if (page.lessonsLearned.length > 0) {
		latestDate = formatDateToGermanDate(
			page.lessonsLearned[page.lessonsLearned.length - 1].createdAt
		);
	}

	return (
		<div className="flex w-full flex-col space-y-4 mt-4">
			<DetailRow label="Datum der letzten Bearbeitung" value={latestDate} className="1/6" />

			<Table
				head={
					<>
						<TableHeaderColumn>Titel</TableHeaderColumn>
						<TableHeaderColumn>Dauer</TableHeaderColumn>
						<TableHeaderColumn>Aufgaben</TableHeaderColumn>
						<TableHeaderColumn>Richtige Lösungen</TableHeaderColumn>
						<TableHeaderColumn>Falsche Lösungen</TableHeaderColumn>
						<TableHeaderColumn>Hinweise verwendet</TableHeaderColumn>
					</>
				}
			>
				{dummyPage.lessonsLearned.map((unit, index) => (
					<tr key={index}>
						<Link href={""}>
							<TableDataColumn>{unit.title}</TableDataColumn>
						</Link>
						<TableDataColumn>
							{formatTimeIntervalToString(unit.durationMs)}
						</TableDataColumn>
						<TableDataColumn>{unit.tasks.length}</TableDataColumn>
						<TableDataColumn>{unit.correctSolutions}</TableDataColumn>
						<TableDataColumn>{unit.incorrectSolutions}</TableDataColumn>
						<TableDataColumn>{unit.hintsUsed}</TableDataColumn>
					</tr>
				))}
			</Table>
		</div>
	);
}

const dummyPage = {
	lessonsLearned: [
		{
			title: "Einführung in React",
			durationMs: 3600000, // 1 hour
			tasks: [{}, {}, {}], // 3 tasks
			correctSolutions: 2,
			incorrectSolutions: 1,
			hintsUsed: 1
		},
		{
			title: "Fortgeschrittene React Konzepte",
			durationMs: 5400000, // 1.5 hours
			tasks: [{}, {}, {}, {}], // 4 tasks
			correctSolutions: 3,
			incorrectSolutions: 1,
			hintsUsed: 2
		}
	]
};
