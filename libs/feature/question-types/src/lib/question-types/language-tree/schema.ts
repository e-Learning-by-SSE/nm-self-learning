import { z } from "zod";
import { baseAnswerSchema, BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const languageTreeQuestionSchema = baseQuestionSchema.extend({
    type: z.literal("language-tree"),
    answer: z.string(),
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
