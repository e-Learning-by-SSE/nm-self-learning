import { database } from "@self-learning/database";
import { apiHandler, NotFound } from "@self-learning/util/http";
import { NextApiHandler } from "next";

const disenrollApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		const { username, courseSlug } = req.query;
		if (typeof username !== "string") {
			throw new Error("[username] must be a string");
		}

		if (typeof courseSlug !== "string") {
			throw new Error("[courseSlug] must be a string");
		}

		const course = await database.course.findUnique({
			where: { slug: courseSlug },
			select: {
				courseId: true,
				enrollments: {
					select: {
						createdAt: true
					},
					where: { username }
				}
			}
		});

		if (!course) {
			throw NotFound(req.query);
		}

		if (!course.enrollments[0]) {
			throw NotFound({ message: `${username} is not enrolled in ${courseSlug}.` });
		}

		const enrollment = await terminateEnrollment(course.courseId, username);

		console.log("[Enrollment] Deleted:", enrollment);

		return res.status(200).json(enrollment);
	});

export default disenrollApiHandler;

async function terminateEnrollment(courseId: string, username: string) {
	const enrollment = await database.enrollment.delete({
		where: {
			courseId_username: {
				courseId,
				username
			}
		}
	});

	return enrollment;
}
