import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { apiHandler } from "@self-learning/util/http";
import { validationConfig } from "@self-learning/util/validate";
import { randomBytes } from "crypto";
import { NextApiHandler } from "next";
import { array, object, string } from "yup";

const lessonSchema = object({
	title: string().required().min(3),
	slug: string().required().min(3),
	subtitle: string().required().min(3),
	description: string().nullable(),
	content: array()
});

const lessonCreateApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		console.log(req.body);

		const lesson = lessonSchema.validateSync(req.body, validationConfig);

		const createdLesson = await database.lesson.create({
			data: {
				...lesson,
				content: lesson.content as Prisma.InputJsonArray,
				lessonId: randomBytes(6).toString("hex")
			},
			select: {
				lessonId: true,
				slug: true,
				title: true
			}
		});

		console.log("[lessonCreateApiHandler]: Created lesson", {});
		return res.status(201).json(createdLesson);
	});

export default lessonCreateApiHandler;
