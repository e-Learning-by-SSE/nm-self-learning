import React from "react";
import { CourseEnrollment } from "@self-learning/types";

type CourseOverviewProps = {
	enrollments: (CourseEnrollment & { completions: any[] })[] | null;
};

export function CourseOverview({ enrollments }: CourseOverviewProps) {
	if (!enrollments) {
		return <p>No enrollments found</p>;
	}

	console.log(enrollments)

	return (
		<div>
			{enrollments.length > 0 ? (
				<ul>
					{enrollments.map((enrollment, index) => (
						<li key={index}>
							<h3>{enrollment.course.title}</h3>
							<p>Status: {enrollment.status}</p>
							{enrollment.course.imgUrl && <img src={enrollment.course.imgUrl}
															  alt={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzjwt8zZO32q4O_woiIrR0Nqsp5SnTPIxNtw&s"}/>}
							<h4>Completions:</h4>

							<ul>
								{Array.isArray(enrollment.completions) && enrollment.completions.length > 0 ? (
									enrollment.completions.map((completion, compIndex) => (
										<li key={compIndex}>
											{/* Render completion details here */}
											<p>{JSON.stringify(completion)}</p>
										</li>
									))
								) : (
									<li>No completions found</li>
								)}
							</ul>
						</li>
					))}
				</ul>
			) : (
				<p>No enrollments found</p>
			)}
		</div>
	);
}
