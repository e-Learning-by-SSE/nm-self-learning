import { LessonContent, LessonDraft, lessonDraftSchema } from "@self-learning/types";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { z } from "zod";
import { Quiz } from "@self-learning/quiz";
import { Prisma } from "@prisma/client";

export const lessonDraftRouter = t.router({
	create: authProcedure.input(lessonDraftSchema).mutation(async ({ input }) => {
		const data = {
			...input,
			content: input.content ?? "",
			quiz: input.quiz ?? undefined,
			license: input.license ?? undefined,
			provides: input.provides ?? undefined,
			requires: input.requires ?? undefined,
			authors: input.authors ?? [],
			owner: input.owner ?? undefined
		};
		await database.lessonDraft.create({
			data: data
		});
	}),
	getByOwner: authProcedure
		.input(z.object({ username: z.string() }))
		.query(async ({ input }): Promise<LessonDraft[]> => {
			const username = input.username;
			const drafts = await database.lessonDraft.findMany({
				where: {
					owner: {
						path: ["username"],
						equals: username
					}
				}
			});
			return drafts.map(draft => ({
				id: draft.id,
				lessonId: draft.lessonId ?? null,
				slug: draft.slug ?? "",
				title: draft.title ?? "",
				subtitle: draft.subtitle,
				description: draft.description,
				imgUrl: draft.imgUrl,
				authors: Array.isArray(draft.authors) ? draft.authors : [JSON.parse("[]")],
				owner:
					typeof draft.owner === "object" &&
					draft.owner !== null &&
					"username" in draft.owner
						? { username: String(draft.owner.username) }
						: { username: "" },

				licenseId: draft.licenseId,
				requires: Array.isArray(draft.requires) ? draft.requires : [JSON.parse("[]")],
				provides: Array.isArray(draft.provides) ? draft.provides : JSON.parse("[]"),
				content: (draft.content ?? []) as LessonContent,
				quiz: draft.quiz as Quiz,
				lessonType: draft.lessonType ?? "TRADITIONAL",
				selfRegulatedQuestion: draft.selfRegulatedQuestion,
				createdAt: draft.createdAt,
				updatedAt: draft.updatedAt
			}));
		}),
	getById: authProcedure
		.input(z.object({ draftId: z.string() }))
		.query(async ({ input }): Promise<LessonDraft | null> => {
			const draftId = input.draftId;
			const draft = await database.lessonDraft.findUnique({
				where: {
					id: draftId
				}
			});
			if (draft) {
				return {
					id: draft.id,
					lessonId: draft.lessonId,
					slug: draft.slug ?? "",
					title: draft.title ?? "",
					subtitle: draft.subtitle,
					description: draft.description,
					imgUrl: draft.imgUrl,
					authors: Array.isArray(draft.authors) ? draft.authors : [JSON.parse("[]")],
					owner:
						typeof draft.owner === "object" &&
						draft.owner !== null &&
						"username" in draft.owner
							? { username: String(draft.owner.username) }
							: { username: "" },

					licenseId: draft.licenseId,
					requires: Array.isArray(draft.requires) ? draft.requires : [JSON.parse("[]")],
					provides: Array.isArray(draft.provides) ? draft.provides : JSON.parse("[]"),
					content: (draft.content ?? []) as LessonContent,
					quiz: draft.quiz as Quiz,
					lessonType: draft.lessonType ?? "TRADITIONAL",
					selfRegulatedQuestion: draft.selfRegulatedQuestion
				};
			}
			return null;
		}),
	getOverviewByOwner: authProcedure
		.input(z.object({ username: z.string() }))
		.query(async ({ input }) => {
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
	upsert: authProcedure.input(lessonDraftSchema).mutation(async ({ input }) => {
		const lessonId = input.lessonId;
		const user = input.owner;
		const draftId = input.id;
		const draftData = {
			...input,
			content: input.content ? (input.content as Prisma.InputJsonArray) : undefined,
			quiz: input.quiz ? (input.quiz as Prisma.JsonObject) : undefined,
			license: input.license ?? undefined,
			provides: input.provides ?? undefined,
			requires: input.requires ?? undefined,
			authors: input.authors ?? [],
			owner: input.owner ?? undefined
		};

		if (lessonId) {
			const existingDraftForLesson = lessonId
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

			if (existingDraftForLesson) {
				const updatedDraft = await database.lessonDraft.update({
					where: { id: existingDraftForLesson.id },
					data: {
						...draftData,
						updatedAt: new Date()
					}
				});
				return updatedDraft;
			} else {
				console.error("Draft is assigned to non-existing lesson!");
			}
		}

		const existingDraft = draftId
			? await database.lessonDraft.findFirst({
					where: {
						id: draftId,
						owner: {
							path: ["username"],
							equals: user.username
						}
					}
				})
			: null;

		if (existingDraft) {
			const updatedDraft = await database.lessonDraft.update({
				where: { id: draftId },
				data: {
					...draftData,
					updatedAt: new Date()
				}
			});
			return updatedDraft;
		} else {
			const newDraft = await database.lessonDraft.create({
				data: {
					...draftData,
					lessonId: lessonId ?? undefined,
					owner: user,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});
			return newDraft;
		}
	})
});
