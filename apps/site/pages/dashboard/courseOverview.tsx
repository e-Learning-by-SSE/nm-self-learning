import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { CourseCompletion, CourseEnrollment } from "@self-learning/types";
import { getEnrollmentsOfUser } from "../../../../libs/data-access/api/src/lib/trpc/routers/enrollment.router";
import { getCourseCompletionOfStudent } from "@self-learning/completion";
import { CourseOverview } from "../../../../libs/feature/teaching/src/lib/course/courseOverview/courseOverview";

export default function Start({
	enrollments
}: {
	enrollments:
		| (CourseEnrollment & {
				completions: { courseCompletion: { completionPercentage: number } };
		  })[]
		| null;
}) {
	return <CourseOverview enrollments={enrollments} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
	const session = await getSession(context);

	if (!session || !session.user) {
		return {
			redirect: {
				destination: "/api/auth/signin",
				permanent: false
			}
		};
	}

	const username = session.user.name;

	try {
		const enrollments = await getEnrollmentsOfUser(username);
		const enrollmentsWithCompletions = await Promise.all(
			enrollments.map(async enrollment => {
				const completions = await getCourseCompletionOfStudent(
					enrollment.course.slug,
					username
				);

				return {
					...enrollment,
					completions
				};
			})
		);

		return {
			props: {
				enrollments: enrollmentsWithCompletions
			}
		};
	} catch (error) {
		console.error("Error fetching enrollments:", error);
		return {
			props: {
				enrollments: null
			}
		};
	}
};
