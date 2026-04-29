import { z } from "zod";
import { baseAnswerSchema, BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const nodeTypeCategorySchema = z.object({
	name: z.string(),
	nodes: z.array(z.string())
});

export type NodeTypeCategory = z.infer<typeof nodeTypeCategorySchema>;

export const languageTreeQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("language-tree"),
	caseSensitive: z.boolean(),
	customTextInputInParentNodes: z.boolean().default(true),
	restrictNodeTypes: z.boolean().default(false),
	nodeTypeCategories: z.array(nodeTypeCategorySchema).default([]),
	answer: z.array(z.string()),
	initialTree: z.string(),
});

export type LanguageTreeQuestion = z.infer<typeof languageTreeQuestionSchema>;

export const languageTreeAnswerSchema = baseAnswerSchema.extend({
	type: z.literal("language-tree"),
	value: z.string()
});

export type LanguageTreeAnswer = z.infer<typeof languageTreeAnswerSchema>;

export type LanguageTreeEvaluation = BaseEvaluation

export type LanguageTree = {
	type: "language-tree";
	question: LanguageTreeQuestion;
	answer: LanguageTreeAnswer;
	evaluation: LanguageTreeEvaluation;
};
