import { database } from "@self-learning/database";
import { learningLocationSchema, ResolvedValue } from "@self-learning/types";
import { formatDateToString, getRandomId } from "@self-learning/util/common";
import { authProcedure, t } from "../trpc";

export async function getLearningDiaryEntriesOverview({ username }: { username: string }) {
	const learningDiaryEntries = await database.learningDiaryEntry.findMany({
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
							learningStrategie: { select: { name: true } }
						}
					}
				}
			}
		},
		orderBy: {
			date: "asc"
		}
	});

	const result = learningDiaryEntries.map((entry, index) => {
		return {
			...entry,
			date: formatDateToString(new Date(entry.date)),
			start: new Date(entry.start).toISOString(),
			end: new Date(entry.end).toISOString(),
			number: index + 1,
			duration: new Date(entry.end).getTime() - new Date(entry.start).getTime(),
			learningLocation: entry.learningLocation,
			learningTechniqueEvaluation: entry.learningTechniqueEvaluation
		};
	});

	return result;
}

type Result = ResolvedValue<typeof getLearningDiaryEntriesOverview>;
export type LearningDiaryEntriesOverview = Result[number];

export async function getLearningDiaryInformation({ username }: { username: string }) {
	const learningLocations = await database.learningLocation.findMany({
		where: { OR: [{ creatorName: username }, { defaultLocation: true }] },
		select: { id: true, name: true, iconURL: true }
	});

	const learningTechniques = await database.learningTechnique.findMany({
		where: { OR: [{ creatorName: username }, { defaultTechnique: true }] }
	});

	const learningStrategies = await database.learningStrategie.findMany({
		select: {
			id: true,
			name: true,
			learningTechnique: {
				where: {
					OR: [{ defaultTechnique: true }, { creatorName: username }]
				},
				select: {
					id: true,
					name: true
				}
			}
		}
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
			learningTechniqueEvaluation: true
		}
	});

	const result = learningDiaryEntries.map((entry, index) => {
		return {
			id: entry.id,
			course: {
				id: entry.course.courseId,
				title: entry.course.title,
				slug: entry.course.slug
			},
			date: formatDateToString(new Date(entry.date)),
			number: index + 1,
			scope: entry.scope,
			duration: new Date(entry.end).getTime() - new Date(entry.start).getTime(),
			distractionLvl: entry.distractionLevel,
			effortLevel: entry.effortLevel,
			learningLocation: entry.learningLocation,
			learningTechniqueEvaluation: entry.learningTechniqueEvaluation
		};
	});

	return {
		learningLocations,
		learningTechniques,
		learningStrategies,
		learningDiaryEntries: result
	};
}

export const learningLocationRouter = t.router({
	create: authProcedure.input(learningLocationSchema).mutation(async ({ input, ctx }) => {
		console.log(input.creatorName);

		return await database.learningLocation.create({
			data: {
				id: input.id ?? undefined,
				name: input.name,
				iconURL: input.iconURL,
				creatorName: input.creatorName,
				defaultLocation: false
			},
			select: {
				id: true,
				name: true,
				iconURL: true
			}
		});
	})
});

export type LearningDiaryInformation = ResolvedValue<typeof getLearningDiaryInformation>;
