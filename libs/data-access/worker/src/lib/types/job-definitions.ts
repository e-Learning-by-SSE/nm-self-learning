import { unknown, z } from "zod";

/**
 * Definition of supported worker jobs.
 * 1.) Define input and output schemas using Zod and export them.
 * 2.) Add the schema definitions to the `SubmitJobInput` and `JobResponse` discriminated unions.
 * 3.) Define job in worker-service using the defined schemas.
 * 4.) Use tRPC router to send and receive job data
 *   a.) tRPC router must generate a jobId using `crypto.randomUUID()`
 *   b.) tRPC router registers himself as oberserver to the worker-service using the jobId
 *   c.) tRPC router sends job request to worker-service including jobId and payload.
 *       The payload must be of type of the defined input schema.
 *   d.) tRPC router receives job completion notification "finished" with result.
 *       The result can be safely casted to the defined output schema.
 *       This can be done as follows:
 * @example
 * ```ts
 * if (evt.type == "finished") {
 *     const result = evt.result as <OutputSchemaType>;
 * }
 * ```
 */
const BaseJobSchema = z.object({ jobId: z.string() });

/******************************************************************************
 ******************************  Path Generation ******************************
 ******************************************************************************/

const skillSchema = z.object({
	id: z.string(),
	repositoryId: z.string(),
	children: z.array(z.object({ id: z.string() })).optional()
});

const learningUnitSchema = z.object({
	lessonId: z.string(),
	requires: z.array(z.object({ id: z.string() })).optional(),
	provides: z.array(z.object({ id: z.string() })).optional()
});

export const pathGenerationPayloadSchema = z.object({
	dbSkills: z.array(skillSchema),
	userGlobalKnowledge: z
		.object({ received: z.array(z.object({ id: z.string() })).optional() })
		.optional(),
	course: z.object({ teachingGoals: z.array(skillSchema).optional() }),
	lessons: z.array(learningUnitSchema),
	knowledge: z.array(z.string()).optional()
});

/******************************************************************************
 ******************************  RAG Embedding ******************************
 ******************************************************************************/

export const ragEmbedPayloadSchema = z.object({
	lessonId: z.string(),
	lessonTitle: z.string(),
	pdfBuffers: z.array(z.object({ data: z.string(), url: z.string().url() })),
	articleTexts: z.array(z.string()),
	transcriptTexts: z.array(z.string())
});

export const ragEmbedResponseSchema = z.object({
	success: z.boolean(),
	chunksCreated: z.number(),
	breakdown: z.object({
		pdfChunks: z.number(),
		articleChunks: z.number(),
		videoChunks: z.number()
	}),
	message: z.string()
});

/******************************************************************************
 ******************************  RAG Retrieval ******************************
 ******************************************************************************/

export const ragRetrievePayloadSchema = z.object({
	lessonId: z.string(),
	question: z.string(),
	topK: z.number().optional()
});

export const ragRetrieveResponseSchema = z.object({
	context: z.string(),
	sources: z.array(
		z.object({
			lessonName: z.string(),
			pageNumber: z.number().optional(),
			sourceType: z.string(),
			score: z.number()
		})
	)
});

/******************************************************************************
 ******************************  Job Unions ******************************
 ******************************************************************************/

export const SubmitJobInput = z.discriminatedUnion("jobType", [
	BaseJobSchema.extend({
		jobType: z.literal("pathGeneration"),
		payload: pathGenerationPayloadSchema
	}),
	BaseJobSchema.extend({ jobType: z.literal("ragEmbed"), payload: ragEmbedPayloadSchema }),
	BaseJobSchema.extend({ jobType: z.literal("ragRetrieve"), payload: ragRetrievePayloadSchema })
]);

export const JobResponse = z.discriminatedUnion("jobType", [
	BaseJobSchema.extend({ jobType: z.literal("pathGeneration"), response: unknown() }),
	BaseJobSchema.extend({ jobType: z.literal("ragEmbed"), response: ragEmbedResponseSchema }),
	BaseJobSchema.extend({ jobType: z.literal("ragRetrieve"), response: ragRetrieveResponseSchema })
]);

export type JobKey = z.infer<typeof SubmitJobInput>["jobType"];

export type PayloadFor<K extends JobKey> = Extract<
	z.infer<typeof SubmitJobInput>,
	{ jobType: K }
>["payload"];

export type ReturnTypeOf<K extends JobKey> = Extract<
	z.infer<typeof JobResponse>,
	{ jobType: K }
>["response"];
