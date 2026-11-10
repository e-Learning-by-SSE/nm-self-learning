"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useTranslation } from "next-i18next";

export type CourseMetricsItem = {
	courseId: string;
	label: string;
	rate: number;
	enrollments: number;
	recentEnrollments: number;
	participation: number;
	recentParticipation: number;
	recentRate: number;
};

export function CourseMetricsTable({ courses }: { courses: CourseMetricsItem[] }) {
	const { t } = useTranslation("student-analytics");
	const courseHref = (id: string) => `/learning-analytics/courses/${encodeURIComponent(id)}`;
	const pct = (n: number) => (Number.isFinite(n) ? `${n.toFixed(1)}%` : "—");

	return (
		<>
			<section className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
				<table className="w-full min-w-[760px] text-left text-sm">
					<colgroup span={1} />
					<colgroup span={2} />
					<colgroup span={2} />
					<colgroup span={2} />
					<thead className="border-b border-neutral-200 bg-neutral-50">
						<tr>
							<th scope="col" rowSpan={2} className="px-4 py-3 font-semibold">
								{t("Courses_Table_Course")}
							</th>
							<th scope="colgroup" colSpan={2} className="px-3 pt-3 text-center font-semibold">
								{t("Analysis_Enrollments")}
							</th>
							<th scope="colgroup" colSpan={2} className="px-3 pt-3 text-center font-semibold">
								{t("Analysis_Participation")}
							</th>
							<th scope="colgroup" colSpan={2} className="px-3 pt-3 text-center font-semibold">
								{t("Courses_Table_Completion")}
							</th>
						</tr>
						<tr>
							{Array.from({ length: 3 }, (_, index) => (
								<Fragment key={index}>
									<th scope="col" className="px-3 pb-3 pt-1 font-medium">
										{t("Courses_Table_Semester")}
									</th>
									<th scope="col" className="px-3 pb-3 pt-1 font-medium">
										{t("Analysis_Total")}
									</th>
								</Fragment>
							))}
						</tr>
					</thead>
					<tbody>
						{courses.map(course => (
							<tr
								key={course.courseId}
								className="border-b border-neutral-100 last:border-0"
							>
								<th scope="row" className="px-5 py-4 font-medium">
									<Link
										href={courseHref(course.courseId)}
										className="text-blue-700 underline"
									>
										{course.label}
									</Link>
								</th>
								<td className="px-3 py-4">{course.recentEnrollments}</td>
								<td className="px-3 py-4">{course.enrollments}</td>
								<td className="px-3 py-4">{course.recentParticipation}</td>
								<td className="px-3 py-4">{course.participation}</td>
								<td className="px-3 py-4">{pct(course.recentRate)}</td>
								<td className="px-3 py-4">{pct(course.rate)}</td>
							</tr>
						))}
						{courses.length === 0 && (
							<tr>
								<td colSpan={7} className="px-5 py-6 text-center text-neutral-500">
									{t("noDataAvailable")}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</section>
			<p className="mt-3 text-sm text-neutral-600">{t("Courses_Table_Completion_Note")}</p>
		</>
	);
}
