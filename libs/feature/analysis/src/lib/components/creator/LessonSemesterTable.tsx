"use client";

import { trpc } from "@self-learning/api-client";
import { useTranslation } from "next-i18next";

export function LessonSemesterTable({ courseId }: { courseId: string }) {
	const { t, i18n } = useTranslation("student-analytics");
	const { data, isLoading, isError } = trpc.metrics.getAuthorCourseLessonActivity.useQuery({
		courseId
	});
	if (isLoading) return <p>{t("loadingDashboard")}</p>;
	if (isError || !data) return <p>{t("noDataAvailable")}</p>;

	const formatDate = (date: string, offset = 0) => {
		const value = new Date(`${date}T00:00:00Z`);
		value.setUTCDate(value.getUTCDate() + offset);
		return new Intl.DateTimeFormat(i18n.language, {
			day: "2-digit",
			month: "2-digit",
			timeZone: "UTC"
		}).format(value);
	};
	return (
		<section className="mt-6">
			<h2 className="mb-3 text-lg font-semibold">{t("Lesson_Semester_Title")}</h2>
			<div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-neutral-200 bg-neutral-50">
						<tr>
							<th scope="col" className="px-5 py-4 font-semibold">
								{t("Lesson_Semester_Lesson")}
							</th>
							{data.periods.map(period => (
								<th
									key={period.start}
									scope="col"
									className="whitespace-nowrap px-4 py-4 font-semibold"
								>
									{formatDate(period.start)}–{formatDate(period.end, -1)}
								</th>
							))}
							<th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
								{t("Lesson_Semester_Total")}
							</th>
						</tr>
					</thead>
					{data.chapters.map((chapter, chapterIndex) => (
						<tbody key={chapterIndex}>
							<tr>
								<th
									scope="rowgroup"
									colSpan={data.periods.length + 2}
									className="px-5 py-3 text-center font-semibold"
									style={{ backgroundColor: "#e5e7eb" }}
								>
									{chapter.title}
								</th>
							</tr>
							{chapter.lessons.map((lesson, lessonIndex) => (
								<tr
									key={lessonIndex}
									className="border-b border-neutral-100 last:border-0"
								>
									<th scope="row" className="min-w-48 px-5 py-4 font-medium">
										{lesson.title}
									</th>
									{lesson.periodCompletions.map((count, index) => (
										<td key={data.periods[index].start} className="px-4 py-4">
											{count}
										</td>
									))}
									<td className="px-5 py-4">{lesson.totalCompletions}</td>
								</tr>
							))}
						</tbody>
					))}
					{data.chapters.length === 0 && (
						<tbody>
							<tr>
								<td
									colSpan={data.periods.length + 2}
									className="px-5 py-6 text-center text-neutral-500"
								>
									{t("noDataAvailable")}
								</td>
							</tr>
						</tbody>
					)}
				</table>
			</div>
			<p className="mt-3 text-sm text-neutral-600">{t("Lesson_Semester_Note")}</p>
		</section>
	);
}
