import { lessonDraftSchema } from "@self-learning/types";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { z } from "zod";

// TODO: who is allowed to create drafts -> authors (not admin)?
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
	getByLessonId: authProcedure
		.input(z.object({ lessonId: z.string() }))
		.query(async ({ input }) => {
			const { lessonId } = input;

			const lessonDrafts = await database.lessonDraft.findMany({
				where: { lessonId }
			});

			return lessonDrafts;
		}),
	findOne: authProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		return database.lessonDraft.findUniqueOrThrow({
			where: { id: input.id },
			select: {
				id: true,
				title: true,
				subtitle: true,
				lessonId: true,
				slug: true,
				description: true,
				imgUrl: true,
				authors: true,
				lessonType: true,
				licenseId: true,
				selfRegulatedQuestion: true,
				content: true,
				requirements: true,
				teachingGoals: true
			}
		});
	}),
	// TODO: do we need this?
	getByAuthor: authProcedure
		.input(z.object({ username: z.string() }))
		.query(async ({ input }) => {
			const username = input.username;
			const lessonDrafts = await database.lessonDraft.findMany({
				where: {
					authors: {
						array_contains: [{ username }]
					}
				},
				select: {
					id: true,
					title: true,
					lessonId: true,
					createdAt: true
				}
			});
			return lessonDrafts;
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
	})
});
