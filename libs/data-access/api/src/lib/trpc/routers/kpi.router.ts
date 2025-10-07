import { authProcedure, t } from "../trpc";
import { z } from "zod";
import {
	getUserTotalLearningTime,
	getUserDailyLearningTime,
	getUserDailyQuizStats,
	getUserTotalLearningTimeByCourse
} from "@self-learning/database";

export const KPIRouter = t.router({
	getUserTotalLearningTime: authProcedure
		.input(z.string().optional())
		.query(async ({ ctx, input }) => {
			const userId = input ?? ctx.user.id; // use input if provided, else current user
			return getUserTotalLearningTime(userId);
		}),
	getUserDailyLearningTime: authProcedure
		.input(z.string().optional())
		.query(async ({ ctx, input }) => {
			const userId = input ?? ctx.user.id; // use input if provided, else current user
			return getUserDailyLearningTime(userId);
		}),
	getUserDailyQuizStats: authProcedure
		.input(z.string().optional())
		.query(async ({ ctx, input }) => {
			const userId = input ?? ctx.user.id; // use input if provided, else current user
			return getUserDailyQuizStats(userId);
		}),
	getUserTotalLearningTimeByCourse: authProcedure
		.input(z.string().optional())
		.query(async ({ ctx, input }) => {
			const userId = input ?? ctx.user.id; // use input if provided, else current user
			return getUserTotalLearningTimeByCourse(userId);
		})
});
