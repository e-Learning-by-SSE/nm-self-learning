import { database, updateLearningDiaryEntry } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import {
	learningDiaryPageSchema,
	learningLocationSchema,
	techniqueEvaluationSchema,
	lessonStartSchema
} from "@self-learning/types";

// export const learningDiaryRouter = t.router({
// 	setGoals: authProcedure
// 		.input(
// 			z.object({
// 				goals: z.string()
// 			})
// 		)
// 		.mutation(async ({ ctx, input }) => {
// 			return database.learningDiary.update({
// 				where: { username: ctx.user.name },
// 				data: { goals: input.goals },
// 				select: { goals: true }
// 			});
// 		})
// });

export const learningLocationRouter = t.router({
	create: authProcedure.input(learningLocationSchema).mutation(async ({ input, ctx }) => {
		return database.learningLocation.create({
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

export const learningTechniqueEvaluationRouter = t.router({
	create: authProcedure.input(techniqueEvaluationSchema).mutation(async ({ input, ctx }) => {
		const existingEvaluation = await database.learningTechniqueEvaluation.findFirst({
			where: {
				learningTechniqueId: input.learningTechniqueId,
				learningDiaryEntryId: input.learningDiaryEntryId
			}
		});

		if (existingEvaluation) {
			return database.learningTechniqueEvaluation.update({
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

		return database.learningTechniqueEvaluation.create({
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
	deleteMany: authProcedure.input(z.array(z.string()).min(1)).mutation(async ({ input, ctx }) => {
		return database.learningTechniqueEvaluation.deleteMany({
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
	create: authProcedure
		.input(z.object({ courseSlug: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const ltbEntryThreshold = 1000 * 60 * 6 * 60; // 6 hours

			const [latestEntry] = await database.$transaction([
				database.learningDiaryPage.findFirst({
					where: {
						studentName: ctx.user.name
					},
					select: { createdAt: true, courseSlug: true },
					orderBy: {
						createdAt: "desc"
					}
				})
			]);

			if (latestEntry?.courseSlug === input.courseSlug) {
				if (new Date().getTime() - latestEntry.date.getTime() < ltbEntryThreshold) {
					return;
				}
			}

			return database.learningDiaryEntry.create({
				data: {
					semester: {
						connect: { id: semester?.id ?? "" }
					},
					student: {
						connect: { username: ctx.user.name }
					},
					course: {
						connect: { slug: input.courseSlug }
					},
					date: new Date(),
					start: null,
					end: null
				},
				select: { id: true }
			});
		}),
	update: authProcedure.input(learningDiaryPageSchema).mutation(async ({ input }) => {
		return updateLearningDiaryEntry({ id: input.id, input });
	}),
	addLearningDiaryLearnedLessons: authProcedure
		.input(lessonStartSchema)
		.mutation(async ({ input }) => {
			return database.learningDiaryLearnedLessons.create({
				data: { entryId: input.entryId, lessonId: input.lessonId }
			});
		})
});
