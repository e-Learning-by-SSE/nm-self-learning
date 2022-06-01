import { database } from "@self-learning/database";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
	const { username, courseSlug } = req.query;
	if (typeof username !== "string") {
		throw new Error("[username] must be a string");
	}

	if (typeof courseSlug !== "string") {
		throw new Error("[courseSlug] must be a string");
	}

	switch (req.method) {
		case "POST": {
			const enrollment = await database.enrollment.create({
				data: {
					courseId: courseSlug,
					username: username,
					status: "ACTIVE"
				}
			});

			console.log("[Enrollment] Created:", enrollment);
			return res.status(StatusCodes.CREATED).json(enrollment);
		}
		case "DELETE": {
			const enrollment = await database.enrollment.delete({
				where: {
					courseId_username: {
						courseId: courseSlug,
						username: username
					}
				}
			});

			console.log("[Enrollment] Deleted:", enrollment);
			return res.status(StatusCodes.OK).json({
				message: "Enrollment deleted.",
				enrollment
			});
		}
		default: {
			res.send(405);
		}
	}
};

export default handler;
