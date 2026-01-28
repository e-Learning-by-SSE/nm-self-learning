import { z } from "zod";

/**
 * Definition of supported worker jobs:
 * - key: Job type / name
 * - value: The job payload
 */
const BaseJobSchema = z.object({
	jobId: z.string()
});

export const HelloWorldSchema = z.object({ msg: z.string() });

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
		.object({
			received: z.array(z.object({ id: z.string() })).optional()
		})
		.optional(),
	course: z.object({
		teachingGoals: z.array(skillSchema).optional()
	}),
	lessons: z.array(learningUnitSchema),
	knowledge: z.array(z.string()).optional()
});

export const SubmitJobInput = z.discriminatedUnion("jobType", [
	BaseJobSchema.extend({
		jobType: z.literal("HelloWorld"),
		payload: HelloWorldSchema
	}),
	BaseJobSchema.extend({
		jobType: z.literal("pathGeneration"),
		payload: pathGenerationPayloadSchema
	})
]);

export type JobKey = z.infer<typeof SubmitJobInput>["jobType"];
export type PayloadFor<K extends JobKey> = Extract<
	z.infer<typeof SubmitJobInput>,
	{ jobType: K }
>["payload"];
