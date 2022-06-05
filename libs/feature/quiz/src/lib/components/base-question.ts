export type BaseQuestion = {
	questionId: string;
	type: string;
	statement: string;
	hint?: {
		disabled?: boolean;
		content: string;
	};
	answers:
		| {
				answerId: string;
				content: string;
				isCorrect: boolean;
		  }[]
		| null;
};
