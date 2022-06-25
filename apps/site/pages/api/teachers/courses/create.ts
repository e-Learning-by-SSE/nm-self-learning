import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { courseFormSchema } from "@self-learning/teaching";
import { getRandomId, stringOrNull } from "@self-learning/util/common";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const createCourseApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		const { title, slug, subtitle, description, imgUrl, content, subjectId } =
			courseFormSchema.validateSync(req.body);

		const creatableCourse: Prisma.CourseCreateInput = {
			slug,
			title,
			subtitle,
			content,
			courseId: getRandomId(),
			imgUrl: stringOrNull(imgUrl),
			description: stringOrNull(description),
			subject: subjectId ? { connect: { subjectId } } : undefined
		};

		const created = await database.course.create({
			data: creatableCourse,
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
