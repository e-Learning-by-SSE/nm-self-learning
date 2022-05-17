import { Prisma } from "@prisma/client";
import { getCoursesForSync } from "@self-learning/cms-api";
import { database } from "@self-learning/database";
import {
	ApiError,
	InternalServerError,
	MethodNotAllowed,
	withApiError
} from "@self-learning/util/http";
import { NextApiHandler } from "next";

const cmsSyncApiHandler: NextApiHandler = async (req, res) => {
	if (req.method !== "POST") {
		return withApiError(res, MethodNotAllowed(req.method));
	}

	try {
		const { courses, _total } = await getCoursesForSync();

		console.log(
			`[${cmsSyncApiHandler.name}]: Fetched ${courses.length} of ${_total} courses from CMS.`
		);

		const promises = courses.map(course => {
			const courseInput: Prisma.CourseCreateInput = {
				...course,
				subtitle: ""
			};

			const promise = database.course.upsert({
				where: { courseId: course.courseId },
				create: courseInput,
				update: courseInput
			});

			return promise;
		});

		await Promise.all(promises);
		console.log(
			`[${cmsSyncApiHandler.name}]: Successfully synchronized ${courses.length} courses.`
		);

		res.status(200).end();
	} catch (error) {
		if (error instanceof ApiError) {
			return withApiError(res, error);
		}

		console.error(error);
		return withApiError(res, InternalServerError());
	}
};

export default cmsSyncApiHandler;
