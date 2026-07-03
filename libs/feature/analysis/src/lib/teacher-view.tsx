"use client";
import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn, SortIndicator } from "@self-learning/ui/common";
import { getSemester } from "./aggregation-functions";
import Link from "next/link";
import { useState } from "react";
import { AccessLevel } from "@prisma/client";

type Course = { slug: string; title: string; courseId: string };

type ParticipationData = Course & {
	participants?: number | null | undefined;
	participantsTotal?: number | null | undefined;
};

function SortedTable({ participationData }: { participationData: ParticipationData[] }) {
	const [data, setData] = useState(participationData);
	const [sortConfig, setSortConfig] = useState<{
		key: keyof ParticipationData | null;
		direction: "ascending" | "descending";
	}>({ key: null, direction: "ascending" });

	// Sorting function
	const sortData = (key: keyof ParticipationData) => {
		const sortedData = [...data];
		let direction: "ascending" | "descending" = "ascending";

		if (sortConfig.key === key && sortConfig.direction === "ascending") {
			direction = "descending";
		}

		sortedData.sort((a, b) => {
			if ((a[key] ?? 0) < (b[key] ?? 0)) {
				return direction === "ascending" ? -1 : 1;
			}
			if ((a[key] ?? 0) > (b[key] ?? 0)) {
				return direction === "ascending" ? 1 : -1;
			}
			return 0;
		});

		setData(sortedData);
		setSortConfig({ key, direction });
	};

	return (
		<>
			<Table
				head={
					<>
						<TableHeaderColumn onClick={() => sortData("title")}>
							Kurs <SortIndicator columnId="title" sortConfig={sortConfig} />
						</TableHeaderColumn>
						<TableHeaderColumn onClick={() => sortData("participants")}>
							Aktuelles Semester{" "}
							<SortIndicator columnId="participants" sortConfig={sortConfig} />
						</TableHeaderColumn>
						<TableHeaderColumn onClick={() => sortData("participantsTotal")}>
							Insgesamt{" "}
							<SortIndicator columnId="participantsTotal" sortConfig={sortConfig} />
						</TableHeaderColumn>
					</>
				}
			>
				{data.map(course => (
					<tr key={course.slug}>
						<TableDataColumn>
							<Link href={`/courses/${course.slug}`}>{course.title}</Link>
						</TableDataColumn>
						<TableDataColumn>{course.participants ?? "*"}</TableDataColumn>
						<TableDataColumn>{course.participantsTotal ?? "*"}</TableDataColumn>
					</tr>
				))}
			</Table>
		</>
	);
}

function CourseParticipation({
	courses,
	semester
}: {
	courses: Course[];
	semester: { start: Date; end: Date };
}) {
	const { data, isLoading } = trpc.author.courseParticipation.useQuery(
		{ courseId: courses.map(c => c.courseId), start: semester.start, end: semester.end },
		{ enabled: courses.length > 0 }
	);

	if (isLoading) {
		return <p>Loading...</p>;
	}
	if (!data) {
		return <p>Keine Daten vorhanden.</p>;
	}

	const merged = courses.map(course => {
		const participationData = data.find(p => p.courseId === course.courseId);
		return { ...course, ...(participationData || {}) };
	});

	return <SortedTable participationData={merged} />;
}

export function TeacherView() {
	const today = new Date();
	const semester = getSemester(today);
	const { data, isLoading } = trpc.author.getAdministratedCourses.useQuery();

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (!data) {
		return <p>Keine administrierten Kurse vorhanden.</p>;
	}
	const adrministratedCourses = data
		.filter((p): p is typeof p & { course: Course } => p.course !== null)
		.map(p => p.course);

	return <CourseParticipation courses={adrministratedCourses} semester={semester} />;
}
