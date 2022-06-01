import * as yup from "yup";
export type QuizAttemptState = "COMPLETED" | "HAS_ERRORS";

export const submitAnswerSchema = yup.object({
	answers: yup.array(),
	state: yup.string().oneOf<QuizAttemptState>(["COMPLETED", "HAS_ERRORS"]).required()
});

export type SubmitAnswerType = yup.InferType<typeof submitAnswerSchema>;
