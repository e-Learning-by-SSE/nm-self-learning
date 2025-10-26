import { EnrollmentStatus, PrismaClient } from "@prisma/client";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createEnrollments() {
	try {
		await prisma.enrollment.create({
			data: {
				courseId: "magical-test-course",
				username: "potter",
				status: EnrollmentStatus.ACTIVE,
				progress: 78
			}
		});

		await prisma.enrollment.create({
			data: {
				courseId: "advanced-magical-theory",
				username: "potter",
				status: EnrollmentStatus.COMPLETED,
				progress: 100
			}
		});

		await prisma.enrollment.create({
			data: {
				courseId: "magical-creatures",
				username: "potter",
				status: EnrollmentStatus.COMPLETED,
				progress: 100
			}
		});

		await prisma.enrollment.create({
			data: {
				courseId: "potions-and-elixirs",
				username: "potter",
				status: EnrollmentStatus.COMPLETED,
				progress: 100
			}
		});

		await prisma.enrollment.create({
			data: {
				courseId: "defense-against-the-dark-arts",
				username: "potter",
				status: EnrollmentStatus.COMPLETED,
				progress: 100
			}
		});

		await prisma.enrollment.create({
			data: {
				courseId: "magical-test-course",
				username: "weasley",
				status: EnrollmentStatus.COMPLETED,
				progress: 100
			}
		});

		// Enroll in non-wizardry courses
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
			await prisma.enrollment.create({
				data: {
					courseId,
					username: "potter",
					status: EnrollmentStatus.ACTIVE,
					progress: Math.floor(Math.random() * 99) // Random progress up to 99%
				}
			});
		}

		const enrollmentData = usersRaw.map(userRaw => {
			return {
				courseId: "magical-test-course",
				username: userRaw.name,
				status: EnrollmentStatus.ACTIVE
			};
		});

		await prisma.enrollment.createMany({ data: enrollmentData });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Enrollments");
	} catch (error) {
		console.error("Error creating enrollments:", error);
	} finally {
		await prisma.$disconnect();
	}
}
