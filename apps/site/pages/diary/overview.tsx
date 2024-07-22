import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TableDataColumn } from "@self-learning/ui/common";
import { formatMillisecondToString } from "@self-learning/util/common";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/outline";
import {
	getLearningDiaryEntriesOverview,
	LearningDiaryEntriesOverview
} from "../../../../libs/data-access/api/src/lib/trpc/routers/learningDiaryEntry.router";

interface Column {
	key: string;
	label: string;
	sortingFunction: (a: LearningDiaryEntriesOverview, b: LearningDiaryEntriesOverview) => number;
	isDisplayed: boolean;
}

export function LearningDiaryOverview({
	learningDiaryEntries
}: {
	learningDiaryEntries: LearningDiaryEntriesOverview[] | null;
}) {
	if (!learningDiaryEntries) {
		return <p>No Learning Diary Entries found</p>;
	}

	return (
		<div className="flex justify-center">
			<SortedTable learningDiaryEntries={learningDiaryEntries}></SortedTable>
		</div>
	);
}

function SortedTable({
	learningDiaryEntries
}: {
	learningDiaryEntries: LearningDiaryEntriesOverview[];
}) {
	const [sortedColumn, setSortedColumn] = useState<{ key: string; desc: boolean }>({
		key: "number",
		desc: true
	});

	const [chevronMenu, setChevronMenu] = useState<boolean>(false);
	const [columns, setColumns] = useState<Map<string, Column>>(
		new Map([
			[
				"number",
				{
					key: "number",
					label: "Nr.",
					sortingFunction: (a, b) => a.number - b.number,
					isDisplayed: true
				}
			],
			[
				"course",
				{
					key: "course",
					label: "Kurs",
					sortingFunction: (a, b) => a.course.title.localeCompare(b.course.title),
					isDisplayed: true
				}
			],
			[
				"date",
				{
					key: "date",
					label: "Datum",
					sortingFunction: (a, b) => a.date.localeCompare(b.date),
					isDisplayed: true
				}
			],
			[
				"duration",
				{
					key: "duration",
					label: "Dauer",
					sortingFunction: (a, b) => a.duration - b.duration,
					isDisplayed: true
				}
			],
			[
				"learningLocation",
				{
					key: "learningLocation",
					label: "Lernort",
					sortingFunction: (a, b) =>
						a.learningLocation.name.localeCompare(b.learningLocation.name),
					isDisplayed: false
				}
			],
			[
				"learningStrategie",
				{
					key: "learningStrategie",
					label: "Lernstrategie",
					sortingFunction: (a, b) => {
						const strategieA = a.learningTechniqueEvaluation
							.map(evaluation => evaluation.learningStrategie.name)
							.join(", ");
						const strategieB = b.learningTechniqueEvaluation
							.map(evaluation => evaluation.learningStrategie.name)
							.join(", ");
						return strategieA.localeCompare(strategieB);
					},
					isDisplayed: false
				}
			],
			[
				"learningTechnique",
				{
					key: "learningTechnique",
					label: "Lerntechnik",
					sortingFunction: (a, b) => {
						const techniquesA = a.learningTechniqueEvaluation
							.map(evaluation => evaluation.learningTechnique.name)
							.join(", ");
						const techniquesB = b.learningTechniqueEvaluation
							.map(evaluation => evaluation.learningTechnique.name)
							.join(", ");

						return techniquesA.localeCompare(techniquesB);
					},
					isDisplayed: false
				}
			]
		])
	);

	function sortDiaryEntries() {
		const column = columns.get(sortedColumn.key);

		if (!column) {
			return;
		}

		learningDiaryEntries.sort(column.sortingFunction);
		if (!sortedColumn.desc) {
			learningDiaryEntries.reverse();
		}
	}

	useEffect(() => {
		sortDiaryEntries();
	}, [sortedColumn, columns, learningDiaryEntries]);

	sortDiaryEntries();

	return (
		<div className={"p-5"}>
			<div className="overflow-y-auto rounded-lg border-x border-b border-light-border bg-white">
				<table className="w-full table-auto">
					<thead className="top-0 z-10 rounded-lg border-y border-light-border bg-gray-100">
						<tr>
							{[...columns.values()]
								.filter(column => column.isDisplayed)
								.map(column => (
									<th
										className="cursor-pointer border-y border-light-border py-4 px-8 text-start text-sm font-semibold"
										key={column.key}
										onClick={() =>
											setSortedColumn({
												key: column.key,
												desc:
													sortedColumn.key === column.key
														? !sortedColumn.desc
														: true
											})
										}
									>
										<div className="">
											<span>{column.label}</span>
											{sortedColumn && sortedColumn.key === column.key ? (
												<span className="">
													{sortedColumn.desc ? " ▼" : " ▲"}
												</span>
											) : (
												<span className="invisible"> ▲</span>
											)}
										</div>
									</th>
								))}

							<th
								className="cursor-pointer border-y border-light-border py-4 px-8 text-start text-sm font-semibold"
								key="chevron"
								onClick={() => {
									setChevronMenu(true);
								}}
								onMouseLeave={() => {
									setChevronMenu(false);
								}}
							>
								<div className="flex justify-between">
									<ChevronDoubleDownIcon className="h-5 w-5 stroke-current stroke-2 text-black" />
								</div>
								{chevronMenu && (
									<DropdownMenu
										columns={columns}
										setColumns={setColumns}
										setChevronMenu={setChevronMenu}
									/>
								)}
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-light-border">
						{learningDiaryEntries.map(learningDiaryEntry => (
							<tr key={learningDiaryEntry.id}>
								{[...columns.values()]
									.filter(column => column.isDisplayed)
									.map(column => (
										<TableDataColumn key={column.key}>
											{column.key === "number" && learningDiaryEntry.number}

											{column.key === "course" && (
												<Link
													href={`/courses/${learningDiaryEntry.course.slug}/`}
													className="block"
												>
													<div>
														<span className="flex items-center justify-center text-gray-800 hover:text-secondary">
															<span className="truncate">
																{learningDiaryEntry.course.title}
															</span>
														</span>
													</div>
												</Link>
											)}

											{column.key === "date" && learningDiaryEntry.date}

											{column.key === "duration" &&
												formatMillisecondToString(
													learningDiaryEntry.duration
												)}

											{column.key === "learningLocation" &&
												learningDiaryEntry.learningLocation.name}

											{column.key === "learningStrategie" &&
												learningDiaryEntry.learningTechniqueEvaluation
													.map(
														evaluation =>
															evaluation.learningStrategie.name
													)
													.join(", ")}

											{column.key === "learningTechnique" &&
												learningDiaryEntry.learningTechniqueEvaluation
													.map(
														evaluation =>
															evaluation.learningTechnique.name
													)
													.join(", ")}
										</TableDataColumn>
									))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function DropdownMenu({
	columns,
	setColumns,
	setChevronMenu
}: {
	columns: Map<string, Column>;
	setColumns: React.Dispatch<React.SetStateAction<Map<string, Column>>>;
	setChevronMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const handleCheckboxChange = (key: string) => {
		setColumns(prevColumns => {
			const newColumns = new Map(prevColumns);
			const column = newColumns.get(key);
			if (column) {
				newColumns.set(key, { ...column, isDisplayed: !column.isDisplayed });
			}
			return newColumns;
		});
	};

	return (
		<div
			className="absolute bg-white p-4 shadow-md"
			onMouseLeave={() => {
				setChevronMenu(false);
			}}
		>
			{[...columns.values()].map(column => (
				<div key={column.key} className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={column.isDisplayed}
						onChange={() => handleCheckboxChange(column.key)}
						className="form-checkbox rounded text-secondary"
					/>
					<label className="text-gray-700">{column.label}</label>
				</div>
			))}
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async context => {
	const session = await getSession(context);

	if (!session || !session.user) {
		return {
			redirect: {
				destination: "/api/auth/signin",
				permanent: false
			}
		};
	}

	try {
		return {
			props: {
				learningDiaryEntries: await getLearningDiaryEntriesOverview({
					username: session.user.name
				})
			}
		};
	} catch (error) {
		console.error("Error fetching Learning Diary Entries:", error);
		return {
			props: {
				learningDiaryEntries: null
			}
		};
	}
};

export default LearningDiaryOverview;
