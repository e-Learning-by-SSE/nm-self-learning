import { getCoursesForSync, getLessonsForSync } from "@self-learning/cms-api";
import {
	ApiError,
	InternalServerError,
	MethodNotAllowed,
	withApiError
} from "@self-learning/util/http";
import { synchronizeCourses, synchronizeLessons } from "@self-learning/webhooks";
import { NextApiHandler } from "next";

const cmsSyncApiHandler: NextApiHandler = async (req, res) => {
	if (req.method !== "POST") {
		return withApiError(res, MethodNotAllowed(req.method));
	}

	const start = Date.now();

	try {
		await synchronizeCourses(async () => {
			const result = await getCoursesForSync();
			console.log(
				`[cmsSyncApiHandler]: Fetched ${result.courses.length} of ${result._total} courses from CMS.`
			);

			if (result._total !== result.courses.length) {
				console.log("[cmsSyncApiHandler]: WARNING - CMS did not return all courses.");
			}
			return result;
		});

		console.log("[cmsSyncApiHandler]: Successfully synchronized courses.");

		await synchronizeLessons(async () => {
			const result = await getLessonsForSync();
			console.log(
				`[cmsSyncApiHandler]: Fetched ${result.lessons.length} of ${result._total} lessons from CMS.`
			);

			if (result._total !== result.lessons.length) {
				console.log("[cmsSyncApiHandler]: WARNING - CMS did not return all lessons.");
			}
			return result;
		});

		console.log("[cmsSyncApiHandler]: Successfully synchronized lessons.");

		console.log(`[cmsSyncApiHandler]: Synchronization took ${Date.now() - start}ms.`);

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
