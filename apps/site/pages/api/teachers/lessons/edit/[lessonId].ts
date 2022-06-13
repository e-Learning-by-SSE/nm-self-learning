import { database } from "@self-learning/database";
import { apiHandler, NotFound } from "@self-learning/util/http";
import { validationConfig } from "@self-learning/util/validate";
import { NextApiHandler } from "next";
import { array, object, string } from "yup";

const lessonSchema = object({
	title: string().required().min(3),
	slug: string().required().min(3),
	subtitle: string().required().min(3),
	description: string().nullable(),
	content: array()
});

const lessonUpdateApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "PUT", async () => {
		const { lessonId } = object({ lessonId: string().required() }).validateSync(
			req.query,
			validationConfig
		);
		const lesson = lessonSchema.validateSync(req.body, validationConfig);

		const beforeUpdate = await database.lesson.findUnique({
			where: { lessonId },
			select: {
				slug: true
			}
		});

		if (!beforeUpdate) {
			throw NotFound({ lessonId });
		}

		const updatedLesson = await database.lesson.update({
			where: { lessonId },
			data: {
				...lesson,
				lessonId
			},
			select: {
				lessonId: true,
				slug: true,
				title: true
			}
		});

		console.log("[lessonUpdateApiHandler]: Updated lesson", updatedLesson);

		return res.status(200).json(updatedLesson);
	});

export default lessonUpdateApiHandler;
