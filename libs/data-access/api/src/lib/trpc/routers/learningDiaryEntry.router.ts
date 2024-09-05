import { database } from "@self-learning/database";
import {
	learningDiaryEntrySchema,
	learningLocationSchema,
	learningTechniqueEvaluationSchema,
	ResolvedValue
} from "@self-learning/types";
import { formatDateToString } from "@self-learning/util/common";
import { authProcedure, t } from "../trpc";
import { TRPCError } from "@trpc/server";

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

import { z } from "zod"; // Import zod for schema validation

export const learningTechniqueEvaluationRouter = t.router({
	create: authProcedure
		.input(learningTechniqueEvaluationSchema)
		.mutation(async ({ input, ctx }) => {
			const existingEvaluation = await database.learningTechniqueEvaluation.findFirst({
				where: {
					learningTechniqueId: input.learningTechniqueId,
					learningDiaryEntryId: input.learningDiaryEntryId
				}
			});

			if (existingEvaluation) {
				return await database.learningTechniqueEvaluation.update({
					where: { id: existingEvaluation.id },
					data: {
						score: input.score || 0
					},
					select: {
						score: true,
						learningTechnique: {
							select: {
								id: true,
								name: true,
								learningStrategie: { select: { id: true, name: true } }
							}
						}
					}
				});
			}

			return await database.learningTechniqueEvaluation.create({
				data: {
					id: input.id ?? undefined,
					score: input.score || 0,
					learningTechniqueId: input.learningTechniqueId,
					learningDiaryEntryId: input.learningDiaryEntryId,
					creatorName: ctx.user.name
				},
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
			});
		}),
	deleteMany: authProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		if (input.length === 0) {
			throw new Error("At least one id must be provided for deletion");
		}

		return await database.learningTechniqueEvaluation.deleteMany({
			where: {
				creatorName: ctx.user.name,
				id: {
					in: input
				}
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
				learningLocationId: input.learningLocationId ? input.learningLocationId : null
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

export type LearningTechniqueEvaluation =
	LearningDiaryInformation["learningDiaryEntries"][number]["learningTechniqueEvaluation"][number];

export type LearningStrategy = LearningDiaryInformation["learningStrategies"][number];

export type LearningTechnique = LearningDiaryInformation["learningTechniques"][number];
