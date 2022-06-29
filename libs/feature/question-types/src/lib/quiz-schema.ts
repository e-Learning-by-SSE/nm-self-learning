import { z } from "zod";
import { clozeQuestionSchema } from "./question-types/cloze/schema";
import { multipleChoiceQuestionSchema } from "./question-types/multiple-choice/schema";
import { programmingQuestionSchema } from "./question-types/programming/schema";
import { shortTextQuestionSchema } from "./question-types/short-text/schema";
import { textQuestionSchema } from "./question-types/text/schema";
import { vorwissenQuestionSchema } from "./question-types/vorwissen/schema";

export type QuizAttemptState = "COMPLETED" | "HAS_ERRORS";

export const quizContentSchema = z.discriminatedUnion("type", [
	multipleChoiceQuestionSchema,
	shortTextQuestionSchema,
	textQuestionSchema,
	vorwissenQuestionSchema,
	programmingQuestionSchema,
	clozeQuestionSchema
]);

export type QuestionType = z.infer<typeof quizContentSchema>;
export type QuizContent = QuestionType[];
