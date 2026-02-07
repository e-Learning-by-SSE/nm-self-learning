import { database } from "@self-learning/database";
import { workerServiceClient } from "@self-learning/worker-api";
import { logJobProgress } from "@self-learning/database";
import crypto from "crypto";
import {
	lessonContentSchema,
	downloadMultiple,
	vectorStore,
	PreparedContent
} from "@self-learning/rag-processing";

/**
 * RAG Service - Orchestrates RAG operations from the API layer
 *
 * Responsibilities:
 * - Fetch lesson data from database
 * - Pre-download PDFs and prepare content (I/O operations)
 * - Submit jobs to worker service (CPU-intensive operations)
 * - Track job progress
 * - Handle deletion operations
 */
export class RagService {
	/**
	 * Enqueue a RAG embedding job for a lesson
	 *
	 * This method:
	 * 1. Fetches lesson content from database
	 * 2. Downloads PDFs in parallel (I/O in main thread)
	 * 3. Submits job to worker with prepared data
	 * 4. Subscribes to job events for progress tracking
	 */
	async enqueueEmbedJob(lessonId: string): Promise<string> {
		console.log("[RagService] Enqueueing embed job", { lessonId });

		try {
			// Step 1: Fetch lesson content
			const lesson = await database.lesson.findUniqueOrThrow({
				where: { lessonId },
				select: { title: true, content: true }
			});

			if (!lesson.content) {
				throw new Error(`Lesson ${lessonId} has no content`);
			}

			// Step 2: Prepare content (download PDFs, extract text)
			console.log("[RagService] Preparing content for embedding", {
				lessonId,
				title: lesson.title
			});
			const preparedContent = await this.prepareContent(lesson.content);

			// Step 3: Generate job ID
			const jobId = crypto.randomUUID();

			// Step 4: Submit job to worker service
			await workerServiceClient.submitJob.mutate({
				jobId,
				jobType: "ragEmbed",
				payload: {
					lessonId,
					lessonTitle: lesson.title,
					pdfBuffers: preparedContent.pdfBuffers,
					articleTexts: preparedContent.articleTexts,
					transcriptTexts: preparedContent.transcriptTexts
				}
			});

			console.log("[RagService] Job submitted successfully", { jobId, lessonId });

			// Step 5: Subscribe to job events (non-blocking)
			this.subscribeToJobEvents(jobId, lessonId).catch(err => {
				console.error("[RagService] Subscription error", err, { jobId, lessonId });
			});

			return jobId;
		} catch (error) {
			console.error("[RagService] Failed to enqueue embed job", error, { lessonId });
			throw error;
		}
	}

	/**
	 * Prepare content by downloading PDFs and extracting text
	 * This runs in the API layer (main thread) to keep workers focused on CPU work
	 */
	private async prepareContent(content: unknown): Promise<PreparedContent> {
		const parsed = lessonContentSchema.array().parse(content);

		// Extract PDFs
		const pdfUrls = parsed.filter(item => item.type === "pdf").map(item => item.value.url);

		console.log("[RagService] Downloading PDFs", { count: pdfUrls.length });

		// Download all PDFs in parallel
		const pdfBuffers = pdfUrls.length > 0 ? await downloadMultiple(pdfUrls) : [];

		// Extract article texts
		const articleTexts = parsed
			.filter(item => item.type === "article")
			.map(item => item.value.content);

		// Extract video transcript URLs (these might need fetching too)
		const transcriptTexts: string[] = []; // Skip videos until implemented
		console.log("[RagService] Skipping video transcripts (not yet implemented)");

		console.log("[RagService] Content prepared successfully", {
			pdfCount: pdfBuffers.length,
			articleCount: articleTexts.length,
			transcriptCount: transcriptTexts.length
		});

		return { pdfBuffers, articleTexts, transcriptTexts };
	}

	/**
	 * Subscribe to job events and log progress to database
	 */
	private async subscribeToJobEvents(jobId: string, lessonId: string): Promise<void> {
		try {
			const subscription = workerServiceClient.jobQueue.subscribe(
				{ jobId },
				{
					onData: async event => {
						console.log("[RagService] Job event received", {
							jobId,
							status: event.status
						});

						// Log to database
						await logJobProgress(jobId, event);

						// Handle completion
						if (event.status === "finished") {
							console.log("[RagService] Job completed successfully", {
								jobId,
								lessonId
							});
						} else if (event.status === "aborted") {
							console.error("[RagService] Job aborted", new Error(event.cause), {
								jobId,
								lessonId
							});
						}
					},
					onError: error => {
						console.error("[RagService] Job subscription error", error, {
							jobId,
							lessonId
						});
					}
				}
			);
		} catch (error) {
			console.error("[RagService] Failed to subscribe to job events", error, {
				jobId,
				lessonId
			});
		}
	}

	/**
	 * Delete a lesson from vector store
	 */
	async deleteLesson(lessonId: string): Promise<void> {
		console.log("[RagService] Deleting lesson from vector store", { lessonId });

		try {
			const exists = await vectorStore.lessonExists(lessonId);

			if (exists) {
				await vectorStore.deleteLesson(lessonId);
				console.log("[RagService] Lesson deleted successfully", { lessonId });
			} else {
				console.log("[RagService] Lesson not found in vector store", { lessonId });
			}
		} catch (error) {
			console.error("[RagService] Failed to delete lesson", error, { lessonId });
			throw error;
		}
	}

	/**
	 * Retrieve context for a question (used by AI tutor)
	 * This method submits a retrieval job to the worker and waits for the result synchronously.
	 */

	async retrieveContext(
		lessonId: string,
		question: string,
		topK = 5
	): Promise<{ context: string; sources: any[] }> {
		console.log("[RagService] Retrieving context via worker", {
			lessonId,
			question: question.substring(0, 50),
			topK
		});

		try {
			const jobId = crypto.randomUUID();

			// Submit retrieval job to worker
			await workerServiceClient.submitJob.mutate({
				jobId,
				jobType: "ragRetrieve",
				payload: { lessonId, question, topK }
			});

			console.log("[RagService] Retrieval job submitted", { jobId });

			// Wait for result synchronously using subscription
			const result = await new Promise<{ context: string; sources: any[] }>(
				(resolve, reject) => {
					const timeout = setTimeout(() => {
						reject(new Error("RAG retrieval timed out after 30 seconds"));
					}, 30000);

					workerServiceClient.jobQueue.subscribe(
						{ jobId },
						{
							onData: event => {
								if (event.status === "finished") {
									clearTimeout(timeout);
									resolve(event.result as { context: string; sources: any[] });
								} else if (event.status === "aborted") {
									clearTimeout(timeout);
									reject(new Error(`RAG retrieval failed: ${event.cause}`));
								}
							},
							onError: error => {
								clearTimeout(timeout);
								reject(error);
							}
						}
					);
				}
			);

			console.log("[RagService] Context retrieved successfully", {
				lessonId,
				resultsCount: result.sources.length
			});

			return result;
		} catch (error) {
			console.error("[RagService] Failed to retrieve context", error, { lessonId });

			// Return empty result instead of throwing to avoid breaking AI tutor
			return { context: "Unable to retrieve lesson context at this time.", sources: [] };
		}
	}
}

/**
 * Singleton instance
 */
export const ragService = new RagService();
