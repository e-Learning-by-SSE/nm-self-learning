import { database } from "@self-learning/database";
import { authProcedure, t } from "../trpc";
import { studentSettingsSchema } from "@self-learning/types";
import * as z from "zod";

export const settingsRouter = t.router({
	getMySetting: authProcedure.query(async ({ ctx }) => {
		return await database.studentSettings.findUnique({
			where: {
				username: ctx.user.name
			}
		});
	}),
	updateSettings: authProcedure
		.input(
			z.object({
				settings: studentSettingsSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const currentSettings = await database.studentSettings.findUnique({
				where: {
					username: ctx.user.name
				}
			});

			if (currentSettings?.hasLearningDiary !== input.settings.hasLearningDiary) {
				await database.eventLog.create({
					data: {
						type: "LTB_TOGGLE",
						payload: { enabled: input.settings.hasLearningDiary },
						username: ctx.user.name
					}
				});
			}

			return await database.studentSettings.upsert({
				where: {
					username: ctx.user.name
				},
				update: {
					learningStatistics: input.settings.learningStatistics,
					hasLearningDiary: input.settings.hasLearningDiary
				},
				create: {
					username: ctx.user.name,
					learningStatistics: input.settings.learningStatistics,
					hasLearningDiary: input.settings.hasLearningDiary
				}
			});
		})
});
