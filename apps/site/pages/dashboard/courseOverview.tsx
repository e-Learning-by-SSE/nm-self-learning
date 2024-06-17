import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { EnrollmentDetails } from "@self-learning/types";
import { getEnrollmentDetails } from "@self-learning/api";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar, SortableTable, Tab, Tabs } from "@self-learning/ui/common";
import { UniversalSearchBar } from "@self-learning/ui/layouts";
import Image from "next/image";

function CourseOverview({ enrollments }: { enrollments: EnrollmentDetails[] | null }) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [inProgress, setInProgress] = useState<EnrollmentDetails[]>([]);
	const [complete, setComplete] = useState<EnrollmentDetails[]>([]);

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
		<ControlledCourseOverview
			selectedTab={selectedTab}
			setSelectedTab={setSelectedTab}
			inProgress={inProgress}
			complete={complete}
			searchQuery={searchQuery}
			setSearchQuery={setSearchQuery}
		/>
	);
}

export function ControlledCourseOverview({
	selectedTab,
	setSelectedTab,
	inProgress,
	complete,
	searchQuery,
	setSearchQuery
}: {
	selectedTab: number;
	setSelectedTab: (v: number) => void;
	inProgress: EnrollmentDetails[];
	complete: EnrollmentDetails[];
	searchQuery: string;
	setSearchQuery: (v: string) => void;
}) {
	const enrollments = selectedTab === 0 ? inProgress : complete;
	const notFoundMessage =
		selectedTab === 0
			? "Derzeit ist kein Kurs angefangen."
			: "Derzeit ist kein Kurs abgeschlossen.";

	const columns = [
		{ key: "courseTitle", label: "Title" },
		{ key: "author", label: "Autor" },
		{ key: "progress", label: "Fortschritt" }
	];

	const data = enrollments.map(enrollment => ({
		courseTitle: {
			component: (
				<Link href={`/courses/${enrollment.course.slug}/`} className="block">
					<div className="flex items-center space-x-4 p-2 hover:bg-gray-100">
						{enrollment.course.imgUrl ? (
							<Image
								src={enrollment.course.imgUrl}
								alt={enrollment.course.title}
								width={48}
								height={48}
								className="rounded-lg object-cover"
							/>
						) : (
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
								<span className="text-gray-500">Kein Bild</span>
							</div>
						)}
						<div>
							<span className="flex items-center justify-center text-gray-800 hover:text-secondary">
								<span className="truncate">{enrollment.course.title}</span>
							</span>
						</div>
					</div>
				</Link>
			),
			sortValue: enrollment.course.title
		},
		author: {
			component: (
				<span className="text-sm text-gray-600">
					{enrollment.course.authors[0].displayName}
				</span>
			),
			sortValue: enrollment.course.authors[0].displayName
		},
		progress: {
			component: (
				<ProgressBar
					completionPercentage={
						enrollment.completions.courseCompletion.completionPercentage
					}
				/>
			),
			sortValue: enrollment.completions.courseCompletion.completionPercentage
		}
	}));

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
			<div className="pt-2">
				<UniversalSearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					placeHolder={"Kurse durchsuchen..."}
				/>
			</div>
			<div className="flex-1 overflow-y-auto pt-4">
				{data.length > 0 ? (
					<SortableTable data={data} columns={columns} />
				) : (
					<p className="py-4 text-center">{notFoundMessage}</p>
				)}
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

	const username = session.user.name;

	try {
		const enrollments = await getEnrollmentDetails(username);

		return {
			props: {
				enrollments
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
