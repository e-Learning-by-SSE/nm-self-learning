import { z } from "zod";
import { createProtectedRouter } from "../create-router";
import { database } from "@self-learning/database";
import { CourseEnrollment } from "@self-learning/types";
import { AlreadyExists } from "@self-learning/util/http";

export const enrollmentRouter = createProtectedRouter()
	.query("getEnrollments", {
		async resolve({ ctx }) {
			return getEnrollmentsOfUser(ctx.username);
		}
	})
	.mutation("enroll", {
		input: z.object({
			courseId: z.string()
		}),
		resolve({ ctx, input }) {
			return enrollUser({
				courseId: input.courseId,
				username: ctx.username
			});
		}
	})
	.mutation("disenroll", {
		input: z.object({
			courseId: z.string()
		}),
		resolve({ ctx, input }) {
			return disenrollUser({
				courseId: input.courseId,
				username: ctx.username
			});
		}
	});

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
	const course = await database.course.findUnique({
		rejectOnNotFound: true,
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
