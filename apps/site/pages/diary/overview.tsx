import React, { useState } from "react";
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
import { UniversalSearchBar } from "../../../../libs/ui/layouts/src/lib/search-bar";

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
	const [searchQuarry, setSearchQuarry] = useState<string>("");

	if (!learningDiaryEntries) {
		return <p>No Learning Diary Entries found</p>;
	}

	return (
		<div className="flex w-full justify-center">
			<div className="w-3/5">
				<div className="py-2">
					<UniversalSearchBar
						searchQuery={searchQuarry}
						setSearchQuery={setSearchQuarry}
						placeHolder={"Lerntagebucheinträge durchsuchen..."}
					/>
				</div>
				<div className="py-2">
					<SortedTable
						learningDiaryEntries={learningDiaryEntries}
						searchQuarry={searchQuarry}
					/>
				</div>
			</div>
		</div>
	);
}

function SortedTable({
	learningDiaryEntries,
	searchQuarry
}: {
	learningDiaryEntries: LearningDiaryEntriesOverview[];
	searchQuarry: string;
}) {
	const [sortedColumn, setSortedColumn] = useState<{ key: string; descendingOrder: boolean }>({
		key: "number",
		descendingOrder: true
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
					sortingFunction: (a, b) => {
						if (a.learningLocation && b.learningLocation) {
							return a.learningLocation.name.localeCompare(b.learningLocation.name);
						} else {
							return 0;
						}
					},
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
							.map(evaluation => evaluation.learningTechnique.learningStrategie.name)
							.join(", ");
						const strategieB = b.learningTechniqueEvaluation
							.map(evaluation => evaluation.learningTechnique.learningStrategie.name)
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
			],
			[
				"scope",
				{
					key: "scope",
					label: "Umfang",
					sortingFunction: (a, b) => a.scope - b.scope,
					isDisplayed: false
				}
			]
		])
	);

	function getFilterFunction(
		learningDiaryEntry: LearningDiaryEntriesOverview,
		query: string
	): boolean {
		if (query === "") {
			return true;
		}

		const lowercasedQuery = query.toLowerCase();
		const { title, slug, authors } = learningDiaryEntry.course;
		const authorNames = authors.map(author => author.displayName.toLowerCase());
		const evaluations = learningDiaryEntry.learningTechniqueEvaluation;

		const techniqueNames = evaluations.map(evaluation =>
			evaluation.learningTechnique.name.toLowerCase()
		);
		const strategieNames = evaluations.map(evaluation =>
			evaluation.learningTechnique.name.toLowerCase()
		);

		return (
			title.toLowerCase().includes(lowercasedQuery) ||
			slug.toLowerCase().includes(lowercasedQuery) ||
			authorNames.some(name => name.includes(lowercasedQuery)) ||
			learningDiaryEntry.number.toString().toLowerCase().includes(lowercasedQuery) ||
			learningDiaryEntry.date.toLowerCase().includes(lowercasedQuery) ||
			learningDiaryEntry.start.toLowerCase().includes(lowercasedQuery) ||
			learningDiaryEntry.end.toLowerCase().includes(lowercasedQuery) ||
			(learningDiaryEntry.learningLocation?.name.toLowerCase().includes(lowercasedQuery) ??
				false) ||
			learningDiaryEntry.scope.toString().toLowerCase().includes(lowercasedQuery) ||
			techniqueNames.some(techniqueName => techniqueName.includes(lowercasedQuery)) ||
			strategieNames.some(strategieName => strategieName.includes(lowercasedQuery)) ||
			formatMillisecondToString(learningDiaryEntry.duration)
				.toLowerCase()
				.includes(lowercasedQuery)
		);
	}

	function getSortingFunction(): Column["sortingFunction"] {
		let sortingFunction = columns.get(sortedColumn.key)?.sortingFunction;
		sortingFunction = sortingFunction || columns.values().next().value.sortingFunction;

		if (sortedColumn.descendingOrder) {
			return (a, b) => {
				if (sortingFunction) {
					return -sortingFunction(a, b);
				}
				return 0;
			};
		} else {
			return (a, b) => {
				if (sortingFunction) {
					return sortingFunction(a, b);
				}
				return 0;
			};
		}
	}

	return (
		<div>
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
												descendingOrder:
													sortedColumn.key === column.key
														? !sortedColumn.descendingOrder
														: true
											})
										}
									>
										<div className="">
											<span>{column.label}</span>
											{sortedColumn && sortedColumn.key === column.key ? (
												<span className="">
													{sortedColumn.descendingOrder ? " ▼" : " ▲"}
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
						{learningDiaryEntries
							.slice()
							.filter(entry => getFilterFunction(entry, searchQuarry))
							.sort(getSortingFunction())
							.map(learningDiaryEntry => (
								<tr key={learningDiaryEntry.id}>
									{[...columns.values()]
										.filter(column => column.isDisplayed)
										.map(column => (
											<TableDataColumn key={column.key}>
												{column.key === "number" &&
													learningDiaryEntry.number}

												{column.key === "course" && (
													<Link
														href={`/courses/${learningDiaryEntry.course.slug}/`}
														className="block"
													>
														<div>
															<span className="flex items-center justify-center text-gray-800 hover:text-secondary">
																<span className="truncate">
																	{
																		learningDiaryEntry.course
																			.title
																	}
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
													learningDiaryEntry.learningLocation?.name}

												{column.key === "learningStrategie" &&
													learningDiaryEntry.learningTechniqueEvaluation
														.map(
															evaluation =>
																evaluation.learningTechnique
																	.learningStrategie.name
														)
														.filter(
															(value, index, self) =>
																self.indexOf(value) === index
														)
														.join(", ")}

												{column.key === "learningTechnique" &&
													learningDiaryEntry.learningTechniqueEvaluation
														.map(
															evaluation =>
																evaluation.learningTechnique.name
														)
														.join(", ")}

												{column.key === "scope" && learningDiaryEntry.scope}
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
