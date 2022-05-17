import { database } from "@self-learning/database";
import { ValidationError } from "yup";
import { CmsNotification } from "../types";
import { LessonEntry, lessonNotificationHandler } from "./lesson-notification-handler";

describe("Lesson Notification Handler", () => {
	it("Invalid entry -> Throw ValidationError", async () => {
		const notification: CmsNotification = {
			event: "entry.create",
			model: "course",
			entry: {}
		};

		try {
			await lessonNotificationHandler(notification);
			expect(true).toEqual(false);
		} catch (error) {
			if (error instanceof ValidationError) {
				expect(error.errors).toMatchInlineSnapshot(`
			Array [
			  "lessonId is a required field",
			  "slug is a required field",
			  "title is a required field",
			]
		`);
			} else {
				expect(true).toEqual(false);
			}
		}
	});

	it("[entry.create] Lesson does not exist -> Creates lesson", async () => {
		const notification: CmsNotification = {
			event: "entry.create",
			model: "course",
			entry: {
				title: "A New Lesson",
				slug: "a-new-lesson",
				lessonId: "anewlesson"
			} as LessonEntry
		};

		await database.lesson.deleteMany({
			where: {
				lessonId: notification.entry.lessonId
			}
		});

		const result = await lessonNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "data": Object {
		    "imgUrl": null,
		    "lessonId": "anewlesson",
		    "slug": "a-new-lesson",
		    "subtitle": null,
		    "title": "A New Lesson",
		  },
		  "operation": "CREATED",
		}
	`);
	});

	it("[entry.update] Lesson does not exist -> Creates lesson", async () => {
		const notification: CmsNotification = {
			event: "entry.update",
			model: "course",
			entry: {
				title: "This Lesson Does Not Exist YET",
				slug: "does-not-exist-yet",
				lessonId: "doesnotexistyet"
			} as LessonEntry
		};

		await database.lesson.deleteMany({
			where: {
				lessonId: notification.entry.lessonId
			}
		});

		const result = await lessonNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "data": Object {
		    "imgUrl": null,
		    "lessonId": "doesnotexistyet",
		    "slug": "does-not-exist-yet",
		    "subtitle": null,
		    "title": "This Lesson Does Not Exist YET",
		  },
		  "operation": "CREATED",
		}
	`);
	});

	it("[entry.delete] Lesson does not exist -> NOOP", async () => {
		const notification: CmsNotification = {
			event: "entry.delete",
			model: "course",
			entry: {
				title: "This Lesson Does Not Exist",
				slug: "does-not-exist",
				lessonId: "doesnotexist"
			} as LessonEntry
		};

		const result = await lessonNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "operation": "NOOP",
		}
	`);
	});

	it("[entry.update] Lesson exists -> Updates lesson", async () => {
		const notification: CmsNotification = {
			event: "entry.update",
			model: "course",
			entry: {
				title: "This Lesson exists",
				slug: "this-lesson-exists",
				lessonId: "thislessonexists"
			} as LessonEntry
		};

		await database.lesson.upsert({
			where: { lessonId: notification.entry.lessonId },
			create: {
				lessonId: notification.entry.lessonId,
				slug: notification.entry.slug,
				title: notification.entry.title
			},
			update: {
				lessonId: notification.entry.lessonId,
				slug: notification.entry.slug,
				title: notification.entry.title
			}
		});

		const result = await lessonNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "data": Object {
		    "imgUrl": null,
		    "lessonId": "thislessonexists",
		    "slug": "this-lesson-exists",
		    "subtitle": null,
		    "title": "This Lesson exists",
		  },
		  "operation": "UPDATED",
		}
	`);
	});
});
