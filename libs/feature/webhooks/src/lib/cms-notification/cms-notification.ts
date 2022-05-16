import { ValidationFailed } from "@self-learning/util/validation";
import * as yup from "yup";
import { courseNotificationHandler } from "./handlers/course-notification-handler";
import { CmsNotification, notificationSchema } from "./types";

export async function processWebhookNotification(notification: CmsNotification): Promise<void> {
	if (notification.event === "trigger-test") {
		console.log("[processWebhookNotification]: Received a trigger-test\n", notification);
		return;
	}

	try {
		const { model } = notificationSchema.validateSync(notification);

		if (model === "course") {
			const result = await courseNotificationHandler(notification);
			console.log("[courseNotificationHandler]: Completed\n", result);
		}

		return;
	} catch (error) {
		if (error instanceof yup.ValidationError) {
			throw ValidationFailed(error.errors);
		} else {
			console.error("[processWebhookNotification]: Unexpected error\n", error);
		}
	}
}
