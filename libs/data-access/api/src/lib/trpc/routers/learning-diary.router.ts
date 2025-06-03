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
	createNewTechnique: authProcedure
		.input(learningTechniqueCreateSchema)
		.mutation(async ({ input, ctx }) => {
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
					description: true
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

			const transactionResult = await database.$transaction(async prisma => {
				let latestEntry = await prisma.learningDiaryPage.findFirst({
					where: {
						studentName: ctx.user.name
					},
					select: { createdAt: true, courseSlug: true, id: true },
					orderBy: {
						createdAt: "desc"
					}
				});

				if (latestEntry?.courseSlug === input.courseSlug) {
					latestEntry = await prisma.learningDiaryPage.update({
						where: {
							id: latestEntry.id
						},
						data: {
							hasRead: false
						}
					});

					if (
						new Date().getTime() - latestEntry.createdAt.getTime() <
						ltbEntryThreshold
					) {
						return latestEntry;
					}
				}

				return prisma.learningDiaryPage.create({
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
			});

			return transactionResult;
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

		// get location ID (ensure that global and personal locations are taken into account)
		let locationID: string | undefined;
		if (input.learningLocation) {
			// Try to find personalized case
			const existingLocation = await database.learningLocation.findUnique({
				where: {
					unique_name_creator: {
						name: input.learningLocation.name,
						creatorName: ctx.user.name
					}
				},
				select: {
					id: true
				}
			});
			if (existingLocation) {
				locationID = existingLocation.id;
			} else {
				// Try to find generalized case
				const existingLocation = await database.learningLocation.findFirst({
					where: {
						name: input.learningLocation.name,
						creatorName: null
					},
					select: {
						id: true
					}
				});
				if (existingLocation) {
					locationID = existingLocation.id;
				}
			}
		}
		// Determine if is completed
		const isDraft = !(
			(input.distractionLevel ?? 0) > 0 &&
			(input.effortLevel ?? 0) > 0 &&
			locationID &&
			(input.learningGoals?.length ?? 0) > 0 &&
			(input.techniqueRatings?.length ?? 0) > 0
		);

		return database.learningDiaryPage.update({
			where: {
				id: input.id
			},
			data: {
				isDraft: isDraft,
				notes: input.notes,
				scope: input.scope ?? 0, // TODO remove default value
				distractionLevel: input.distractionLevel,
				effortLevel: input.effortLevel,
				learningLocation:
					input.learningLocation && locationID
						? {
								connect: {
									id: locationID
								}
							}
						: undefined,
				learningGoals: {
					connect: input.learningGoals
						?.filter(goal => goal.id)
						.map(goal => ({
							id: goal.id
						}))
				},
				techniqueRatings: {
					connect:
						input.techniqueRatings
							?.filter(rating => rating.id)
							.map(rating => ({
								evalId: { techniqueId: rating.id, diaryPageId: input.id }
							})) ?? []
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
