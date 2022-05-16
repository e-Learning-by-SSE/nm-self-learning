export async function processWebhookNotification(notification: CmsNotification): Promise<void> {
	console.log(notification);
	return;
}

type CmsEvent = `entry.${"create" | "update" | "delete" | "publish" | "unpublish"}`;

type CmsModelName = "course" | "nanomodule";

type CmsModel = CourseModel;

type CmsNotification = {
	event: CmsEvent;
	created_at: string;
	model: CmsModelName;
	entry: CmsModel;
};

type CourseModel = {
	id: number;
	slug: string;
	title: string;
	image?: {
		url: string;
		alternativeText?: string;
	};
	authors: {
		slug: string;
		name: string;
	};
};
