import { getCourseCompletionOfStudent } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CourseEnrollment, ResolvedValue } from "@self-learning/types";
import { AlreadyExists } from "@self-learning/util/http";

export async function getEnrollmentDetails(username: string) {
	const enrollments = await database.enrollment.findMany({
		where: { username },
		select: {
			lastProgressUpdate: true,
			course: {
				select: {
					title: true,
					slug: true,
					imgUrl: true,
					authors: {
						select: {
							displayName: true
						}
					}
				}
			}
		}
	});

	const enrollmentsWithDetails = await Promise.all(
		enrollments.map(async enrollment => {
			const completions = await getCourseCompletionOfStudent(
				enrollment.course.slug,
				username
			);

			return {
				...enrollment,
				lastProgressUpdate: enrollment.lastProgressUpdate.toISOString(),
				completions
			};
		})
	);

	return enrollmentsWithDetails;
}

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type EnrollmentDetails = ArrayElement<Awaited<ResolvedValue<typeof getEnrollmentDetails>>>;

export async function getEnrollmentsOfUser(username: string): Promise<CourseEnrollment[]> {
	return await database.enrollment.findMany({
		where: { username },
		select: {
			completedAt: true,
			status: true,
			course: {
				select: {
					title: true,
					slug: true
				}
			}
		}
	});
}

export async function enrollUser({ courseId, username }: { courseId: string; username: string }) {
	const course = await database.course.findUniqueOrThrow({
		where: { courseId },
		select: {
			courseId: true,
			enrollments: {
				select: {
					createdAt: true
				},
				where: { username }
			}
		}
	});

	if (course.enrollments[0]) {
		throw AlreadyExists(
			`${username} is already enrolled in ${courseId} (since: ${course.enrollments[0].createdAt.toLocaleString()}).`
		);
	}

	const enrollment = await database.enrollment.create({
		select: {
			createdAt: true,
			status: true,
			course: {
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			},
			username: true
		},
		data: {
			courseId: course.courseId,
			username: username,
			status: "ACTIVE"
		}
	});

	return enrollment;
}

export async function disenrollUser({
	courseId,
	username
}: {
	courseId: string;
	username: string;
}) {
	return database.enrollment.delete({
		select: {
			createdAt: true,
			completedAt: true,
			status: true,
			username: true,
			course: {
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			}
		},
		where: {
			courseId_username: {
				courseId,
				username
			}
		}
	});
}
