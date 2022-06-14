import { database } from "@self-learning/database";
import { MethodNotAllowed, withApiError } from "@self-learning/util/http";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

type AchievedCompetenceDbResult = {
	lessonSlug: string;
	achievedAt: Date;
	competence: {
		competenceId: string;
	};
}[];

type AchievedCompetenceResponse = {
	[competenceId: string]: {
		lessonSlug: string;
		achievedAt: Date;
	}[];
};

export const getCompetencesOfUserApiHandler: NextApiHandler = async (req, res) => {
	const { username } = req.query;

	if (typeof username !== "string") {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: "[username] must be a string."
		});
	}

	if (req.method !== "GET") {
		return withApiError(res, MethodNotAllowed(req.method));
	}

	const achievedCompetences: AchievedCompetenceDbResult =
		await database.achievedCompetence.findMany({
			where: { username },
			select: {
				competence: {
					select: {
						competenceId: true
					}
				},
				lessonSlug: true,
				achievedAt: true
			}
		});

	const competencesById = mapCompetencesById(achievedCompetences);

	return res.status(StatusCodes.OK).json(competencesById);
};

export default getCompetencesOfUserApiHandler;

function mapCompetencesById(competences: AchievedCompetenceDbResult) {
	const map: AchievedCompetenceResponse = {};

	for (const competence of competences) {
		const {
			lessonSlug,
			achievedAt,
			competence: { competenceId }
		} = competence;
		if (competenceId in map) {
			map[competenceId].push({ achievedAt, lessonSlug });
		} else {
			map[competenceId] = [{ achievedAt, lessonSlug }];
		}
	}

	return map;
}
