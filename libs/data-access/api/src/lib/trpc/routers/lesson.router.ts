import { Course, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	createLessonMeta,
	EventTypeMap,
	LessonContentType,
	lessonSchema
} from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { differenceInHours } from "date-fns";
import { z } from "zod";
import { authorProcedure, authProcedure, t } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
	getRagVersionHash,
	prepareRagContent,
	deleteEmbedding
} from "@self-learning/rag-processing";
import { workerServiceClient } from "@self-learning/worker-api";
import { logJobProgress } from "@self-learning/database";
import crypto from "crypto";

export const lessonRouter = t.router({
	findOneAllProps: authProcedure.input(z.object({ lessonId: z.string() })).query(({ input }) => {
		return database.lesson.findUniqueOrThrow({
			where: { lessonId: input.lessonId },
			include: {
				authors: {
					select: { 
						username: true
					}
				},
				requires: {
					select: {
						id: true,
						name: true,
						description: true,
						children: true,
						repositoryId: true,
						parents: true
					}
				},
				provides: {
					select: {
						id: true,
						name: true,
						description: true,
						children: true,
						repositoryId: true,
						parents: true
					}
				}
			}
		});
	}),
	findOne: authProcedure.input(z.object({ lessonId: z.string() })).query(({ input }) => {
		return database.lesson.findUniqueOrThrow({
			where: { lessonId: input.lessonId },
			select: { lessonId: true, title: true, slug: true, meta: true }
		});
	}),
	findMany: authProcedure
		.input(
			paginationSchema.extend({
				title: z.string().optional(),
				authorName: z.string().optional()
			})
		)
		.query(async ({ input: { title, page, authorName } }) => {
			const pageSize = 15;
			const { lessons, count } = await findLessons({
				title,
				authorName,
				...paginate(pageSize, page)
			});
			return {
				result: lessons,
				totalCount: count,
				page,
				pageSize
			} satisfies Paginated<unknown>;
		}),
	create: authProcedure.input(lessonSchema).mutation(async ({ input, ctx }) => {
		const ragCheck = input.ragEnabled ?? false;
		let hash: string | null = null;
		if (ragCheck && input.content.length) {
			hash = getRagVersionHash(JSON.stringify(input.content));
		}
		const createdLesson = await database.lesson.create({
			data: {
				...input,
				quiz: input.quiz ? (input.quiz as Prisma.JsonObject) : Prisma.JsonNull,
				authors: { 
					connect: input.authors.map(a => ({ username: a.username }))
				},
				licenseId: input.licenseId,
				requires: {
					connect: input.requires.map(r => ({ id: r.id }))
				},
				provides: {
					connect: input.provides.map(r => ({ id: r.id }))
				},
				content: input.content as Prisma.InputJsonArray,
				lessonId: getRandomId(),
				meta: createLessonMeta(input) as unknown as Prisma.JsonObject,
				ragVersionHash: hash,
				ragEnabled: input.ragEnabled ?? false
			},
			select: { 
				lessonId: true,
				slug: true,
				title: true,
				ragEnabled: true
			}
		});

		if (createdLesson.ragEnabled && hash) {
			await enqueueRagEmbedJob(createdLesson.lessonId, createdLesson.title, input.content);
		}

		console.log("[lessonRouter.create]: Lesson created by", ctx.user.name, createdLesson);
		return createdLesson;
	}),
	edit: authProcedure
		.input(
			z.object({
				lessonId: z.string(),
				lesson: lessonSchema
			})
		)
		.mutation(async ({ input, ctx }) => {
			const ragCheck = input.lesson.ragEnabled ?? false;
			let hash: string | null = null;
			if (ragCheck && input.lesson.content.length) {
				hash = getRagVersionHash(JSON.stringify(input.lesson.content));
			}
			const existing = await database.lesson.findUnique({
				where: { lessonId: input.lessonId },
				select: { ragVersionHash: true, ragEnabled: true }
			});

			const updatedLesson = await database.lesson.update({
				where: { lessonId: input.lessonId },
				data: {
					...input.lesson,
					quiz: input.lesson.quiz
						? (input.lesson.quiz as Prisma.JsonObject)
						: Prisma.JsonNull,
					lessonId: input.lessonId,
					authors: {
						set: input.lesson.authors.map(a => ({ username: a.username }))
					},
					licenseId: input.lesson.licenseId,
					requires: {
						set: input.lesson.requires.map(r => ({ id: r.id }))
					},
					provides: {
						set: input.lesson.provides.map(r => ({ id: r.id }))
					},
					meta: createLessonMeta(input.lesson) as unknown as Prisma.JsonObject,
					ragVersionHash: hash,
					ragEnabled: input.lesson.ragEnabled ?? false
				},
				select: {
					lessonId: true,
					slug: true,
					title: true,
					ragEnabled: true
				}
			});

			if (updatedLesson.ragEnabled && hash) {
				if (!existing?.ragEnabled) {
					await enqueueRagEmbedJob(
						updatedLesson.lessonId,
						updatedLesson.title,
						input.lesson.content
					);
				} else {
					await deleteEmbedding(updatedLesson.lessonId);
					await enqueueRagEmbedJob(
						updatedLesson.lessonId,
						updatedLesson.title,
						input.lesson.content
					);
				}
			} else if (!updatedLesson.ragEnabled && existing?.ragEnabled) {
				await deleteEmbedding(updatedLesson.lessonId);
			}

			console.log("[lessonRouter.edit]: Lesson updated by", ctx.user.name, updatedLesson);
			return updatedLesson;
		}),
	findLinkedLessonEntities: authorProcedure
		.input(z.object({ lessonId: z.string() }))
		.query(async ({ input }) => {
			const courses = await database.$queryRaw`
				SELECT *
				FROM "Course"
				WHERE EXISTS (SELECT 1
							  FROM jsonb_array_elements("Course".content) AS chapter
									   CROSS JOIN jsonb_array_elements(chapter - > 'content') AS lesson
							  WHERE lesson ->>'lessonId' = ${input.lessonId})
			`;
			return courses as Course[];
		}),
	deleteLesson: authorProcedure
		.input(z.object({ lessonId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.user?.role === "ADMIN") {
				await database.lesson.deleteMany({
					where: { lessonId: input.lessonId }
				});
				await deleteEmbedding(input.lessonId);
			} else {
				const deleted = await database.lesson.deleteMany({
					where: {
						lessonId: input.lessonId,
						authors: {
							some: { username: ctx.user?.name}
						}
					}
				});

				if (deleted.count === 0) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "User is not an author of this lesson or lesson does not exist."
					});
				} else {
					await deleteEmbedding(input.lessonId);
				}
			}
		}),
	validateAttempt: authProcedure
		.input(z.object({ lessonId: z.string(), lessonAttemptId: z.string() }))
		.query(async ({ input, ctx }) => {
			const data = await database.eventLog.findFirst({
				where: {
					username: ctx.user.name,
					type: "LESSON_OPEN",
					resourceId: input.lessonId
				},
				orderBy: { createdAt: "desc" },
				select: { createdAt: true, payload: true }
			});

			if (!data) {
				return { isValid: false, reason: "NO_OPEN_EVENT" };
			}

			const latestOpenEvent = {
				...data,
				payload: data.payload as EventTypeMap["LESSON_OPEN"]
			};

			const eventAttemptId = latestOpenEvent.payload.lessonAttemptId;

			// Falls attemptId im Event gespeichert ist, vergleiche
			if (eventAttemptId && eventAttemptId !== input.lessonAttemptId) {
				return { isValid: false, reason: "STALE_ATTEMPT" };
			}

			// Falls das LESSON_OPEN Event älter als 2h ist, ungültig
			const hoursSinceOpen = differenceInHours(new Date(), latestOpenEvent.createdAt);
			if (hoursSinceOpen > 2) {
				return { isValid: false, reason: "EXPIRED" };
			}

			return { isValid: true };
		})
});

export async function findLessons({
	title,
	authorName,
	skip,
	take
}: {
	title?: string;
	authorName?: string;
	skip?: number;
	take?: number;
}) {
	const where: Prisma.LessonWhereInput = {
		title:
			typeof title === "string" && title.length > 0
				? { contains: title, mode: "insensitive" }
				: undefined,
		authors: authorName 
			? { 
				some: { 
					username: authorName 
				} 
			} 
		: undefined
	};

	const [lessons, count] = await database.$transaction([
		database.lesson.findMany({
			select: {
				lessonId: true,
				title: true,
				slug: true,
				updatedAt: true,
				authors: {
					select: { 
						displayName: true,
						slug: true,
						imgUrl: true
					}
				}
			},
			orderBy: { updatedAt: "desc" },
			where,
			take,
			skip
		}),
		database.lesson.count({ where })
	]);

	return { lessons, count };
}

/**
 * Enqueue RAG embedding job
 */
async function enqueueRagEmbedJob(
	lessonId: string,
	lessonTitle: string,
	lessonContent: LessonContentType[]
): Promise<string> {
	console.log("[LessonRouter] Enqueueing RAG embed job", { lessonId });

	try {
		const preparedContent = await prepareRagContent(lessonContent);
		const jobId = crypto.randomUUID();

		await workerServiceClient.submitJob.mutate({
			jobId,
			jobType: "ragEmbed",
			payload: {
				lessonId,
				lessonTitle,
				pdfBuffers: preparedContent.pdfBuffers,
				articleTexts: preparedContent.articleTexts,
				transcriptTexts: preparedContent.transcriptTexts
			}
		});

		console.log("[LessonRouter] RAG job submitted", { jobId, lessonId });

		subscribeToRagJobEvents(jobId, lessonId).catch(err => {
			console.error("[LessonRouter] Subscription error", err, { jobId });
		});

		return jobId;
	} catch (error) {
		console.error("[LessonRouter] Failed to enqueue RAG job", error, { lessonId });
		throw error;
	}
}

async function subscribeToRagJobEvents(jobId: string, lessonId: string): Promise<void> {
	try {
		workerServiceClient.jobQueue.subscribe(
			{ jobId },
			{
				onData: async event => {
					console.log("[LessonRouter] RAG job event", { 
						jobId,
						status: event.status
					});
					await logJobProgress(jobId, event);

					if (event.status === "finished") {
						console.log("[LessonRouter] RAG job completed", { 
							jobId, 
							lessonId
						});
					} else if (event.status === "aborted") {
						console.error("[LessonRouter] RAG job aborted", new Error(event.cause));
					}
				},
				onError: error => {
					console.error("[LessonRouter] RAG subscription error", error, { jobId });
				}
			}
		);
	} catch (error) {
		console.error("[LessonRouter] Failed to subscribe to RAG events", error, { jobId });
	}
}
