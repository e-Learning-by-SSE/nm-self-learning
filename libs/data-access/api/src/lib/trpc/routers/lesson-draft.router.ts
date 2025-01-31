import { lessonDraftSchema } from "@self-learning/types";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { z } from "zod";

export const lessonDraftRouter = t.router({
	create: authProcedure.input(lessonDraftSchema).mutation(async ({ input, ctx }) => {
		const data = {
			...input,
			content: input.content ?? "",
			quiz: input.quiz ?? undefined,
			license: input.license ?? undefined,
			teachingGoals: input.teachingGoals ?? undefined,
			requirements: input.requirements ?? undefined,
			authors: input.authors ?? [],
			owner: input.owner ?? undefined
		};
		await database.lessonDraft.create({
			data: data
		});
	}),
	getByOwner: authProcedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
		const username = input.username;
		const drafts = await database.lessonDraft.findMany({
			where: {
				owner: {
					path: ["username"],
					equals: username
				}
			},
			select: {
				id: true,
				title: true,
				lessonId: true,
				createdAt: true
			}
		});
		return drafts;
	}),
	delete: authProcedure.input(z.object({ draftId: z.string() })).mutation(async ({ input }) => {
		try {
			const deletedDraft = await database.lessonDraft.delete({
				where: { id: input.draftId }
			});

			return {
				success: true,
				message: "Draft successfully deleted.",
				draft: deletedDraft
			};
		} catch (err) {
			console.error("Error while deleting draft: ", err);
		}
	}),
	upsert: authProcedure.input(lessonDraftSchema).mutation(async ({ input, ctx }) => {
		const lessonId = input.lessonId;
		const draftData = {
			...input,
			content: input.content ?? "",
			quiz: input.quiz ?? undefined,
			license: input.license ?? undefined,
			teachingGoals: input.teachingGoals ?? undefined,
			requirements: input.requirements ?? undefined,
			authors: input.authors ?? [],
			owner: input.owner ?? undefined
		};
		const user = input.owner;
		console.log("\nUser is ", user);
		const existingDraft = lessonId
			? await database.lessonDraft.findFirst({
					where: {
						lessonId: lessonId,
						owner: {
							path: ["username"],
							equals: user.username
						}
					}
				})
			: null;

		if (existingDraft) {
			console.log("updating a new draft");
			return await database.lessonDraft.update({
				where: { id: existingDraft.id },
				data: {
					...draftData,
					updatedAt: new Date()
				}
			});
		} else {
			console.log("createing a new draft");
			return await database.lessonDraft.create({
				data: {
					...draftData,
					lessonId: lessonId ?? null,
					owner: user,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});
		}
	})
});
