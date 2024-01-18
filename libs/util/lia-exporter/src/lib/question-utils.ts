import { toPlainText } from "./liascript-api-utils";

/**
 * Converts a multiple choice question into LiaScript format.
 * @param question The question (statement) of the multiple choice question.
 * @param answerOptions The allowed answer options of the multiple choice question.
 * @param hints Optional hints for the multiple choice question.
 * @returns The question which may be used as input for the LiaScript API.
 * However, markdown must be preprocessed before using the API.
 */
export function createMultipleChoiceQuestion(
	question: string,
	answerOptions: { content: string; isCorrect: boolean }[],
	hints: { hintId: string; content: string }[]
) {
	let mc = question + "\n\n";
	for (const answer of answerOptions) {
		if (answer.isCorrect) {
			mc += `- [[x]] ${answer.content}\n`;
		} else {
			mc += `- [[ ]] ${answer.content}\n`;
		}
	}
	mc += addHints(hints);

	return mc;
}

/**
 * Converts SelfLearnHints (content + ID) into LiaScript format.
 * @param hints The hints of a question to convert.
 * @returns A string which may be used as input for the LiaScript API.
 */
function addHints(hints: { hintId: string; content: string }[]) {
	return hints.map(hint => `[[?]] ${toPlainText(hint.content)}`).join("\n");
}
