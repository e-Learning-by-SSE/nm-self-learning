import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { ProgressBar, Tab, Table, TableDataColumn, Tabs } from "@self-learning/ui/common";
import { UniversalSearchBar } from "@self-learning/ui/layouts";
import { EnrollmentDetails, getEnrollmentDetails } from "@self-learning/enrollment";
import { formatDateAgo } from "@self-learning/util/common";

export function CourseOverview({ enrollments }: { enrollments: EnrollmentDetails[] | null }) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [inProgress, setInProgress] = useState<EnrollmentDetails[]>([]);
	const [complete, setComplete] = useState<EnrollmentDetails[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const filterEnrollments = (
			enrollments: EnrollmentDetails[],
			searchQuery: string
		): EnrollmentDetails[] => {
			if (!searchQuery) return enrollments;

			const lowercasedQuery = searchQuery.toLowerCase();

			return enrollments.filter(enrollment => {
				const { title, slug, authors } = enrollment.course;
				const authorNames = authors.map(author => author.displayName.toLowerCase());

				return (
					title.toLowerCase().includes(lowercasedQuery) ||
					slug.toLowerCase().includes(lowercasedQuery) ||
					authorNames.some(name => name.includes(lowercasedQuery))
				);
			});
		};

		if (enrollments) {
			const filtered = filterEnrollments(enrollments, searchQuery);

			const inProgress = filtered.filter(
				enrollment => enrollment.completions.courseCompletion.completionPercentage < 100
			);
			const complete = filtered.filter(
				enrollment => enrollment.completions.courseCompletion.completionPercentage >= 100
			);

			setInProgress(inProgress);
			setComplete(complete);
		}
	}, [searchQuery, enrollments]);

	if (!enrollments) {
		return <p>No enrollments found</p>;
	}

	return (
		<div className="flex h-screen justify-center overflow-hidden">
			<div className="h-full w-full p-2 lg:w-4/5 lg:p-8">
				{selectedTab === 0 && (
					<TabContent
						selectedTab={selectedTab}
						setSelectedTab={setSelectedTab}
						enrollments={inProgress}
						notFoundMessage={
							searchQuery == ""
								? "Derzeit ist kein Kurs angefangen."
								: "Derzeit ist zu dieser Suchanfrage kein Kurs angefangen."
						}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
					/>
				)}
				{selectedTab === 1 && (
					<TabContent
						selectedTab={selectedTab}
						setSelectedTab={setSelectedTab}
						enrollments={complete}
						notFoundMessage={
							searchQuery == ""
								? "Derzeit ist kein Kurs abgeschlossen."
								: "Derzeit ist zu dieser Suchanfrage kein Kurs abgeschlossen."
						}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
					/>
				)}
			</div>
		</div>
	);
}

function TabContent({
	selectedTab,
	setSelectedTab,
	enrollments,
	notFoundMessage,
	searchQuery,
	setSearchQuery
}: {
	selectedTab: number;
	setSelectedTab: (v: number) => void;
	enrollments: EnrollmentDetails[];
	notFoundMessage: string;
	searchQuery: string;
	setSearchQuery: (v: string) => void;
}) {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b border-gray-300 pb-2">
				<div className="flex">
					<Tabs selectedIndex={selectedTab} onChange={setSelectedTab}>
						<Tab>In Bearbeitung</Tab>
						<Tab>Abgeschlossen</Tab>
					</Tabs>
				</div>
			</div>
			<div className="py-2">
				<UniversalSearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					placeHolder={"Kurse durchsuchen..."}
				/>
			</div>

			<div className="flex-1 overflow-y-auto">
				{enrollments && enrollments.length > 0 ? (
					<SortedTable enrollments={enrollments} />
				) : (
					<p className="py-4 text-center">{notFoundMessage}</p>
				)}
			</div>
		</div>
	);
}

function SortedTable({ enrollments }: { enrollments: EnrollmentDetails[] }) {
	const [sortedColumn, setSortedColumn] = useState<{
		key: string;
		descendingOrder: boolean;
	}>({
		key: "title",
		descendingOrder: true
	});

	type Column = {
		key: string;
		label: string;
		sortingFunction: (a, b) => number;
	};
	const columns: Column[] = [
		{
			key: "title",
			label: "Titel",
			sortingFunction: (a, b) => a.course.title.localeCompare(b.course.title)
		},
		{
			key: "author",
			label: "Autor",
			sortingFunction: (a, b) =>
				a.course.authors[0].displayName.localeCompare(b.course.authors[0].displayName)
		},
		{
			key: "progress",
			label: "Fortschritt",
			sortingFunction: (a, b) =>
				b.completions.courseCompletion.completionPercentage -
				a.completions.courseCompletion.completionPercentage
		},
		{
			key: "update",
			label: "Letzte Bearbeitung",
			sortingFunction: (a, b) =>
				new Date(b.lastProgressUpdate).getTime() - new Date(a.lastProgressUpdate).getTime()
		}
	];

	function getSortingFunction(): Column["sortingFunction"] {
		let sortingFunction = columns.find(
			column => column.key === sortedColumn.key
		)?.sortingFunction;
		sortingFunction = sortingFunction || columns[0].sortingFunction;
		if (sortedColumn.descendingOrder) {
			return (a, b) => -sortingFunction(a, b);
		} else {
			return sortingFunction;
		}
	}
	return (
		<div className={"p"}>
			<Table
				head={
					<>
						{columns.map(column => (
							<th
								className="cursor-pointer border-y border-light-border py-4 px-8 text-start text-sm font-semibold"
								key={column.key}
								onClick={() =>
									setSortedColumn({
										key: column.key,
										descendingOrder:
											sortedColumn.key == column.key
												? !sortedColumn.descendingOrder
												: true
									})
								}
							>
								<div className="flex justify-between">
									<span>{column.label}</span>
									{sortedColumn && sortedColumn.key === column.key ? (
										<span className="justify-end">
											{sortedColumn.descendingOrder ? "▼" : "▲"}
										</span>
									) : (
										<span className="invisible justify-end">▲</span>
									)}
								</div>
							</th>
						))}
					</>
				}
			>
				{enrollments
					.slice()
					.sort(getSortingFunction())
					.map(enrollment => (
						<tr key={enrollment.course.slug}>
							<TableDataColumn key={"title"}>
								<Link
									href={`/courses/${enrollment.course.slug}/`}
									className="block"
								>
									<div className="flex items-center space-x-4 p-2 hover:bg-gray-100">
										{enrollment.course.imgUrl ? (
											<Image
												src={enrollment.course.imgUrl}
												alt={enrollment.course.title}
												className="h-12 w-12 rounded-lg object-cover"
												width={48}
												height={48}
											/>
										) : (
											<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
												<span className="text-gray-500">Kein Bild</span>
											</div>
										)}
										<div>
											<span className="flex items-center justify-center text-gray-800 hover:text-secondary">
												<span className="truncate">
													{enrollment.course.title}
												</span>
											</span>
										</div>
									</div>
								</Link>
							</TableDataColumn>
							<TableDataColumn key={"author"}>
								<span className="text-sm text-gray-600">
									{enrollment.course.authors[0].displayName}
								</span>
							</TableDataColumn>
							<TableDataColumn key={"progress"}>
								<ProgressBar
									completionPercentage={
										enrollment.completions.courseCompletion.completionPercentage
									}
								/>
							</TableDataColumn>
							<TableDataColumn>
								{formatDateAgo(enrollment.lastProgressUpdate)}
							</TableDataColumn>
						</tr>
					))}
			</Table>
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
				enrollments: await getEnrollmentDetails(session.user.name)
			}
		};
	} catch (error) {
		console.error("Error fetching enrollments:", error);
		return {
			props: {
				enrollments: null
			}
		};
	}
};

export default CourseOverview;
