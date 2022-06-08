import { database } from "@self-learning/database";
import { AlreadyExists, apiHandler, NotFound } from "@self-learning/util/http";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

const enrollApiHandler: NextApiHandler = async (req, res) =>
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

		if (course.enrollments[0]) {
			throw AlreadyExists(
				`${username} is already enrolled in ${courseSlug} (since: ${course.enrollments[0].createdAt.toLocaleString()}).`
			);
		}

		const enrollment = await database.enrollment.create({
			data: {
				courseId: course.courseId,
				username: username,
				status: "ACTIVE"
			}
		});

		console.log("[Enrollment] Created:", enrollment);
		return res.status(StatusCodes.CREATED).json(enrollment);
	});

export default enrollApiHandler;
