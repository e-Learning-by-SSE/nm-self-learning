import { Prisma } from "@prisma/client";
import { getCoursesForSync, getLessonsForSync } from "@self-learning/cms-api";
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
		await synchronizeCourses();
		await synchronizeLessons();

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

async function synchronizeCourses() {
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
}

async function synchronizeLessons() {
	const { lessons, _total } = await getLessonsForSync();

	console.log(
		`[${cmsSyncApiHandler.name}]: Fetched ${lessons.length} of ${_total} lessons from CMS.`
	);

	const promises = lessons.map(lesson => {
		const input: Prisma.LessonCreateInput = lesson;

		const promise = database.lesson.upsert({
			where: { lessonId: lesson.lessonId },
			create: input,
			update: input
		});

		return promise;
	});

	await Promise.all(promises);
	console.log(
		`[${cmsSyncApiHandler.name}]: Successfully synchronized ${lessons.length} courses.`
	);
}
