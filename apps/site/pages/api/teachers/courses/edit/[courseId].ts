import { database } from "@self-learning/database";
import { courseFormSchema, mapFromCourseFormToDbSchema } from "@self-learning/teaching";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const editCourseApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		const courseId = req.query.courseId as string;
		const course = courseFormSchema.parse(req.body);

		const courseForDb = mapFromCourseFormToDbSchema(course, courseId);

		const updated = await database.course.update({
			where: { courseId },
			data: courseForDb,
			select: {
				title: true,
				slug: true,
				courseId: true
			}
		});

		console.log("[editCourseApiHandler]: Course updated", updated);
		return res.status(200).json(updated);
	});

export default editCourseApiHandler;
