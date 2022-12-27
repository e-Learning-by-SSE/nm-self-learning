import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const meRouter = t.router({
	permissions: authProcedure.query(({ ctx }) => {
		return database.user.findUnique({
			where: { name: ctx.user.name },
			select: {
				role: true,
				author: {
					select: {
						subjectAdmin: {
							select: {
								subjectId: true
							}
						},
						specializationAdmin: {
							select: {
								specializationId: true
							}
						}
					}
				}
			}
		});
	}),
	updateStudent: authProcedure
		.input(
			z.object({
				displayName: z.string().min(3).max(50)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const updated = await database.student.update({
				where: { username: ctx.user.name },
				data: {
					displayName: input.displayName
				},
				select: {
					username: true,
					displayName: true
				}
			});

			console.log("[meRouter.updateStudent] Student updated", updated);
			return updated;
		})
});
