import { LessonContent, LessonDraft, lessonDraftSchema } from "@self-learning/types";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { z } from "zod";
import { Quiz } from "@self-learning/quiz";
import { LessonDraft as PrismaLessonDraft, Prisma } from "@prisma/client";

export const lessonDraftRouter = t.router({
	getByOwner: authProcedure.query(async ({ ctx }): Promise<LessonDraft[]> => {
		const username = ctx.user.name;
		const drafts = await database.lessonDraft.findMany({
			where: {
				owner: {
					path: ["username"],
					equals: username
				}
			}
		});

		return drafts.map(mapToLessonDraft);
	}),
	getById: authProcedure
		.input(z.object({ draftId: z.string() }))
		.query(async ({ input, ctx }): Promise<LessonDraft | null> => {
			const draftId = input.draftId;
			const draft = await database.lessonDraft.findUnique({
				where: {
					id: draftId,
					owner: {
						path: ["username"],
						equals: ctx.user.name
					}
				}
			});

			return draft ? mapToLessonDraft(draft) : null;
		}),
	getOverviewByOwner: authProcedure.query(async ({ ctx }) => {
		const drafts = await database.lessonDraft.findMany({
			where: {
				owner: {
					path: ["username"],
					equals: ctx.user.name
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
	delete: authProcedure
		.input(z.object({ draftId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			try {
				const deletedDraft = await database.lessonDraft.delete({
					where: {
						id: input.draftId,
						owner: {
							path: ["username"],
							equals: ctx.user.name
						}
					}
				});

				return {
					success: true,
					message: "Draft successfully deleted.",
					draft: deletedDraft
				};
			} catch (err) {
				console.error("Error while deleting draft: ", err);
				return {
					success: false,
					message: "Draft  deletion failed: " + (err as Error).message,
					draft: null
				};
			}
		}),
	upsert: authProcedure.input(lessonDraftSchema).mutation(async ({ input, ctx }) => {
		const { updatedAt: _updatedAt, ...data } = input;
		const draftData = {
			...data,
			content: data.content as Prisma.InputJsonArray,
			quiz: data.quiz ? (data.quiz as Prisma.JsonObject) : undefined,
			license: data.license ?? undefined,
			provides: data.provides ?? undefined,
			requires: data.requires ?? undefined,
			authors: data.authors ?? [],
			owner: { username: ctx.user.name }
		};

		if (draftData.id) {
			return database.lessonDraft.upsert({
				create: draftData,
				update: draftData,
				where: {
					id: draftData.id,
					owner: {
						path: ["username"],
						equals: ctx.user.name
					}
				}
			});
		} else {
			return database.lessonDraft.create({
				data: draftData
			});
		}
	})
});

function mapToLessonDraft(draft: PrismaLessonDraft): LessonDraft {
	return {
		id: draft.id,
		lessonId: draft.lessonId ?? null,
		slug: draft.slug ?? "",
		title: draft.title ?? "",
		subtitle: draft.subtitle,
		description: draft.description,
		imgUrl: draft.imgUrl,
		authors: Array.isArray(draft.authors) ? draft.authors : [JSON.parse("[]")],
		owner:
			typeof draft.owner === "object" && draft.owner !== null && "username" in draft.owner
				? { username: String(draft.owner.username) }
				: { username: "" },

		licenseId: draft.licenseId,
		requires: Array.isArray(draft.requires) ? draft.requires : [JSON.parse("[]")],
		provides: Array.isArray(draft.provides) ? draft.provides : [JSON.parse("[]")],
		content: (draft.content ?? []) as LessonContent,
		quiz: draft.quiz as Quiz,
		lessonType: draft.lessonType ?? undefined,
		selfRegulatedQuestion: draft.selfRegulatedQuestion,
		updatedAt: draft.updatedAt
	};
}
