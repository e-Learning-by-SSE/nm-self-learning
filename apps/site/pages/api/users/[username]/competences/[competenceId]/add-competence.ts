import { database } from "@self-learning/database";
import {
	AlreadyExists,
	ApiError,
	MethodNotAllowed,
	validationConfig,
	ValidationFailed,
	withApiError
} from "@self-learning/util/validation";
import { NextApiHandler } from "next";
import * as yup from "yup";

const querySchema = yup.object({
	username: yup.string().required(),
	competenceId: yup.string().required()
});

const bodySchema = yup
	.object({
		lessonSlug: yup.string().required()
	})
	.typeError("Request body must be an object with the following keys: lessonSlug");

export const addCompetenceApiHandler: NextApiHandler = async (req, res) => {
	try {
		const { username, competenceId } = querySchema.validateSync(req.query, validationConfig);
		const { lessonSlug } = bodySchema.validateSync(req.body, validationConfig);

		if (req.method !== "POST") {
			throw MethodNotAllowed(req.method);
		}

		const alreadyExists = await database.achievedCompetence.findUnique({
			where: {
				lessonSlug_competenceId_username: {
					competenceId,
					username,
					lessonSlug
				}
			}
		});

		if (alreadyExists) {
			throw AlreadyExists("User already has achieved this competence from this lesson.", {
				username,
				competenceId,
				lessonSlug
			});
		}
	} catch (error) {
		if (error instanceof ApiError) {
			return withApiError(res, error);
		}
		if (error instanceof yup.ValidationError) {
			return withApiError(res, ValidationFailed(error.errors));
		}
	}
};

export default addCompetenceApiHandler;
