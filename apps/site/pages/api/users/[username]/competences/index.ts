import { database } from "@self-learning/database";
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
		return res.status(400).json({
			error: "[username] must be a string."
		});
	}

	switch (req.method) {
		case "GET": {
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
			return res.status(200).json(competencesById);
		}
		default: {
			res.status(405).end(`Method ${req.method} Not Allowed`);
		}
	}
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
