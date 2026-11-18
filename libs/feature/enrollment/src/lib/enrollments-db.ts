import { EnrollmentStatus } from "@self-learning/database";
import { getCourseCompletionOfStudent } from "@self-learning/completion/server";
import { CourseEnrollment, ResolvedValue } from "@self-learning/types";
import { AlreadyExists, NotFound } from "@self-learning/util/http";
import { database, Prisma } from "@self-learning/database/server";
import { createEventLogEntry } from "@self-learning/util/eventlog/server";

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

export type EnrollmentDetails = ArrayElement<ResolvedValue<typeof getEnrollmentDetails>>;

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
	const course = await database.course.findUnique({
		where: { courseId },
		select: {
			courseId: true,
			enrollments: {
				select: { createdAt: true },
				where: { username }
			}
		}
	});

	if (!course) {
		throw NotFound({ courseId });
	}

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
		data: { courseId, username, status: EnrollmentStatus.ACTIVE }
	});

	await createEventLogEntry({
		username,
		type: "COURSE_ENROLL",
		resourceId: courseId,
		payload: undefined
	});

	return enrollment;
}

/** Ensures a user is enrolled, returning the existing enrollment when present. */
export async function ensureEnrolledUser({
	courseId,
	username
}: {
	courseId: string;
	username: string;
}) {
	const course = await database.course.findUnique({
		where: { courseId },
		select: { courseId: true }
	});

	if (!course) {
		throw NotFound({ courseId });
	}

	const select = {
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
	} as const;

	const existingEnrollment = await database.enrollment.findUnique({
		where: { courseId_username: { courseId, username } },
		select
	});

	if (existingEnrollment) {
		return existingEnrollment;
	}

	const result = await database.enrollment
		.create({
			select,
			data: { courseId, username, status: EnrollmentStatus.ACTIVE }
		})
		.then(enrollment => ({ enrollment, created: true as const }))
		.catch(async error => {
			// Another request may have created the enrollment after the lookup above.
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
				const concurrentEnrollment = await database.enrollment.findUnique({
					where: { courseId_username: { courseId, username } },
					select
				});

				if (concurrentEnrollment) {
					return { enrollment: concurrentEnrollment, created: false as const };
				}
			}

			throw error;
		});

	if (result.created) {
		await createEventLogEntry({
			username,
			type: "COURSE_ENROLL",
			resourceId: courseId,
			payload: undefined
		});
	}

	return result.enrollment;
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
