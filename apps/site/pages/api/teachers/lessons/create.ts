import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { lessonSchema } from "@self-learning/types";
import { apiHandler } from "@self-learning/util/http";
import { randomBytes } from "crypto";
import { NextApiHandler } from "next";

const lessonCreateApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		const lesson = lessonSchema.parse(req.body);

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

		console.log("[lessonCreateApiHandler]: Created lesson", createdLesson);
		return res.status(201).json(createdLesson);
	});

export default lessonCreateApiHandler;
