import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { Quiz } from "@self-learning/quiz";

type QuizMarkdownData = {
	questionsMd: MdLookup;
	answersMd: MdLookup;
	hintsMd: MdLookupArray;
	processedQuestions: Quiz["questions"];
};

export const compileQuizMarkdown = async (quiz: Quiz): Promise<QuizMarkdownData> => {
	const questionsMd: MdLookup = {};
	const answersMd: MdLookup = {};
	const hintsMd: MdLookupArray = {};
	const processedQuestions: typeof quiz.questions = [];

	for (const question of quiz.questions) {
		questionsMd[question.questionId] = await compileMarkdown(question.statement);

		if (question.hints?.length > 0) {
			hintsMd[question.questionId] = [];

			for (const hint of question.hints) {
				hintsMd[question.questionId].push(await compileMarkdown(hint.content));
			}
		}

		if (question.type === "multiple-choice") {
			for (const answer of question.answers) {
				answersMd[answer.answerId] = await compileMarkdown(answer.content);
			}
		}

		processedQuestions.push(question);
	}

	return {
		questionsMd,
		answersMd,
		hintsMd,
		processedQuestions
	};
};
