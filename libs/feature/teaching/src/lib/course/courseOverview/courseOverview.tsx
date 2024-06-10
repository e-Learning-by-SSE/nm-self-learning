import React from "react";
import { CourseCompletion, CourseEnrollment } from "@self-learning/types";
import { ProgressBar } from "@self-learning/ui/common";

type CourseOverviewProps = {
	enrollments: (CourseEnrollment & { completions: CourseCompletion })[] | null;
};

export function CourseOvxerview({ enrollments }: CourseOverviewProps) {
	if (!enrollments) {
		return <p>No enrollments found</p>;
	}

	return (
		<div>
			{enrollments.length > 0 ? (
				<ul>
					{enrollments.map((enrollment, index) => {
						return (
							<li key={index} className="mb-4">
								<h3>{enrollment.course.title}</h3>
								{enrollment.course.imgUrl && (
									<img
										src={enrollment.course.imgUrl}
										alt={enrollment.course.title}
										className="mb-2"
									/>
								)}

								<ProgressBar
									completionPercentage={
										enrollment.completions.courseCompletion.completionPercentage
									}
								/>
							</li>
						);
					})}
				</ul>
			) : (
				<p>No enrollments found</p>
			)}
		</div>
	);
}

function EnrollmentOverview({ enrollments }: CourseOverviewProps) {
	return <div></div>;
}
