import { Course } from "@prisma/client";
import { database } from "@self-learning/database";
import { validationConfig } from "@self-learning/util/validate";
import * as yup from "yup";
import { NotificationHandler } from "../types";

export const courseEntrySchema = yup
	.object({
		courseId: yup.string().required(),
		title: yup.string().required(),
		slug: yup.string().required(),
		subtitle: yup.string().required(),
		image: yup.object({
			url: yup.string()
		})
	})
	.typeError(
		"'entry' must be an object with the following keys: courseId, title, slug, subtitle, image.url (optional)"
	);

export type CourseEntry = yup.InferType<typeof courseEntrySchema>;

export const courseNotificationHandler: NotificationHandler<Course> = async notification => {
	const entry = courseEntrySchema.validateSync(notification.entry, validationConfig);

	const existingCourse = await database.course.findUnique({
		rejectOnNotFound: false,
		where: { courseId: entry.courseId }
	});

	if (notification.event === "entry.delete") {
		if (!existingCourse) {
			return { operation: "NOOP" };
		}

		const course = await database.course.delete({ where: { courseId: entry.courseId } });
		return {
			operation: "DELETED",
			data: course
		};
	}

	const courseData = {
		courseId: entry.courseId,
		slug: entry.slug,
		title: entry.title,
		subtitle: entry.subtitle,
		imgUrl: entry.image?.url
	};

	if (existingCourse) {
		const course = await database.course.update({
			where: { courseId: entry.courseId },
			data: courseData
		});

		return {
			operation: "UPDATED",
			data: course
		};
	}

	const course = await database.course.create({
		data: courseData
	});

	return {
		operation: "CREATED",
		data: course
	};
};
