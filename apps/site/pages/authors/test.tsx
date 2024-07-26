/**
 * Procedure
 * authProcedure - any authenticated user
 * adminProcedure
 * authorProcedure  - any author
 *
 */

import { trpc } from "@self-learning/api-client";
import { useState } from "react";

export default function AuthorisationTest() {
	const courseId = "7srmdmj";
	const newSubtitle = "nowy podtytul 3";
	const { mutateAsync: updateCourse } = trpc.course.editSubtitle.useMutation();
	const [course, setCourse] = useState({ title: "", slug: "", courseId: "", subtitle: "" });

	async function editCourse() {
		try {
			const testcourse = await updateCourse({ courseId: courseId, extra: newSubtitle });
			setCourse(testcourse);
		} catch (err) {
			console.log("Error", err);
		}
	}

	return (
		<>
			<div className="m-4 max-h-10">
				<div>Test course Id: {courseId}</div>
				<button className="btn-primary m-2" onClick={editCourse}>
					Edit course
				</button>
				<div>course subtitle: {course?.subtitle}</div>
			</div>
		</>
	);
}
