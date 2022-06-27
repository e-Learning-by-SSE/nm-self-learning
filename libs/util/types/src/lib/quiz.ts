import { z } from "zod";

const baseQuestionSchema = z.object({
	questionId: z.string(),
	type: z.string(),
	statement: z.string(),
	withCertainty: z.boolean(),
	hints: z.array(
		z.object({
			hintId: z.string(),
			content: z.string()
		})
	)
});

export type BaseQuestion = z.infer<typeof baseQuestionSchema>;

const questionAnswerSchema = z.object({
	answerId: z.string(),
	content: z.string(),
	isCorrect: z.boolean()
});

const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("multiple-choice"),
	answers: z.array(questionAnswerSchema)
});

export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;

const shortTextQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("short-text"),
	acceptedAnswers: z.array(
		z.object({
			acceptedAnswerId: z.string(),
			value: z.string()
		})
	)
});

export type ShortTextQuestion = z.infer<typeof shortTextQuestionSchema>;

const textQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("text")
});

export type TextQuestion = z.infer<typeof textQuestionSchema>;

const clozeQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("cloze"),
	textArray: z.array(z.string())
});

export type ClozeQuestion = z.infer<typeof clozeQuestionSchema>;

const vorwissenQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("vorwissen"),
	answers: z.array(questionAnswerSchema),
	requireExplanationForAnswerIds: z.boolean()
});

export type VorwissenQuestion = z.infer<typeof vorwissenQuestionSchema>;

const programmingQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("programming"),
	language: z.string(),
	template: z.string(),
	expectedOutput: z.string()
});

export type ProgrammingQuestion = z.infer<typeof programmingQuestionSchema>;

export const quizContentSchema = z.discriminatedUnion("type", [
	multipleChoiceQuestionSchema,
	shortTextQuestionSchema,
	textQuestionSchema,
	vorwissenQuestionSchema,
	programmingQuestionSchema
]);

export type QuestionType = z.infer<typeof quizContentSchema>;
export type QuizContent = QuestionType[];
