import React, { useState } from "react";
import { ProgressBar, Tab, Tabs } from "@self-learning/ui/common";
import Link from "next/link";
import { EnrollmentWithDetails } from "@self-learning/types";
import { PlayIcon } from "@heroicons/react/24/solid";

export function CourseOverview({ enrollments }: { enrollments: EnrollmentWithDetails[] | null }) {
	const [selectedTab, setSelectedTab] = useState(0);

	if (!enrollments) {
		return <p>No enrollments found</p>;
	}

	const inProgress = enrollments.filter(
		enrollment => enrollment.completions.courseCompletion.completionPercentage < 100
	);
	const complete = enrollments.filter(
		enrollment => enrollment.completions.courseCompletion.completionPercentage >= 100
	);

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
		</div>
	);
}

function EnrollmentOverview({
	enrollments,
	notFoundMessage
}: {
	enrollments: EnrollmentWithDetails[] | null;
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
							{enrollment.course.imgUrl && (
								<img
									src={enrollment.course.imgUrl}
									alt={enrollment.course.title}
									className="h-24 w-full rounded-t-lg object-cover md:h-auto md:w-24"
								/>
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
														className="btn-primary flex items-center justify-between rounded-md bg-green-500 px-4 py-2 text-white hover:bg-emerald-600"
														data-testid="quizLink"
														style={{ maxWidth: "40%" }}
													>
														<span>Fortfahren</span>
														<PlayIcon className="h-6 w-6" />
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
	enrollments: EnrollmentWithDetails[] | null;
	notFoundMessage: string;
}) {
	return (
		<div className="xl:grid-cols grid h-full gap-8">
			<div>
				<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
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
