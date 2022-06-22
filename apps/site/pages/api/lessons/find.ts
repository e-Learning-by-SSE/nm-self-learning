import { findLessons } from "@self-learning/api";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "GET", async () => {
		const { title } = req.query;
		const lessons = await findLessons(title);
		return res.status(200).json(lessons);
	});

export default handler;
