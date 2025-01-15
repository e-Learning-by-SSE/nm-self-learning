import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import jwt from "jsonwebtoken";

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
				user: z.object({
					displayName: z.string().min(3).max(50)
				})
			})
		)
		.mutation(async ({ ctx, input }) => {
			const updated = await database.user.update({
				where: { name: ctx.user.name },
				data: {
					displayName: input.user.displayName
				},
				select: {
					name: true,
					displayName: true
				}
			});

			console.log("[meRouter.updateStudent] Student updated", updated);
			return updated;
		}),
	getJWTToken: authProcedure.query(async ({ ctx }) => {
		const user = await database.user.findUnique({
			where: { name: ctx.user.name },
			select: {
				name: true,
				role: true
			}
		});

		if (!user) {
			throw new Error("User not found");
		}

		const sharedPrivateKey = "1a1alhi05+wZcfAaPA8R2GTM5ay2xUMsr/DKJJkS6Fw=";

		const token = jwt.sign(
			{
				name: user.name,
				role: user.role
			},
			sharedPrivateKey,
			{
				expiresIn: "1d"
			}
		);
		return token;
	})
});
