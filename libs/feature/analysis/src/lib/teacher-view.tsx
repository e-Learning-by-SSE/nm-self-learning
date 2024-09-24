import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { getSemester } from "./aggregation-functions";
import Link from "next/link";
import { useState, useEffect } from "react";

type Course = {
	slug: string;
	title: string;
	courseId: string;
};

export function TeacherView() {
	const today = new Date();
	const semester = getSemester(today);

	const [courses, setCourses] = useState<string[]>([]);
	const { data: authorData, isLoading } = trpc.author.getCoursesAndSubjects.useQuery(undefined, {
		enabled: courses.length === 0
	});
	const authoredCourses: Course[] = [];
	const participationData = trpc.author.courseParticipation.useQuery(
		{
			resourceIds: courses,
			start: semester.start,
			end: semester.end
		},
		{ enabled: courses.length > 0 }
	).data;

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (!authorData) {
		return <p>Keine administrierten Kurse vorhanden.</p>;
	}

	authorData.subjectAdmin
		.map(subject => subject.subject.courses)
		.flat()
		.forEach(course => {
			authoredCourses.push(course);
		});
	authorData.specializationAdmin.forEach(specialization => {
		specialization.specialization.courses.forEach(course => {
			if (!authoredCourses.find(c => c.courseId === course.courseId)) {
				authoredCourses.push(course);
			}
		});
	});
	setCourses(authoredCourses.map(course => course.courseId));

	if (!participationData) {
		console.log("participationData", JSON.stringify(authorData));
		console.log("auhored", JSON.stringify(authoredCourses));
		console.log("courses", courses);
		return <p>Keine Daten vorhanden.</p>;
	}

	return (
		<>
			<h1 className="text-center text-3xl">Studierende pro betreuter Kurs</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Kurs</TableHeaderColumn>
						<TableHeaderColumn>Aktuelles Semester</TableHeaderColumn>
						<TableHeaderColumn>Insgesamt</TableHeaderColumn>
					</>
				}
			>
				{authoredCourses.map(course => (
					<tr key={course.slug}>
						<TableDataColumn>
							<Link href={`/courses/${course.slug}`}>{course.title}</Link>
						</TableDataColumn>
						<TableDataColumn>
							{participationData.find(p => p.resourceId === course.courseId)
								?.participants ?? "---"}
						</TableDataColumn>
						<TableDataColumn>
							{participationData.find(p => p.resourceId === course.courseId)
								?.participantsTotal ?? "---"}
						</TableDataColumn>
					</tr>
				))}
			</Table>

			<div className="pt-5 text-sm">
				Es werden aus datenschutzgründen nur Studierendenangaben nur für Kurse mit
				mindestens 10 Studierenden angezeigt.
			</div>
		</>
	);
}
