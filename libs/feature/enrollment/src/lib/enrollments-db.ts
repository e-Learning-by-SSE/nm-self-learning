import { EnrollmentStatus } from "@prisma/client";
import { getCourseCompletionOfStudent } from "@self-learning/completion";
import { getCombinedCourses } from "@self-learning/course";
import { createUserEvent, database } from "@self-learning/database";
import { CourseCompletion, CourseEnrollment, ResolvedValue } from "@self-learning/types";
import { AlreadyExists, NotFound } from "@self-learning/util/http";

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
			},
			dynCourse: {
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

	const enrollmentCourseMapped = enrollments.map(enrollment => ({
		...enrollment,
		course: enrollment.course ??
			enrollment.dynCourse ?? {
				title: "Unknown Course",
				slug: "unknown-course",
				imgUrl: "",
				authors: []
			}
	}));

	const enrollmentsWithDetails = await Promise.all(
		enrollmentCourseMapped.map(async enrollment => {
			const courseObj = enrollment.course;
			const courseSlug = courseObj?.slug;
			const completions: CourseCompletion = courseSlug
				? await getCourseCompletionOfStudent(courseSlug, username)
				: {
						courseCompletion: {
							lessonCount: 0,
							completedLessonCount: 0,
							completionPercentage: 0
						},
						chapterCompletion: [],
						completedLessons: {}
					};

			return {
				...enrollment,
				lastProgressUpdate: enrollment.lastProgressUpdate.toISOString(),
				course: courseObj,
				completions
			};
		})
	);

	return enrollmentsWithDetails;
}

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type EnrollmentDetails = ArrayElement<ResolvedValue<typeof getEnrollmentDetails>>;
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
			},
			dynCourse: {
				select: {
					title: true,
					slug: true
				}
			}
		}
	});

	return enrollments.map(enrollment => ({
		completedAt: enrollment.completedAt,
		status: enrollment.status,
		course: enrollment.course ??
			enrollment.dynCourse ?? {
				title: "Unknown Course",
				slug: "unknown-course"
			}
	}));
}

export async function enrollUser({ courseId, username }: { courseId?: string; username: string }) {
	if (!courseId) {
		throw new Error("courseId or dynCourseId must be provided.");
	}

	let course;
	let data;

	course = await database.course.findUnique({
		where: { courseId },
		select: {
			courseId: true,
			enrollments: {
				select: { createdAt: true },
				where: { username }
			}
		}
	});
	data = { courseId, username, status: EnrollmentStatus.ACTIVE };

	if (!course) {
		course = await database.dynCourse.findUnique({
			where: { courseId },
			select: {
				courseId: true,
				enrollments: {
					select: { createdAt: true },
					where: { username }
				}
			}
		});
		data = { dynCourseId: courseId, username, status: EnrollmentStatus.ACTIVE };
	}

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
			dynCourse: {
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			},
			username: true
		},
		data
	});

	await createUserEvent({
		username,
		type: "COURSE_ENROLL",
		resourceId: courseId,
		payload: undefined
	});

	return enrollment;
}

export async function disenrollUser({
	courseId,
	username
}: {
	courseId?: string;
	username: string;
}) {
	if (!courseId) {
		throw new Error("courseId must be provided.");
	}

	const course = await getCombinedCourses({
		courseId
	});

	if (!course || !course.length) {
		throw new Error(`Course with ID ${courseId} not found.`);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let where: any;
	if (course[0].courseType === "STANDARD") {
		where = { courseId_username: { courseId, username } };
	} else {
		where = { dynCourseId_username: { dynCourseId: courseId, username } };
	}

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
			},
			dynCourse: {
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			}
		},
		where
	});
}
