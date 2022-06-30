import { database } from "@self-learning/database";
import { courseFormSchema, mapFromCourseFormToDbSchema } from "@self-learning/teaching";
import { getRandomId } from "@self-learning/util/common";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const createCourseApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		const course = courseFormSchema.parse(req.body);

		const courseForDb = mapFromCourseFormToDbSchema(course, getRandomId());

		const created = await database.course.create({
			data: courseForDb,
			select: {
				title: true,
				slug: true,
				courseId: true
			}
		});

		console.log("[createCourseApiHandler]: Created course", created);
		return res.status(201).json(created);
	});

export default createCourseApiHandler;