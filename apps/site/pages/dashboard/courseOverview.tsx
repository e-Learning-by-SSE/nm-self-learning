import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
	ProgressBar,
	SortIndicator,
	Tab,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	Tabs,
	SectionHeader
} from "@self-learning/ui/common";
import { UniversalSearchBar } from "@self-learning/ui/layouts";
import { EnrollmentDetails, getEnrollmentDetails } from "@self-learning/enrollment";
import { formatDateDistanceToNow } from "@self-learning/util/common";
import { withTranslations } from "@self-learning/api";
import { withAuth } from "@self-learning/util/auth";
import { useTranslation } from "next-i18next";

interface CourseOverviewProps {
	enrollments: EnrollmentDetails[] | null;
}

export const getServerSideProps = withTranslations(
	["common", "pages-dashboard"],
	withAuth<CourseOverviewProps>(async (context, user) => {
		try {
			return {
				props: {
					enrollments: await getEnrollmentDetails(user.name)
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
	})
);

export default function CourseOverview({ enrollments }: CourseOverviewProps) {
	const { t } = useTranslation("pages-dashboard");
	const [selectedTab, setSelectedTab] = useState(0);
	const [inProgress, setInProgress] = useState<EnrollmentDetails[]>([]);
	const [complete, setComplete] = useState<EnrollmentDetails[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

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

	useMemo(() => {
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
								? t("No_Started_Course")
								: t("No_Started_Course_For_Search")
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
								? t("No_Completed_Course")
								: t("No_Completed_Course_For_Search")
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
	const { t } = useTranslation("pages-dashboard");

	return (
		<>
			<div className="flex justify-between gap-4">
				<SectionHeader
					title={t("Course_Overview_Title")}
					subtitle={t("Course_Overview_Subtitle")}
				/>
				<div className="mt-4">
					<Link href="/subjects">
						<button className="btn btn-primary" type="button">
							<span>{t("Browse_Courses")}</span>
						</button>
					</Link>
				</div>
			</div>

			<div className="py-2">
				<div className="flex items-center justify-between border-b border-c-border-strong pb-2">
					<div className="flex">
						<Tabs selectedIndex={selectedTab} onChange={setSelectedTab}>
							<Tab>{t("In_Progress")}</Tab>
							<Tab>{t("Completed")}</Tab>
						</Tabs>
					</div>
				</div>
				<div className="py-2">
					<UniversalSearchBar
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						placeHolder={t("Search_Courses_Placeholder")}
					/>
				</div>
				{/* TODO: is the overflow and flex necessary? Appears too wide atm */}
				<div className="flex-1 overflow-y-auto">
					{enrollments && enrollments.length > 0 ? (
						<SortedTable enrollments={enrollments} />
					) : (
						<p className="py-4 text-center">{notFoundMessage}</p>
					)}
				</div>
			</div>
		</>
	);
}

function SortedTable({ enrollments }: { enrollments: EnrollmentDetails[] }) {
	const { t } = useTranslation("pages-dashboard");
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "ascending" | "descending";
	}>({ key: "title", direction: "ascending" });

	type Column = {
		key: string;
		label: string;
		sortingFunction: (a: EnrollmentDetails, b: EnrollmentDetails) => number;
	};
	const columns: Column[] = [
		{
			key: "title",
			label: t("Title"),
			sortingFunction: (a: EnrollmentDetails, b: EnrollmentDetails) =>
				a.course.title.localeCompare(b.course.title)
		},
		{
			key: "author",
			label: t("Author"),
			sortingFunction: (a: EnrollmentDetails, b: EnrollmentDetails) =>
				a.course.authors[0].displayName.localeCompare(b.course.authors[0].displayName)
		},
		{
			key: "progress",
			label: t("Progress"),
			sortingFunction: (a: EnrollmentDetails, b: EnrollmentDetails) =>
				b.completions.courseCompletion.completionPercentage -
				a.completions.courseCompletion.completionPercentage
		},
		{
			key: "update",
			label: t("Last_Updated"),
			sortingFunction: (a: EnrollmentDetails, b: EnrollmentDetails) =>
				new Date(b.lastProgressUpdate).getTime() - new Date(a.lastProgressUpdate).getTime()
		}
	];

	function getSortingFunction(): Column["sortingFunction"] {
		let sortingFunction = columns.find(
			column => column.key === sortConfig.key
		)?.sortingFunction;

		if (!sortingFunction) {
			return (sortingFunction = (_: EnrollmentDetails, __: EnrollmentDetails) => 0);
		}

		if (sortConfig.direction === "descending") {
			return (a: EnrollmentDetails, b: EnrollmentDetails) => -sortingFunction(a, b);
		} else {
			return sortingFunction;
		}
	}

	const setSortOrder = (key: string) => {
		setSortConfig({
			key,
			direction:
				sortConfig.key === key && sortConfig.direction === "ascending"
					? "descending"
					: "ascending"
		});
	};

	return (
		<Table
			head={
				<>
					{columns.map(column => (
						<TableHeaderColumn
							onClick={() => setSortOrder(column.key)}
							key={column.key}
						>
							{column.label}{" "}
							<SortIndicator columnId={column.key} sortConfig={sortConfig} />
						</TableHeaderColumn>
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
							<Link href={`/courses/${enrollment.course.slug}/`} className="block">
								<div className="flex items-center space-x-4 p-2 hover:bg-c-neutral-muted">
									{enrollment.course.imgUrl ? (
										<Image
											src={enrollment.course.imgUrl}
											alt={enrollment.course.title}
											className="h-12 w-12 rounded-lg object-cover"
											width={48}
											height={48}
										/>
									) : (
										<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-c-surface-2">
											<span className="text-c-text-muted">{t("No_Image")}</span>
										</div>
									)}
									<div>
										<span className="flex items-center justify-center text-c-text-strong hover:text-c-primary">
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
								{enrollment.course.authors[0]?.displayName ?? t("Unknown_Author")}
							</span>
						</TableDataColumn>
						<TableDataColumn key={"progress"}>
							<ProgressBar
								text={`${enrollment.completions.courseCompletion.completionPercentage}%`}
								progressPercentage={
									enrollment.completions.courseCompletion.completionPercentage
								}
							/>
						</TableDataColumn>
						<TableDataColumn>
							{formatDateDistanceToNow(enrollment.lastProgressUpdate)}
						</TableDataColumn>
					</tr>
				))}
		</Table>
	);
}
