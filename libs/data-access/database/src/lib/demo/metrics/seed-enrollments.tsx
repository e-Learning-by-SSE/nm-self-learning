import { EnrollmentStatus, PrismaClient } from "@prisma/client";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createEnrollments() {
	try {
		await prisma.enrollment.create({
			data: {
				courseId: "magical-test-course",
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
