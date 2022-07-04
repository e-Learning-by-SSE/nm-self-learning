import { findLessons, FindLessonsResponse } from "@self-learning/api";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const handler: NextApiHandler<FindLessonsResponse> = async (req, res) =>
	apiHandler(req, res, "GET", async () => {
		const { title, page } = req.query;
		const lessons = await findLessons({
			title: title as string | undefined,
			take: 15,
			skip: page ? (Number(page) - 1) * 25 : 0
		});
		return res.status(200).json(lessons);
	});

export default handler;
