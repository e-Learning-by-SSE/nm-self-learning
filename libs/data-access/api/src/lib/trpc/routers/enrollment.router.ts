import { disenrollUser, enrollUser, getEnrollmentsOfUser } from "@self-learning/enrollment";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const enrollmentRouter = t.router({
	getEnrollments: authProcedure.query(async ({ ctx }) => {
		return getEnrollmentsOfUser(ctx.user.name);
	}),
	enroll: authProcedure
		.input(
			z.object({
				courseId: z.string()
			})
		)
		.mutation(({ ctx, input }) => {
			return enrollUser({
				courseId: input.courseId,
				username: ctx.user.name
			});
		}),
	disenroll: authProcedure
		.input(
			z.object({
				courseId: z.string()
			})
		)
		.mutation(({ ctx, input }) => {
			return disenrollUser({
				courseId: input.courseId,
				username: ctx.user.name
			});
		})
});
