import { UserNotificationSetting } from "@prisma/client";
import {
	renderTemplate,
	CourseReminderContext,
	EmailContext,
	StreakReminderContext
} from "./template-engine";
import { matches } from "@self-learning/util/common";

export interface EmailTemplate {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

export interface EmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

export async function sendEmail(template: EmailTemplate): Promise<EmailResult> {
	if (typeof window !== "undefined") {
		throw new Error("sendEmail can only be called on the server side.");
	}
	if (process.env.NODE_ENV === "production") {
		console.warn(
			"Email sending via Resend is disabled in non-production environments. Switch to production to enable."
		);
		return {
			success: true,
			messageId: "test-message-id"
		};
	}

	const { Resend } = await import("resend");
	const resend = new Resend(process.env.RESEND_API_KEY);

	try {
		const result = await resend.emails.send({
			from: "SELF-learning <noreply@resend.dev>", // TODO change sender ID
			to: template.to,
			subject: template.subject,
			html: template.html,
			text: template.text
		});

		return {
			success: true,
			messageId: result.data?.id
		};
	} catch (error) {
		console.error("Email sending failed:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

export async function sendTemplatedEmail(to: string, context: EmailContext) {
	const template = renderTemplate(context.type, context.data);

	return sendEmail({
		to,
		subject: template.subject,
		html: template.html,
		text: template.text
	});
}

// Convenience functions
export async function sendCourseReminder(to: string, data: CourseReminderContext) {
	return sendTemplatedEmail(to, { type: "courseReminder", data });
}

export async function sendStreakReminderFirst(to: string, data: StreakReminderContext) {
	return sendTemplatedEmail(to, { type: "streakReminderFirst", data });
}

export async function sendStreakReminderLast(to: string, data: StreakReminderContext) {
	return sendTemplatedEmail(to, { type: "streakReminderLast", data });
}

// export async function sendStreakReminderLastChance(to: string, data: StreakReminderContext) {
// 	return sendTemplatedEmail(to, { type: "streakReminderLastChance", data });
// }

export function isEmailNotificationSettingEnabled(
	type: EmailContext["type"],
	user: { notificationSettings: UserNotificationSetting[] }
) {
	return user.notificationSettings.some(
		matches<UserNotificationSetting>({ channel: "email", type, enabled: true })
	);
}
