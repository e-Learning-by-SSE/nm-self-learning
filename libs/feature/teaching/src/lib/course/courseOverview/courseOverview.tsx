import React from "react";

type CourseOverviewProps = {
	completions: any[];
};

export function CourseOverview({ completions }: CourseOverviewProps) {
	return (
		<div>
			{completions.length > 0 ? (
				<ul>
					{completions.map((completion, index) => (
						<li key={index}>
							<p>Completion detail: {JSON.stringify(completion)}</p>
						</li>
					))}
				</ul>
			) : (
				<p>No completions found.</p>
			)}
		</div>
	);
}
