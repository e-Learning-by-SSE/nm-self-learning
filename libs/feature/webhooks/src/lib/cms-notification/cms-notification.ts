import { ValidationFailed } from "@self-learning/util/http";
import { validationConfig } from "@self-learning/util/validate";
import * as yup from "yup";
import { courseNotificationHandler } from "./handlers/course-notification-handler";
import { lessonNotificationHandler } from "./handlers/lesson-notification-handler";
import { CmsNotification, NotificationHandlerResult, notificationSchema } from "./types";

export async function processWebhookNotification(
	notification: CmsNotification
): Promise<NotificationHandlerResult<unknown>> {
	if (notification.event === "trigger-test") {
		return {
			operation: "NOOP",
			data: undefined
		};
	}

	try {
		const { model } = notificationSchema.validateSync(notification, validationConfig);

		if (model === "course") {
			return await courseNotificationHandler(notification);
		}

		if (model === "lesson") {
			return await lessonNotificationHandler(notification);
		}
	} catch (error) {
		if (error instanceof yup.ValidationError) {
			throw ValidationFailed(error.errors);
		} else {
			throw error;
		}
	}

	// No handler for this model
	return {
		operation: "NOOP",
		data: undefined
	};
}
