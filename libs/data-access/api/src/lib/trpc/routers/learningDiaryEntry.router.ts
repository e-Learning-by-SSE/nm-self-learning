import { database } from "@self-learning/database";
import {
	learningDiaryEntrySchema,
	learningLocationSchema,
	ResolvedValue
} from "@self-learning/types";
import { formatDateToString } from "@self-learning/util/common";
import { authProcedure, t } from "../trpc";

export async function getLearningDiaryEntriesOverview({ username }: { username: string }) {
	let learningDiaryEntries = await database.learningDiaryEntry.findMany({
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
		}
	});

	learningDiaryEntries = learningDiaryEntries
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.reverse();

	console.log(learningDiaryEntries);

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

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type LearningDiaryEntriesOverview = ArrayElement<
	Awaited<ResolvedValue<typeof getLearningDiaryEntriesOverview>>
>;

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
		},
		orderBy: {
			date: "asc"
		}
	});

	const result = learningDiaryEntries.map((entry, index) =>
		createLearningDiaryEntry(entry, index)
	);

	return {
		learningLocations,
		learningTechniques,
		learningStrategies,
		learningDiaryEntries: result
	};
}

function createLearningDiaryEntry(entry: any, index: number) {
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
		notes: entry.notes,
		duration: new Date(entry.end).getTime() - new Date(entry.start).getTime(),
		distractionLevel: entry.distractionLevel,
		effortLevel: entry.effortLevel,
		learningLocation: entry.learningLocation,
		learningTechniqueEvaluation: entry.learningTechniqueEvaluation
	};
}

export type LearningDiaryEntryResult = ResolvedValue<typeof createLearningDiaryEntry>;

export const learningLocationRouter = t.router({
	create: authProcedure.input(learningLocationSchema).mutation(async ({ input, ctx }) => {
		return await database.learningLocation.create({
			data: {
				id: input.id ?? undefined,
				name: input.name,
				iconURL: input.iconURL,
				creatorName: ctx.user.name,
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

export const learningDiaryEntryRouter = t.router({
	create: authProcedure.input(learningDiaryEntrySchema).mutation(async ({ input, ctx }) => {
		if (
			!input.semesterId ||
			!input.studentName ||
			!input.courseSlug ||
			!input.start ||
			!input.end
		) {
			throw new Error("semesterId, studentName, and courseSlug must be defined");
		}

		return await database.learningDiaryEntry.create({
			data: {
				semesterId: input.semesterId,
				studentName: input.studentName,
				courseSlug: input.courseSlug,
				notes: input.notes ?? "",
				date: input.date ?? new Date(),
				start: input.start,
				end: input.end,
				scope: input.scope ?? 0,
				distractionLevel: input.distractionLevel ?? 1,
				effortLevel: input.effortLevel ?? 1,
				learningLocationId: input.learningLocationId ?? null
			},
			select: {
				id: true,
				semesterId: true,
				studentName: true,
				courseSlug: true,
				notes: true,
				date: true,
				start: true,
				end: true,
				scope: true,
				distractionLevel: true,
				effortLevel: true,
				learningLocationId: true
			}
		});
	}),
	update: authProcedure.input(learningDiaryEntrySchema).mutation(async ({ input, ctx }) => {
		if (!input.id) {
			throw new Error("id must be defined for update");
		}

		return await database.learningDiaryEntry.update({
			where: {
				id: input.id
			},
			data: {
				notes: input.notes ?? "",
				distractionLevel: input.distractionLevel ?? 1,
				effortLevel: input.effortLevel ?? 1,
				learningLocationId: input.learningLocationId ?? null
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
	})
});

export type LearningDiaryInformation = ResolvedValue<typeof getLearningDiaryInformation>;
