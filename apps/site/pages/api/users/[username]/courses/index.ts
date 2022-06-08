import { database } from "@self-learning/database";
import { CourseEnrollment } from "@self-learning/types";
import { MethodNotAllowed, withApiError } from "@self-learning/util/http";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

const handler: NextApiHandler<CourseEnrollment[]> = async (req, res) => {
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

export async function getCoursesOfUser(username: string): Promise<CourseEnrollment[]> {
	const enrollments = await database.enrollment.findMany({
		where: { username },
		select: {
			completedAt: true,
			status: true,
			course: {
				select: {
					title: true,
					slug: true
				}
			}
		}
	});

	return enrollments;
}
