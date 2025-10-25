import { EnrollmentStatus, PrismaClient } from "@prisma/client";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createEnrollments() {
	console.log("\x1b[94m%s\x1b[0m", "Creating enrollments...");

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

		console.log("Enrollments successfully created.");
	} catch (error) {
		console.error("Error creating enrollments:", error);
	} finally {
		await prisma.$disconnect();
	}
}
