import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

export async function findMandyLtb({ username }: { username: string }) {
	return database.learningDiaryEntry.findMany({
		where: { studentName: username },
		select: {
			id: true,
			date: true,
			start: true,
			end: true,
			scope: true,
			course: { select: { title: true, slug: true, authors: true } },
			learningLocation: { select: { name: true } },
			learningTechniqueEvaluation: {
				select: {
					learningTechnique: {
						select: {
							name: true,
							learningStrategie: { select: { id: true, name: true } }
						}
					}
				}
			}
		},
		orderBy: {
			date: "asc"
		}
	});
}

export type LearningDiaryShort = ResolvedValue<typeof findMandyLtb>[number];

export async function findManyLtbDetails({ username }: { username: string }) {
	const learningLocations = await database.learningLocation.findMany({
		where: { OR: [{ creatorName: username }, { defaultLocation: true }] },
		select: { id: true, name: true, iconURL: true }
	});

	const learningTechniques = await database.learningTechnique.findMany({
		where: { OR: [{ creatorName: username }, { defaultTechnique: true }] },
		select: {
			id: true,
			name: true,
			learningStrategie: { select: { id: true, name: true } }
		}
	});

	const learningStrategies = await database.learningStrategie.findMany({
		select: { id: true, name: true }
	});

	const learningDiaryEntries = await database.learningDiaryEntry.findMany({
		where: { studentName: username },
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
			learningTechniqueEvaluation: {
				select: {
					id: true,
					score: true,
					learningTechnique: {
						select: {
							id: true,
							name: true,
							learningStrategie: { select: { id: true, name: true } }
						}
					}
				}
			}
		},
		orderBy: {
			date: "asc"
		}
	});
	return {
		learningLocations,
		learningTechniques,
		learningStrategies,
		learningDiaryEntries
	};
}

export type LearningDiaryEntry = ResolvedValue<typeof findManyLtbDetails>;

export function updateLearningDiaryEntry({
	input,
	id
}: {
	id: string;
	input: Omit<Prisma.LearningDiaryEntryUncheckedUpdateInput, "id">;
}) {
	return database.learningDiaryEntry.update({
		where: {
			id: id
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
