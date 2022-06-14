import { database } from "@self-learning/database";
import { QuizAttemptsInfoResponse } from "@self-learning/quiz";
import { apiHandler } from "@self-learning/util/http";
import { NextApiHandler } from "next";
import * as yup from "yup";

const getAttemptsApiHandler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "GET", async () => {
		const username = yup.string().required().validateSync(req.query.username);
		const lessonId = yup.string().required().validateSync(req.query.lessonId);

		const attempts = await getAllAttempts(username, lessonId);

		let completed = 0;
		let withErrors = 0;

		for (const attempt of attempts) {
			if (attempt.state === "COMPLETED") completed++;
			if (attempt.state === "HAS_ERRORS") withErrors++;
		}

		const result: QuizAttemptsInfoResponse = {
			hasCompletedLesson: completed > 0,
			count: { completed, withErrors }
		};

		return res.status(200).json(result);
	});

export default getAttemptsApiHandler;

export async function getAllAttempts(username: string, lessonId: string) {
	return database.quizAttempt.findMany({
		where: {
			AND: { username, lessonId }
		}
	});
}
