import { database } from "@self-learning/database";
import { CourseEnrollment } from "@self-learning/types";
import { AlreadyExists } from "@self-learning/util/http";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { getCourseCompletionOfStudent } from "@self-learning/completion";

export const enrollmentRouter = t.router({
	getEnrollments: authProcedure.query(async ({ ctx }) => {
		return getEnrollmentsOfUser(ctx.user.name);
	}),
	enroll: authProcedure
		.input(
			z.object({
				courseId: z.string()
			})
		)
		.mutation(({ ctx, input }) => {
			return enrollUser({
				courseId: input.courseId,
				username: ctx.user.name
			});
		}),
	disenroll: authProcedure
		.input(
			z.object({
				courseId: z.string()
			})
		)
		.mutation(({ ctx, input }) => {
			return disenrollUser({
				courseId: input.courseId,
				username: ctx.user.name
			});
		})
});

export async function getEnrollmentDetails(username: string) {
	const enrollments = await database.enrollment.findMany({
		where: { username },
		select: {
			completedAt: true,
			status: true,
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
		enrollments.map(async (enrollment) => {
			const completions = await getCourseCompletionOfStudent(
				enrollment.course.slug,
				username
			);

			return {
				...enrollment,
				completedAt: enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
				lastProgressUpdate: enrollment.lastProgressUpdate.toISOString(),
				completions
			};
		})
	);

	enrollmentsWithDetails.sort(
		(a, b) =>
			new Date(b.lastProgressUpdate).getTime() - new Date(a.lastProgressUpdate).getTime()
	);

	return enrollmentsWithDetails;
}


export async function getEnrollmentsOfUser(username: string): Promise<CourseEnrollment[]> {
	const enrollments = await database.enrollment.findMany({
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

	return enrollments;
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
