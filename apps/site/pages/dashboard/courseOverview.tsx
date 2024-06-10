import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { CourseOverview } from "../../../../libs/feature/teaching/src/lib/course/courseOverview/courseOverview";
import { EnrollmentWithDetails } from "@self-learning/types";
import { getEnrollmentsOfUserWithCourseDetails } from "../../../../libs/data-access/api/src/lib/trpc/routers/enrollment.router";

export default function Start({ enrollments }: { enrollments: EnrollmentWithDetails[] | null }) {
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
		const enrollments = await getEnrollmentsOfUserWithCourseDetails(username);

		return {
			props: {
				enrollments
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
