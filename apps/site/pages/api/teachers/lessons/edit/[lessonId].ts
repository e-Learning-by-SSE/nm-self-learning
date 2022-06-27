import { database } from "@self-learning/database";
import { lessonSchema } from "@self-learning/types";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const lessonUpdateApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "PUT", async () => {
		const lessonId = req.query.lessonId as string;

		const lesson = lessonSchema.parse(req.body);

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
