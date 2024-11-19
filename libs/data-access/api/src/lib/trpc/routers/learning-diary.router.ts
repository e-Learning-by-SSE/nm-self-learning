import { database } from "@self-learning/database";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import {
	learningDiaryPageSchema,
	learningLocationSchema,
	techniqueRatingSchema,
	lessonStartSchema,
	learningStrategySchema,
	learningTechniqueCreateSchema
} from "@self-learning/types";
import { getAllStrategies, getDiaryPage, getUserLocations } from "@self-learning/diary";

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
	createNewTechnique: authProcedure.input(learningTechniqueCreateSchema).mutation(async ({ input, ctx }) => {
		return database.learningTechnique.create({
			data: {
				name: input.name,
				description: input.description,
				creatorName: ctx.user.name,
				learningStrategieId: input.learningStrategieId
			},
			select: {
				id: true,
				name: true,
				description: true,
			}
		});
	}),
	getAllStrategiesForAUser: authProcedure.query(async ({ctx}) => {
		return database.learningStrategy.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				techniques: {
					// Only fetch techniques that are global or created by the user
					where: { OR: [{ creatorName: null }, { creatorName: ctx.user.name }] },
					select: {
						id: true,
						description: true,
						name: true
					}
				}
			}
		});
		
	}),
	upsert: authProcedure.input(techniqueRatingSchema).mutation(async ({ input, ctx }) => {
		return database.techniqueRating.upsert({
			where: {
				evalId: {
					techniqueId: input.id,
					diaryPageId: input.id // TODO hier muss die richtige id hin
				},
				creatorName: ctx.user.name // security reasons; only allow own evaluations
			},
			update: {
				score: input.score
			},
			create: {
				score: input.score || 0,
				techniqueId: input.id,
				diaryPageId: input.id, // TODO hier muss die richtige id hin
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
	})
});

export const learningDiaryPageRouter = t.router({
	create: authProcedure
		.input(z.object({ courseSlug: z.string(), date: z.date().optional() }))
		.mutation(async ({ input, ctx }) => {
			const ltbEntryThreshold = 1000 * 60 * 6 * 60; // 6 hours
			const [latestEntry] = await database.$transaction([
				database.learningDiaryPage.findFirst({
					where: {
						studentName: ctx.user.name
					},
					select: { createdAt: true, courseSlug: true, id: true },
					orderBy: {
						createdAt: "desc"
					}
				})
			]);
			if (latestEntry?.courseSlug === input.courseSlug) {
				// Reset hasRead flag if the user updates the learning diary
				database.learningDiaryPage.update({
					where: {
						id: latestEntry.id
					},
					data: {
						hasRead: false
					}
				});
				if (new Date().getTime() - latestEntry.createdAt.getTime() < ltbEntryThreshold) {
					return;
				}
			}
			return database.learningDiaryPage.create({
				data: {
					student: {
						connect: { username: ctx.user.name }
					},
					course: {
						connect: { slug: input.courseSlug }
					},
					createdAt: input.date
				},
				select: { id: true }
			});
		}),
	update: authProcedure.input(learningDiaryPageSchema).mutation(async ({ input, ctx }) => {
		const ratings = input.techniqueRatings;

		if (ratings) {
			await Promise.all(
				ratings.map(rating => {
					return database.techniqueRating.upsert({
						where: {
							evalId: {
								techniqueId: rating.id,
								diaryPageId: input.id
							}
						},
						update: {
							score: rating.score,
							creatorName: ctx.user.name
						},
						create: {
							score: rating.score,
							techniqueId: rating.id,
							diaryPageId: input.id,
							creatorName: ctx.user.name
						}
					});
				})
			);
		}

		return database.learningDiaryPage.update({
			where: {
				id: input.id
			},
			data: {
				isDraft: false,
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
				learningGoals: {
					connect: input.learningGoals
						?.filter(goal => goal.id)
						.map(goal => ({
							id: goal.id
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
				data: {
					entryId: input.entryId,
					lessonId: input.lessonId,
					createdAt: input.createdAt ?? new Date()
				}
			});
		}),
	get: authProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		await database.learningDiaryPage.update({
			where: {
				id: input.id
			},
			data: {
				hasRead: true
			}
		});

		return getDiaryPage(input.id);
	}),
	updateStrategy: adminProcedure.input(learningStrategySchema).mutation(async ({ input }) => {
		return database.learningStrategy.upsert({
			where: {
				id: input.id
			},
			update: {
				...input
			},
			create: {
				...input
			}
		});
	})
});
