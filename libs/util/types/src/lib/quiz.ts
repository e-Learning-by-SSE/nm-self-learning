export type QuizContent = QuestionType[];

export type QuestionType =
	| MultipleChoiceQuestion
	| ShortTextQuestion
	| TextQuestion
	| ClozeQuestion
	| VorwissenQuestion
	| ProgrammingQuestion;

export type BaseQuestion = {
	questionId: string;
	type: string;
	statement: string;
	withCertainty: boolean;
	hints: {
		hintId: string;
		content: string;
	}[];
	answers: QuestionAnswers | null;
};

export type QuestionAnswers = {
	answerId: string;
	content: string;
	isCorrect: boolean;
}[];

export type MultipleChoiceQuestion = BaseQuestion & {
	type: "multiple-choice";
	answers: {
		answerId: string;
		content: string;
		isCorrect: boolean;
	}[];
};

export type ShortTextQuestion = BaseQuestion & {
	type: "short-text";
	answers: null;
	acceptedAnswers: {
		acceptedAnswerId: string;
		value: string;
	}[];
};

export type TextQuestion = BaseQuestion & {
	type: "text";
	answers: null;
};

export type ClozeQuestion = BaseQuestion & {
	type: "cloze";
	textArray: string[];
};

export type VorwissenQuestion = BaseQuestion & {
	type: "vorwissen";
	answers: QuestionAnswers;
	requireExplanationForAnswerIds: string;
};

export type ProgrammingQuestion = BaseQuestion & {
	type: "programming";
	answers: null;
	language: string;
	template: string;
	expectedOutput: string;
};
