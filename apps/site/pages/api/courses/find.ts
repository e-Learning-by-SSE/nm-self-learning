import { findCourses, FindCoursesResponse } from "@self-learning/api";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const coursesFindApiHandler: NextApiHandler<FindCoursesResponse> = async (req, res) =>
	apiHandler(req, res, "GET", async () => {
		const title = req.query.title as string | undefined;
		const courses = await findCourses(title);
		return res.status(200).json(courses);
	});

export default coursesFindApiHandler;
