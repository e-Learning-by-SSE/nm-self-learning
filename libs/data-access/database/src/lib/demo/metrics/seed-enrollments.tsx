import { EnrollmentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createEnrollments(
	courseIds: string[],
	userData: { id: string; name: string }[]
) {
	try {
		const enrollmentData = [];

		// Enroll Users in Wizardry Courses
		for (const courseId of courseIds) {
			userData.map(async user => {
				// 40 % chance to be COMPLETED, 60 % chance to be ACTIVE
				const status =
					Math.random() < 0.4 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;

				const progress =
					status === EnrollmentStatus.COMPLETED ? 100 : Math.floor(Math.random() * 99); // Random progress up to 99% if ACTIVE

				// magical-creatures always 100% to have atleast one COMPLETED enrollment
				enrollmentData.push({
					courseId,
					username: user.name,
					status,
					progress
				});
			});
		}

		// Enroll "potter" in the courses (30% chance for Completed, 70% Active)
		for (const courseId of courseIds) {
			const status =
				Math.random() < 0.3 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;
			const progress =
				status === EnrollmentStatus.COMPLETED ? 100 : Math.floor(Math.random() * 99);

			enrollmentData.push({
				courseId,
				username: "potter",
				status,
				progress
			});
		}

		// Enroll "potter" in non-wizardry courses
		const nonWizardCourseIds = (
			await prisma.course.findMany({
				where: {
					slug: {
						in: ["objectorientierte-programmierung-mit-java", "bewusstsein", "analysis"]
					}
				},
				select: { courseId: true }
			})
		).map(c => c.courseId);

		for (const courseId of nonWizardCourseIds) {
			await enrollmentData.push({
				courseId,
				username: "potter",
				status: EnrollmentStatus.ACTIVE,
				progress: Math.floor(Math.random() * 99) // Random progress up to 99%
			});
		}

		await prisma.enrollment.createMany({ data: enrollmentData });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Enrollments");
	} catch (error) {
		console.error("Error creating enrollments:", error);
	} finally {
		await prisma.$disconnect();
	}
}
