import * as yup from "yup";

export type CmsEvent =
	| "trigger-test"
	| "entry.create"
	| "entry.update"
	| "entry.delete"
	| "entry.publish"
	| "entry.unpublish";

type CmsModelName = "course" | "nanomodule";

export const notificationSchema = yup
	.object({
		event: yup
			.mixed<CmsEvent>()
			.oneOf([
				"trigger-test",
				"entry.create",
				"entry.update",
				"entry.delete",
				"entry.publish",
				"entry.unpublish"
			])
			.required(),
		model: yup.mixed<CmsModelName>().oneOf(["course", "nanomodule"]).required(),
		entry: yup.object().required()
	})
	.typeError("Request body must contain an object with the following keys: event, model, entry");

export type CmsNotification = yup.InferType<typeof notificationSchema>;

export type NotificationHandlerResult<T = undefined> = {
	operation: "CREATED" | "UPDATED" | "DELETED" | "NOOP";
	data: T;
};

export type NotificationHandler<T = unknown> = (
	notification: CmsNotification
) => Promise<NotificationHandlerResult<T>>;
