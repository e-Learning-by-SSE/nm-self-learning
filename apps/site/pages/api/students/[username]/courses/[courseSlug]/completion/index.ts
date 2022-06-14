import { getCourseCompletionOfStudent } from "@self-learning/completion";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";
import { object, string } from "yup";

const courseProgressApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "GET", async () => {
		const { courseSlug, username } = object({
			courseSlug: string().required(),
			username: string().required()
		}).validateSync(req.query);

		const result = await getCourseCompletionOfStudent(courseSlug, username);

		return res.status(200).json(result);
	});

export default courseProgressApiHandler;
