import { Course, Prisma } from "@prisma/client";
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
		image: yup
			.object({
				url: yup.string()
			})
			.nullable(),
		content: yup.array().of(
			yup.object({
				title: yup.string().required(),
				description: yup.string().nullable(),
				lessons: yup.array().of(
					yup.object({
						lesson: yup.object({
							lessonId: yup.string().required(),
							slug: yup.string().required(),
							title: yup.string().required(),
							subtitle: yup.string().nullable()
						})
					})
				)
			})
		)
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

	const content =
		entry.content?.map(chapter => ({
			title: chapter.title,
			description: chapter.description,
			lessons: chapter.lessons?.map(lesson => ({ lessonId: lesson.lesson.lessonId })) ?? []
		})) ?? [];

	const courseData: Prisma.CourseCreateInput = {
		courseId: entry.courseId,
		slug: entry.slug,
		title: entry.title,
		subtitle: entry.subtitle,
		imgUrl: entry.image?.url,
		content: JSON.stringify(content)
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
