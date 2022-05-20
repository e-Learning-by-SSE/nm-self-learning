import { database } from "@self-learning/database";
import { apiHandler } from "@self-learning/util/http";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";
import { object, string } from "yup";

const routeParams = object({
	username: string().required(),
	lessonId: string().required()
});

const markAsCompletedApiHandler: NextApiHandler = async (req, res) => {
	return apiHandler(req, res, async () => {
		const { username, lessonId } = routeParams.validateSync({
			username: req.query.username,
			lessonId: req.query.lessonId
		});

		const completedLesson = await database.completedLesson.create({
			data: {
				lessonId,
				username
			},
			select: {
				createdAt: true,
				username: true,
				lessonId: true,
				lesson: {
					select: {
						lessonId: true,
						title: true,
						slug: true
					}
				}
			}
		});

		return res.status(StatusCodes.OK).json(completedLesson);
	});
};

export default markAsCompletedApiHandler;
