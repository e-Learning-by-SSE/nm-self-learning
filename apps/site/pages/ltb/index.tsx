import React, { useState } from "react";
import Link from "next/link";
import {
	TableDropdownMenu,
	findKeyByValue,
	TableColumn,
	TableDataColumn
} from "@self-learning/ui/common";
import { formatTimeIntervalToString } from "@self-learning/util/common";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/outline";
import { UniversalSearchBar } from "@self-learning/ui/layouts";
import { getLearningDiaryEntriesOverview, LearningDiaryEntriesOverview } from "@self-learning/api";

//TODO - der link vom kurs + link vom eintrag

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

	const [columns, setColumns] = useState<Map<string, TableColumn>>(
		new Map([
			[
				"number",
				{
					label: "Nr.",
					sortingFunction: (a, b) => a.number - b.number,
					isDisplayed: true
				}
			],
			[
				"course",
				{
					label: "Kurs",
					sortingFunction: (a, b) => a.course.title.localeCompare(b.course.title),
					isDisplayed: true
				}
			],
			[
				"date",
				{
					label: "Datum",
					sortingFunction: (a, b) => a.date.localeCompare(b.date),
					isDisplayed: true
				}
			],
			[
				"duration",
				{
					label: "Dauer",
					sortingFunction: (a, b) => a.duration - b.duration,
					isDisplayed: true
				}
			],
			[
				"learningLocation",
				{
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
			strategieNames.some(strategyName => strategyName.includes(lowercasedQuery)) ||
			formatTimeIntervalToString(learningDiaryEntry.duration)
				.toLowerCase()
				.includes(lowercasedQuery)
		);
	}

	function getSortingFunction(): TableColumn["sortingFunction"] {
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
								.map(column => {
									const columnKey = findKeyByValue(columns, column);

									return (
										<th
											className="cursor-pointer border-y border-light-border py-4 px-8 text-start text-sm font-semibold"
											key={columnKey}
											onClick={() =>
												setSortedColumn({
													key: columnKey,
													descendingOrder:
														sortedColumn.key === columnKey
															? !sortedColumn.descendingOrder
															: true
												})
											}
										>
											<div className="">
												<span>{column.label}</span>
												{sortedColumn && sortedColumn.key === columnKey ? (
													<span className="">
														{sortedColumn.descendingOrder ? " ▼" : " ▲"}
													</span>
												) : (
													<span className="invisible"> ▲</span>
												)}
											</div>
										</th>
									);
								})}

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
									<TableDropdownMenu
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
										.map(column => {
											const columnKey = findKeyByValue(columns, column);

											return (
												<TableDataColumn key={column.label}>
													{columnKey === "number" &&
														learningDiaryEntry.number}

													{columnKey === "course" && (
														<Link
															href={`/courses/${learningDiaryEntry.course.slug}/`}
															className="block"
														>
															<div>
																<span className="flex items-center justify-center text-gray-800 hover:text-secondary">
																	<span className="truncate">
																		{
																			learningDiaryEntry
																				.course.title
																		}
																	</span>
																</span>
															</div>
														</Link>
													)}

													{columnKey === "date" &&
														learningDiaryEntry.date}

													{columnKey === "duration" &&
														formatTimeIntervalToString(
															learningDiaryEntry.duration
														)}

													{columnKey === "learningLocation" &&
														learningDiaryEntry.learningLocation?.name}

													{columnKey === "learningStrategie" &&
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

													{columnKey === "learningTechnique" &&
														learningDiaryEntry.learningTechniqueEvaluation
															.map(
																evaluation =>
																	evaluation.learningTechnique
																		.name
															)
															.join(", ")}

													{columnKey === "scope" &&
														learningDiaryEntry.scope}
												</TableDataColumn>
											);
										})}
								</tr>
							))}
					</tbody>
				</table>
			</div>
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
