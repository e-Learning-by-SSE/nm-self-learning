import { LessonContent, LessonDraft, lessonDraftSchema } from "@self-learning/types";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { z } from "zod";
import { Quiz } from "@self-learning/quiz";

export const lessonDraftRouter = t.router({
	create: authProcedure.input(lessonDraftSchema).mutation(async ({ input }) => {
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
				requirements: Array.isArray(draft.requirements)
					? draft.requirements
					: [JSON.parse("[]")],
				teachingGoals: Array.isArray(draft.teachingGoals)
					? draft.teachingGoals
					: JSON.parse("[]"),
				content: (draft.content ?? []) as LessonContent,
				quiz: draft.quiz as Quiz,
				lessonType: draft.lessonType ?? "TRADITIONAL",
				selfRegulatedQuestion: draft.selfRegulatedQuestion
			}));
		}),
	getById: authProcedure
		.input(z.object({ draftId: z.string() }))
		.query(async ({ input }): Promise<LessonDraft | undefined> => {
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
					requirements: Array.isArray(draft.requirements)
						? draft.requirements
						: [JSON.parse("[]")],
					teachingGoals: Array.isArray(draft.teachingGoals)
						? draft.teachingGoals
						: JSON.parse("[]"),
					content: (draft.content ?? []) as LessonContent,
					quiz: draft.quiz as Quiz,
					lessonType: draft.lessonType ?? "TRADITIONAL",
					selfRegulatedQuestion: draft.selfRegulatedQuestion
				};
			}
			return undefined; // TODO
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
			content: input.content ?? "",
			quiz: input.quiz ?? undefined,
			license: input.license ?? undefined,
			teachingGoals: input.teachingGoals ?? undefined,
			requirements: input.requirements ?? undefined,
			authors: input.authors ?? [],
			owner: input.owner ?? undefined
		};

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
					lessonId: lessonId ?? null,
					owner: user,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});
			return newDraft;
		}
	})
});
