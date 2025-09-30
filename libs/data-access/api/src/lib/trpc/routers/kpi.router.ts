import { authProcedure, t } from "../trpc";
import { z } from "zod";
import { getTotalTimeByIdInSeconds } from "@self-learning/database";

export const KPIRouter = t.router({
	getTotalTimeByIdInSeconds: authProcedure.input(z.string().optional()).query(async ({ ctx, input }) => {
		const userId = input ?? ctx.user.id; // use input if provided, else current user
		return getTotalTimeByIdInSeconds(userId);
	})
});
