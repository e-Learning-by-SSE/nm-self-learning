import { ragRetriever } from "@self-learning/vector-store";
import { TRPCError } from "@trpc/server";
import { authProcedure, t } from "../trpc";
import { z } from "zod";
import { database } from "@self-learning/database";
import { lessonContentSchema, lessonSchema } from "@self-learning/types";

export const ragRouter = t.router({
	ingestLesson: authProcedure
		.input(
			z.object({
				lessonId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const lessonId = input.lessonId;

			try {
				if (!lessonId) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "courseId, courseName, and files are required"
					});
				}
				const lesson = await database.lesson.findUniqueOrThrow({
					where: { lessonId },
					select: { title: true, content: true }
				});
				console.log(`📥 Ingesting lesson: ${lesson.title}`);

				if (!lesson.content) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Lesson content not found"
					});
				}

				// pdf content extraction
				const parsedContent = lessonContentSchema.array().parse(lesson.content);
				const pdfContent = parsedContent
					.filter(content => content.type === "pdf")
					.map(content => content.value.url);

				if (pdfContent.length === 0) {
					console.log("No PDF content found to ingest.");
				}

				// article content extraction
				const articleContent = parsedContent
					.filter(content => content.type === "article")
					.map(content => content.value.content);

				if (articleContent.length === 0) {
					console.log("No Article content found to ingest.");
				}

				// const result = await ragRetriever.processPDFFromURL(courseId, courseName, files);
				// return result;
			} catch (error) {
				console.error("❌ Ingestion error:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to ingest course"
				});
			}
		})
});
