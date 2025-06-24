import { database } from "@self-learning/database";
import { differenceInDays, subDays } from "date-fns";
import { sendCourseReminder } from "./email-service";
import { checkStreakRisks } from "./reminders/streak-risk";

export interface SchedulerResult {
	courseReminders: number;
	achievementNotifications: number;
	streakReminders: number;
	errors: number;
}

export async function checkAndSendScheduledEmails(): Promise<SchedulerResult> {
	const results: SchedulerResult = {
		courseReminders: 0,
		achievementNotifications: 0,
		streakReminders: 0,
		errors: 0
	};

	try {
		await Promise.all([checkCourseInactivity(results), checkStreakRisks(results)]);
	} catch (error) {
		console.error("Email scheduler error:", error);
		results.errors++;
	}

	return results;
}

async function checkCourseInactivity(results: SchedulerResult) {
	const threeDaysAgo = subDays(new Date(), 3);

	const inactiveEnrollments = await database.enrollment.findMany({
		where: {
			status: "ACTIVE",
			progress: { lt: 100 },
			lastProgressUpdate: { lt: threeDaysAgo },
			student: {
				user: {
					featureFlags: {
						learningStatistics: true
					},
					email: { not: null }
				}
			}
		},
		include: {
			course: true,
			student: { include: { user: true } }
		}
	});

	for (const enrollment of inactiveEnrollments) {
		try {
			// Check if a reminder has already been sent
			const existingReminder = await database.reminderLog.findFirst({
				where: {
					userId: enrollment.student.user.id,
					templateKey: "courseReminder",
					status: "SENT",
					metadata: {
						path: ["courseId"],
						equals: enrollment.course.courseId
					}
				}
			});

			if (existingReminder) {
				continue;
			}

			// Send the reminder
			const result = await sendCourseReminder(enrollment.student.user.email!, {
				userName: enrollment.student.user.displayName,
				courseName: enrollment.course.title,
				courseUrl: `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/courses/${enrollment.course.slug}`,
				progress: enrollment.progress,
				lastVisitedDays: differenceInDays(new Date(), enrollment.lastProgressUpdate)
			});

			if (result.success) {
				results.courseReminders++;

				// Log the reminder in the database
				await database.reminderLog.create({
					data: {
						userId: enrollment.student.user.id,
						templateKey: "courseReminder",
						status: "SENT",
						sentAt: new Date(),
						metadata: {
							courseId: enrollment.course.courseId
						}
					}
				});
			} else {
				results.errors++;
			}
		} catch (error) {
			console.error("Course reminder error:", error);
			results.errors++;
		}
	}
}
