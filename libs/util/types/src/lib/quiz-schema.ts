import { z } from "zod";
import { clozeQuestionSchema } from "./question-types/cloze";
import { multipleChoiceQuestionSchema } from "./question-types/multiple-choice";
import { programmingQuestionSchema } from "./question-types/programming";
import { shortTextQuestionSchema } from "./question-types/short-text";
import { textQuestionSchema } from "./question-types/text";
import { vorwissenQuestionSchema } from "./question-types/vorwissen";

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
