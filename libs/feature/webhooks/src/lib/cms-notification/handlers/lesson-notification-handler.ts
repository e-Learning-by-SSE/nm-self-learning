import { Lesson } from "@prisma/client";
import { database } from "@self-learning/database";
import { NotificationHandler } from "../types";
import * as yup from "yup";
import { validationConfig } from "@self-learning/util/validate";

export const lessonEntrySchema = yup
	.object({
		lessonId: yup.string().required(),
		slug: yup.string().required(),
		title: yup.string().required(),
		subtitle: yup.string().nullable(),
		image: yup
			.object({
				url: yup.string()
			})
			.nullable()
	})
	.typeError("entry must be an object with keys: lessonId, slug, title, subtitle");

export type LessonEntry = yup.InferType<typeof lessonEntrySchema>;

export const lessonNotificationHandler: NotificationHandler<Lesson> = async notification => {
	const entry = lessonEntrySchema.validateSync(notification.entry, validationConfig);

	const existingLesson = await database.lesson.findUnique({
		where: { lessonId: entry.lessonId }
	});

	if (notification.event === "entry.delete") {
		if (!existingLesson) {
			return { operation: "NOOP" };
		}

		const lesson = await database.lesson.delete({ where: { lessonId: entry.lessonId } });

		return {
			operation: "DELETED",
			data: lesson
		};
	}

	const lessonData = {
		lessonId: entry.lessonId,
		slug: entry.slug,
		title: entry.title,
		subtitle: entry.subtitle,
		imgUrl: entry.image?.url
	};

	if (existingLesson) {
		const lesson = await database.lesson.update({
			where: { lessonId: entry.lessonId },
			data: lessonData
		});

		return {
			operation: "UPDATED",
			data: lesson
		};
	}

	const lesson = await database.lesson.create({
		data: lessonData
	});

	return {
		operation: "CREATED",
		data: lesson
	};
};
