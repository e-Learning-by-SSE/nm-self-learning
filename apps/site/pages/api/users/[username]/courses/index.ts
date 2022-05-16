import { getCoursesWithSlugs } from "@self-learning/cms-api";
import { database } from "@self-learning/database";
import { MethodNotAllowed, withApiError } from "@self-learning/util/http";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
	const { username } = req.query;
	if (typeof username !== "string") {
		throw new Error("[username] must be a string");
	}

	if (req.method !== "GET") {
		return withApiError(res, MethodNotAllowed(req.method));
	}

	const courses = await getCoursesOfUser(username);
	res.status(StatusCodes.OK).json(courses);
};

export default handler;

export async function getCoursesOfUser(username: string) {
	const enrollments = await database.enrollment.findMany({
		where: { username }
	});

	if (enrollments.length == 0) {
		return [];
	}

	const courseSlugs = enrollments.map(e => e.courseId);

	const courses = courseSlugs.length > 0 ? await getCoursesWithSlugs(courseSlugs) : [];

	const enrollmentsWithCourses = enrollments.map(enrollment => ({
		...enrollment,
		courseInfo: courses.find(course => course.slug === enrollment.courseId)
	}));

	return enrollmentsWithCourses;
}

export type CoursesOfUser = Awaited<ReturnType<typeof getCoursesOfUser>>;
