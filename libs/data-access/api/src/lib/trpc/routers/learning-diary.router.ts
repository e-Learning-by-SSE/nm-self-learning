import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import {
	learningDiaryPageSchema,
	learningLocationSchema,
	techniqueRatingSchema,
	lessonStartSchema
} from "@self-learning/types";
import { getDiaryPage, getUserLocations } from "@self-learning/diary";

export const learningLocationRouter = t.router({
	create: authProcedure.input(learningLocationSchema).mutation(async ({ input, ctx }) => {
		if (ctx.user.role !== "USER" && input.defaultLocation) {
			throw new Error("Only Authors or Admins can create default locations");
		}
		return database.learningLocation.create({
			data: {
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
	}),
	findMany: authProcedure.query(async ({ ctx }) => {
		return getUserLocations(ctx.user.name);
	}),
	delete: authProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		return database.learningLocation.delete({
			where: {
				id: input,
				creatorName: ctx.user.name
			}
		});
	})
});

export const learningTechniqueRouter = t.router({
	create: authProcedure.input(techniqueRatingSchema).mutation(async ({ input, ctx }) => {
		return database.techniqueRating.upsert({
			where: {
				evalId: {
					techniqueId: input.learningTechniqueId,
					diaryPageId: input.learningDiaryEntryId
				},
				creatorName: ctx.user.name // security reasons; only allow own evaluations
			},
			update: {
				score: input.score
			},
			create: {
				score: input.score || 0,
				techniqueId: input.learningTechniqueId,
				diaryPageId: input.learningDiaryEntryId,
				creatorName: ctx.user.name
			},
			select: {
				score: true,
				technique: {
					select: {
						id: true,
						name: true,
						strategy: { select: { id: true, name: true } }
					}
				}
			}
		});
	}),
	deleteMany: authProcedure.input(z.array(z.string()).min(1)).mutation(async ({ input, ctx }) => {
		return database.techniqueRating.deleteMany({
			where: {
				creatorName: ctx.user.name,
				id: {
					in: input
				}
			}
		});
	})
});

export const learningDiaryPageRouter = t.router({
	create: authProcedure
		.input(z.object({ courseSlug: z.string() }))
		.mutation(async ({ input, ctx }) => {
			// const ltbEntryThreshold = 1000 * 60 * 6 * 60; // 6 hours
			// const [latestEntry] = await database.$transaction([
			// 	database.learningDiaryPage.findFirst({
			// 		where: {
			// 			studentName: ctx.user.name
			// 		},
			// 		select: { createdAt: true, courseSlug: true },
			// 		orderBy: {
			// 			createdAt: "desc"
			// 		}
			// 	})
			// ]);
			// if (latestEntry?.courseSlug === input.courseSlug) {
			// 	if (new Date().getTime() - latestEntry.date.getTime() < ltbEntryThreshold) {
			// 		return;
			// 	}
			// }
			// return database.learningDiaryPage.create({
			// 	data: {
			// 		student: {
			// 			connect: { username: ctx.user.name }
			// 		},
			// 		course: {
			// 			connect: { slug: input.courseSlug }
			// 		}
			// 	},
			// 	select: { id: true }
			// });
		}),
	update: authProcedure.input(learningDiaryPageSchema).mutation(async ({ input, ctx }) => {
		return database.learningDiaryPage.update({
			where: {
				id: input.id
			},
			data: {
				notes: input.notes,
				scope: input.scope ?? 0, // TODO remove default value
				distractionLevel: input.distractionLevel,
				effortLevel: input.effortLevel,
				learningLocation: input.learningLocation
					? {
							connect: {
								unique_name_creator: {
									name: input.learningLocation.name,
									creatorName: ctx.user.name
								}
							}
						}
					: undefined,
				techniqueRatings: {
					upsert: input.techniqueRatings?.map(technique => ({
						where: {
							evalId: {
								techniqueId: technique.learningTechniqueId,
								diaryPageId: input.id
							}
						},
						update: {
							score: technique.score
						},
						create: {
							score: technique.score,
							techniqueId: technique.learningTechniqueId,
							diaryPageId: input.id,
							creatorName: ctx.user.name
						}
					}))
				}
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
				techniqueRatings: true
			}
		});
	}),
	addLearningDiaryLearnedLessons: authProcedure
		.input(lessonStartSchema)
		.mutation(async ({ input }) => {
			return database.learningDiaryLearnedLessons.create({
				data: { entryId: input.entryId, lessonId: input.lessonId }
			});
		}),
	get: authProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		return getDiaryPage(input.id);
	})
});
