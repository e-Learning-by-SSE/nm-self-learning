import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

export async function findLtbPage(ltbId: string) {
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
			learningDurationMs: true,
			learningLocation: {
				select: {
					id: true,
					name: true,
					iconURL: true
				}
			},
			learningGoals: true,
			createdAt: true,
			learningTechniqueEvaluation: {
				select: {
					id: true,
					score: true,
					learningTechnique: {
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
export type LearningDiaryPageDetail = ResolvedValue<typeof findLtbPage>;

// async function findManyDiaryPages(username: string) {
// 	const learningDiaryEntries = await database.learningDiaryPage.findMany({
// 		where: { studentName: username },
// 		select: {
// 			id: true,
// 			course: {
// 				select: {
// 					courseId: true,
// 					slug: true,
// 					title: true
// 				}
// 			},
// 			notes: true,
// 			scope: true,
// 			distractionLevel: true,
// 			effortLevel: true,
// 			learningLocation: {
// 				select: {
// 					id: true,
// 					name: true,
// 					iconURL: true
// 				}
// 			},
// 			learningGoals: true,
// 			createdAt: true,
// 			learningTechniqueEvaluation: {
// 				select: {
// 					id: true,
// 					score: true,
// 					learningTechnique: {
// 						select: {
// 							id: true
// 						}
// 					}
// 				}
// 			}
// 		},
// 		orderBy: {
// 			createdAt: "asc"
// 		}
// 	});
// 	return learningDiaryEntries.map(entry => ({ ...entry, duration: 0 })); // temporary fix
// }

export async function getUserLocations(username: string) {
	return database.learningLocation.findMany({
		where: { OR: [{ creatorName: username }, { defaultLocation: true }] },
		select: { id: true, name: true, iconURL: true }
	});
}

export async function getAllStrategies() {
	return database.learningStrategie.findMany({
		select: {
			id: true,
			name: true,
			learningTechnique: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});
}

type WithMandatoryID<T extends { id?: any }> = Required<Pick<T, "id">> & Partial<Omit<T, "id">>;

export function updateLearningDiaryEntry({
	input
}: {
	input: WithMandatoryID<Prisma.LearningDiaryPageUpdateInput>;
}) {
	return database.learningDiaryPage.update({
		where: {
			id: input.id
		},
		data: {
			...input
		},
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
			date: true,
			start: true,
			end: true,
			scope: true,
			distractionLevel: true,
			effortLevel: true,
			learningLocation: {
				select: {
					id: true,
					name: true,
					iconURL: true
				}
			},
			learningGoals: true,
			learningTechniqueEvaluation: true
		}
	});
}
