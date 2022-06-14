import { useMutation, useQuery, useQueryClient } from "react-query";
import { SubmitAnswerType } from "./schema";

async function submitQuizAttempt(vars: SubmitAnswerType & { lessonId: string; username: string }) {
	const response = await fetch(
		`/api/students/${vars.username}/lessons/${vars.lessonId}/quiz-attempts/submit-answers`,
		{
			method: "POST",
			body: JSON.stringify({
				state: vars.state,
				answers: vars.answers
			}),
			headers: {
				"content-type": "application/json"
			}
		}
	);

	if (!response.ok) {
		throw new Error(await response.text());
	}

	return response.json();
}

const quizAttemptsCacheKey = ["quiz-attempts"];

export function useQuizAttempt() {
	const queryClient = useQueryClient();
	const { mutate: submitAnswers, isLoading: isSubmitting } = useMutation(submitQuizAttempt, {
		onSettled: (data, error) => {
			queryClient.invalidateQueries(quizAttemptsCacheKey);

			if (!error) {
				console.log("Answers submitted successfully.");
			}
		}
	});

	return { submitAnswers, isSubmitting };
}

async function fetchQuizAttempts(vars: {
	lessonId: string;
	username: string;
}): Promise<QuizAttemptsInfoResponse> {
	const response = await fetch(
		`/api/students/${vars.username}/lessons/${vars.lessonId}/quiz-attempts/get-attempts`
	);

	if (!response.ok) {
		throw new Error(await response.text());
	}

	return (await response.json()) as QuizAttemptsInfoResponse;
}

export function useQuizAttemptsInfo(lessonId: string, username: string) {
	const { data: quizAttemptsInfo, isLoading } = useQuery(
		quizAttemptsCacheKey,
		() => fetchQuizAttempts({ lessonId, username }),
		{ enabled: !!username }
	);
	return { quizAttemptsInfo, isLoading };
}

export type QuizAttemptsInfoResponse = {
	hasCompletedLesson: boolean;
	count: {
		completed: number;
		withErrors: number;
	};
};
