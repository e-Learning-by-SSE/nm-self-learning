import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

export async function allPages(username: string) {
	return await database.learningDiaryPage.findMany({
		select: {
			id: true,
			createdAt: true,
			course: { select: { title: true } }
		},
		where: {
			studentName: username
		},
		orderBy: { createdAt: "asc" }
	});
}

export async function getDiaryPage(ltbId: string) {
	await database.learningDiaryPage.update({
		where: { id: ltbId },
		data: {
			hasRead: true
		}
	});
	const ltbPage = await database.learningDiaryPage.findUnique({
		where: { id: ltbId },
		select: {
			id: true,
			course: {
				select: {
					courseId: true,
					slug: true,
					title: true
				}
			},
			notes: true,
			scope: true,
			distractionLevel: true,
			studentName: true,
			effortLevel: true,
			totalDurationLearnedMs: true,
			learningLocation: {
				select: {
					id: true,
					name: true,
					iconURL: true
				}
			},
			learningGoals: true,
			createdAt: true,
			lessonsLearned: {
				select: {
					lesson: {
						select: {
							lessonId: true,
							title: true,
							slug: true
						}
					},
					createdAt: true
				},
				orderBy: {
					createdAt: "asc"
				}
			},
			techniqueRatings: {
				select: {
					score: true,
					technique: {
						select: {
							id: true
						}
					}
				}
			}
		}
	});
	return ltbPage;
}

export type LearningDiaryPageDetail = ResolvedValue<typeof getDiaryPage>;

export async function getUserLocations(username: string) {
	return database.learningLocation.findMany({
		where: { OR: [{ creatorName: username }, { defaultLocation: true }] },
		select: { id: true, name: true, iconURL: true, defaultLocation: true }
	});
}

export async function getAllStrategies() {
	return database.learningStrategy.findMany({
		select: {
			id: true,
			name: true,
			techniques: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});
}

export type Strategy = ResolvedValue<typeof getAllStrategies>[number];
export type Location = ResolvedValue<typeof getUserLocations>[number];
