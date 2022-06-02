import { database } from "@self-learning/database";
import { ValidationError } from "yup";
import { CourseEntry } from "../../schemas";
import { CmsNotification } from "../types";
import { courseNotificationHandler } from "./course-notification-handler";

describe("Course Notification Handler", () => {
	it("[entry.create] Course does not exist -> Creates course", async () => {
		const notification: CmsNotification = {
			event: "entry.create",
			model: "course",
			entry: {
				courseId: "anewcourse",
				title: "A New Course",
				subtitle: "Lorem ipsum dolor sit amet.",
				slug: "a-new-course",
				image: {
					url: "/uploads/image.png"
				}
			} as CourseEntry
		};

		await database.course.deleteMany({
			where: {
				courseId: notification.entry.courseId
			}
		});

		const result = await courseNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "data": Object {
		    "courseId": "anewcourse",
		    "imgUrl": "/uploads/image.png",
		    "slug": "a-new-course",
		    "subtitle": "Lorem ipsum dolor sit amet.",
		    "title": "A New Course",
		  },
		  "operation": "CREATED",
		}
	`);
	});

	it("[entry.update] Course does not exist -> Creates course", async () => {
		const notification: CmsNotification = {
			event: "entry.update",
			model: "course",
			entry: {
				courseId: "anewcourse",
				title: "A New Course",
				subtitle: "Lorem ipsum dolor sit amet.",
				slug: "a-new-course",
				image: {
					url: "/uploads/image.png"
				}
			} as CourseEntry
		};

		await database.course.deleteMany({
			where: {
				courseId: notification.entry.courseId
			}
		});

		const result = await courseNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "data": Object {
		    "courseId": "anewcourse",
		    "imgUrl": "/uploads/image.png",
		    "slug": "a-new-course",
		    "subtitle": "Lorem ipsum dolor sit amet.",
		    "title": "A New Course",
		  },
		  "operation": "CREATED",
		}
	`);
	});

	it("[entry.create] Course already exists -> Updates course", async () => {
		const course = {
			courseId: "alreadyexists",
			title: "An existing Course",
			subtitle: "Lorem ipsum dolor sit amet.",
			slug: "already-exists"
		};

		await database.course.upsert({
			where: { courseId: course.courseId },
			create: course,
			update: course
		});

		const notification: CmsNotification = {
			event: "entry.create",
			model: "course",
			entry: {
				...course,
				title: "Updated Title"
			} as CourseEntry
		};

		const result = await courseNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "data": Object {
		    "courseId": "alreadyexists",
		    "imgUrl": null,
		    "slug": "already-exists",
		    "subtitle": "Lorem ipsum dolor sit amet.",
		    "title": "Updated Title",
		  },
		  "operation": "UPDATED",
		}
	`);
	});

	it("[entry.delete] Deletes course", async () => {
		const course = {
			courseId: "tobedeleted",
			title: "To Be Deleted",
			subtitle: "Lorem ipsum dolor sit amet.",
			slug: "to-be-deleted"
		};

		const notification: CmsNotification = {
			event: "entry.create",
			model: "course",
			entry: {
				...course
			} as CourseEntry
		};

		await database.course.upsert({
			where: { courseId: course.courseId },
			create: course,
			update: course
		});

		const result = await courseNotificationHandler(notification);

		expect(result).toMatchInlineSnapshot(`
		Object {
		  "data": Object {
		    "courseId": "tobedeleted",
		    "imgUrl": null,
		    "slug": "to-be-deleted",
		    "subtitle": "Lorem ipsum dolor sit amet.",
		    "title": "To Be Deleted",
		  },
		  "operation": "UPDATED",
		}
	`);
	});

	it("Empty course entry object -> Throws ValidationError", async () => {
		try {
			const notification: CmsNotification = {
				event: "entry.create",
				model: "course",
				entry: {} as CourseEntry
			};
			await courseNotificationHandler(notification);
			expect(true).toEqual(false);
		} catch (error) {
			if (error instanceof ValidationError) {
				expect(error.errors).toMatchInlineSnapshot(`
			Array [
			  "courseId is a required field",
			  "subtitle is a required field",
			  "title is a required field",
			  "slug is a required field",
			]
		`);
			} else {
				expect(true).toEqual(false);
			}
		}
	});

	it("Missing course entry object -> Throws ValidationError", async () => {
		try {
			const notification: CmsNotification = {
				event: "entry.create",
				model: "course",
				entry: null as unknown as CourseEntry
			};
			await courseNotificationHandler(notification);
			expect(true).toEqual(false);
		} catch (error) {
			if (error instanceof ValidationError) {
				expect(error.errors).toMatchInlineSnapshot(`
			Array [
			  "'entry' must be an object with the following keys: courseId, title, slug, subtitle, image.url (optional)",
			]
		`);
			} else {
				expect(true).toEqual(false);
			}
		}
	});
});
