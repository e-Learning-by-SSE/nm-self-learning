import { database } from "@self-learning/database";
import { submitAnswerSchema } from "@self-learning/quiz";
import { apiHandler, Forbidden, Unauthorized } from "@self-learning/util/http";
import { NextApiHandler, NextApiRequest } from "next";
import { getSession } from "next-auth/react";
import * as yup from "yup";

const submitAnswersApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		const lessonId = yup.string().required().validateSync(req.query.lessonId);
		const usernameFromSession = await requireAuthentication(req);

		const username = await requireAuthentication(req);

		if (usernameFromSession !== username) {
			throw Forbidden("Username did not match username of caller.");
		}

		const { answers, state } = submitAnswerSchema.validateSync(req.body);

		const result = await database.quizAttempt.create({
			data: {
				username,
				lessonId,
				state
			}
		});

		console.log(
			`[submitAnswersApiHandler]: User [${username}] submitted answers for lesson [${lessonId}].`
		);

		return res.status(201).json(result);
	});

export default submitAnswersApiHandler;

async function requireAuthentication(req: NextApiRequest) {
	const session = await getSession({ req });

	if (!session) {
		throw Unauthorized();
	}

	return session.user!.name as string;
}
