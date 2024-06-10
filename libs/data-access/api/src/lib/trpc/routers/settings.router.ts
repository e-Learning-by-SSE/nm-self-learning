import { database } from "@self-learning/database";
import { t } from "../trpc";
import { studentSettingsSchema } from "@self-learning/types";
import * as z from "zod";

export const settingsRouter = t.router({
	updateSettings: t.procedure
		.input(
			z.object({
				username: z.string(),
				settings: studentSettingsSchema
			})
		)
		.mutation(async ({ input }) => {
			return await database.studentSettings.update({
				where: {
					username: input.username
				},
				data: {
					learningStatistics: input.settings.learningStatistics,
					hasLearningDiary: input.settings.hasLearningDiary
				}
			});
		})
});
