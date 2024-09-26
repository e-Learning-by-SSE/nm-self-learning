import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { getSemester } from "./aggregation-functions";
import Link from "next/link";

type Course = {
	slug: string;
	title: string;
	courseId: string;
};

function CourseParticipation({
	courses,
	semester
}: {
	courses: Course[];
	semester: { start: Date; end: Date };
}) {
	const { data, isLoading } = trpc.author.courseParticipation.useQuery(
		{
			courseId: courses.map(c => c.courseId),
			start: semester.start,
			end: semester.end
		},
		{ enabled: courses.length > 0 }
	);

	if (isLoading) {
		return <p>Loading...</p>;
	}
	if (!data) {
		return <p>Keine Daten vorhanden.</p>;
	}

	return (
		<>
			<Table
				head={
					<>
						<TableHeaderColumn>Kurs</TableHeaderColumn>
						<TableHeaderColumn>Aktuelles Semester</TableHeaderColumn>
						<TableHeaderColumn>Insgesamt</TableHeaderColumn>
					</>
				}
			>
				{courses.map(course => (
					<tr key={course.slug}>
						<TableDataColumn>
							<Link href={`/courses/${course.slug}`}>{course.title}</Link>
						</TableDataColumn>
						<TableDataColumn>
							{data.find(p => p.courseId === course.courseId)?.participants ?? "---"}
						</TableDataColumn>
						<TableDataColumn>
							{data.find(p => p.courseId === course.courseId)?.participantsTotal ??
								"---"}
						</TableDataColumn>
					</tr>
				))}
			</Table>
		</>
	);
}

export function TeacherView() {
	const today = new Date();
	const semester = getSemester(today);
	const { data, isLoading } = trpc.author.getCoursesAndSubjects.useQuery();

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (!data) {
		return <p>Keine administrierten Kurse vorhanden.</p>;
	}

	const authoredCourses = data.subjectAdmin.map(subject => subject.subject.courses).flat();

	data.specializationAdmin.forEach(specialization => {
		specialization.specialization.courses.forEach(course => {
			if (!authoredCourses.find(c => c.courseId === course.courseId)) {
				authoredCourses.push(course);
			}
		});
	});

	return <CourseParticipation courses={authoredCourses} semester={semester} />;
}
