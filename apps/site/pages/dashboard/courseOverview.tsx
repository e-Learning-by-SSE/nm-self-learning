import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { EnrollmentDetails } from "@self-learning/types";
import { getEnrollmentDetails } from "@self-learning/api";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlayIcon } from "@heroicons/react/24/solid";
import { ProgressBar, Tab, Tabs } from "@self-learning/ui/common";
import { UniversalSearchBar } from "../../../../libs/ui/layouts/src/lib/search-bar";

export function CourseOverview({ enrollments }: { enrollments: EnrollmentDetails[] | null }) {
	const [selectedTab, setSelectedTab] = useState(0);

	const [searchQuery, setSearchQuery] = useState("");
	const [filteredEnrollments, setFilteredEnrollments] = useState<EnrollmentDetails[]>([]);
	const [inProgress, setInProgress] = useState<EnrollmentDetails[]>([]);
	const [complete, setComplete] = useState<EnrollmentDetails[]>([]);

	useEffect(() => {
		if (enrollments) {
			const filtered = filterEnrollments(enrollments, searchQuery);
			setFilteredEnrollments(filtered);

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
		<div className="py-2 px-4">
			{selectedTab === 0 && (
				<TabContent
					selectedTab={selectedTab}
					setSelectedTab={setSelectedTab}
					enrollments={inProgress}
					notFoundMessage={"Derzeit ist kein Kurs angefangen."}
				/>
			)}
			{selectedTab === 1 && (
				<TabContent
					selectedTab={selectedTab}
					setSelectedTab={setSelectedTab}
					enrollments={complete}
					notFoundMessage={"Derzeit ist kein Kurs abgeschlossen."}
				/>
			)}

			<UniversalSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
		</div>
	);
}

function EnrollmentOverview({
	enrollments,
	notFoundMessage
}: {
	enrollments: EnrollmentDetails[] | null;
	notFoundMessage: string;
}) {
	if (!enrollments) {
		return <p>Keine Kurse Gefunden.</p>;
	}

	return (
		<div>
			{enrollments.length > 0 ? (
				<ul className="space-y-4">
					{enrollments.map((enrollment, index) => (
						<li
							key={index}
							className="flex flex-col space-y-2 rounded-lg bg-white p-4 shadow-md md:flex-row md:space-y-0 md:space-x-4"
						>
							{enrollment.course.imgUrl ? (
								<img
									src={enrollment.course.imgUrl}
									alt={enrollment.course.title}
									className="h-auto w-full rounded-lg object-cover md:h-24 md:w-24"
								/>
							) : (
								<div className="flex h-auto w-full items-center justify-center rounded-lg bg-white md:h-24 md:w-24">
									<span className="text-gray-500">Kein Bild Verfügbar</span>
								</div>
							)}
							<div className="flex flex-grow flex-col space-y-1">
								<table className="w-full">
									<tbody>
										<tr>
											<td className="w-3/5">
												<div>
													<h2 className="text-lg font-bold text-gray-900">
														{enrollment.course.title}
													</h2>
													<span className="text-sm text-gray-600">
														{enrollment.course.authors[0].displayName}
													</span>
												</div>
											</td>
											<td className="w-2/5">
												<div className="flex justify-end">
													<Link
														href={`/courses/${enrollment.course.slug}/`}
														className="btn-primary flex items-center justify-center rounded-md bg-green-500 px-2 py-2 text-white hover:bg-emerald-600"
														style={{ maxWidth: "100%" }}
													>
														<span className="truncate">Fortfahren</span>
														<PlayIcon className="ml-2 h-6 w-6" />
													</Link>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
								<div className="mt-2">
									<ProgressBar
										completionPercentage={
											enrollment.completions.courseCompletion
												.completionPercentage
										}
									/>
								</div>
							</div>
						</li>
					))}
				</ul>
			) : (
				<p className="text-center">{notFoundMessage}</p>
			)}
		</div>
	);
}

function TabContent({
	selectedTab,
	setSelectedTab,
	enrollments,
	notFoundMessage
}: {
	selectedTab: number;
	setSelectedTab: (v: number) => void;
	enrollments: EnrollmentDetails[] | null;
	notFoundMessage: string;
}) {
	return (
		<div className="xl:grid-cols grid h-full gap-8">
			<div>
				<Tabs selectedIndex={selectedTab} onChange={setSelectedTab}>
					<Tab>In Bearbeitung</Tab>
					<Tab>Abgeschlossen</Tab>
				</Tabs>
				<div className={"pt-4"}>
					<EnrollmentOverview
						enrollments={enrollments}
						notFoundMessage={notFoundMessage}
					/>
				</div>
			</div>
		</div>
	);
}

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
