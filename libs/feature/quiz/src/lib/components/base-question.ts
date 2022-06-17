export type BaseQuestion = {
	questionId: string;
	type: string;
	statement: string;
	withCertainty?: boolean;
	hints?: {
		disabled?: boolean;
		content: string[];
	};
	answers: QuestionAnswers | null;
};

export type QuestionAnswers = {
	answerId: string;
	content: string;
	isCorrect: boolean;
}[];
