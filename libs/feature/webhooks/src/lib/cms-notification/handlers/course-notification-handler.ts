import { Course, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { validationConfig } from "@self-learning/util/validate";
import { mapCourseContent } from "../../map-course-content";
import { courseEntrySchema } from "../../schemas";
import { NotificationHandler } from "../types";

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

	const content = mapCourseContent(entry.content);

	const courseData: Prisma.CourseCreateInput = {
		courseId: entry.courseId,
		slug: entry.slug,
		title: entry.title,
		subtitle: entry.subtitle,
		imgUrl: entry.image?.url,
		content: content
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
