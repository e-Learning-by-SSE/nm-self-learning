import { toPlainText } from "./liascript-api-utils";
import { Quiz } from "@self-learning/quiz";
import { MissedElement } from "./types";

/**
 * Converts all quizzes of a Nano-Module into LiaScript format.
 * @param quiz The quizzes of a Nano-Module to convert.
 * @param markdownify A function to escape a markdown-formatted text to be used in LiaScript.
 * @returns
 */
export function convertQuizzes(
	quiz: Quiz,
	markdownify: (input: string) => string,
	onUnsupportedItem: (report: MissedElement) => void
) {
	const convertedQuizzes: string[] = [];
	let programmingTaskWithSolutions = false;
	let programmingTaskWithHints = false;
	for (const [index, question] of quiz.questions.entries()) {
		switch (question.type) {
			case "multiple-choice": {
				convertedQuizzes.push(
					markdownify(
						createMultipleChoiceQuestion(
							question.statement,
							question.answers,
							question.hints
						)
					)
				);
				break;
			}
			case "exact": {
				const answers = `- [[${question.acceptedAnswers[0].value}]]\n`;
				const hints = addHints(question.hints);
				const answerScript = addTextQuizOptionScript(question.acceptedAnswers);
				convertedQuizzes.push(
					markdownify(question.statement + "\n\n" + answers + hints + answerScript)
				);
				break;
			}
			case "text": {
				// As we have no "correct" answer for this, we just use a text input which cannot be wrong.
				const answers = `- [[Freitext]]\n`;
				const hints = addHints(question.hints);
				const answerScript = `<script>\nlet input = "@input".trim()\ninput != ""</script>\n`;
				convertedQuizzes.push(
					markdownify(question.statement + "\n\n" + answers + hints + answerScript)
				);
				break;
			}
			case "cloze":
				{
					console.log("Cloze Question: ", question);
					let answer = question.clozeText;
					const conversionError: () => void = () => {
						onUnsupportedItem({
							type: "clozeText",
							id: question.questionId,
							index,
							cause: "unsupportedAnswerType"
						});
					};
					[answer] = addClozeQuiz(answer, conversionError);
					convertedQuizzes.push(markdownify(question.statement + "\n\n" + answer));
				}
				break;
			case "programming":
				{
					console.log("Programming Question: ", question);
					let code = `\`\`\`${question.language}\n`;

					if (question.custom.mode == "standalone") {
						code += "\n\n";
					} else {
						code += question.custom.solutionTemplate; //provide the starting point for the solution
					}
					code += "\n```\n";
					if (
						//Only make code executable when the code is javascript or typescript
						question.language == `javascript`
					) {
						code += `<script>@input</script>\n`;
					} else {
						// Report unsupported programming language
						onUnsupportedItem({
							type: "programming",
							id: question.questionId,
							index,
							language: question.language,
							cause: "unsupportedLanguage"
						});
					}
					//const hints = addHints(question.hints); Does not work when converted
					programmingTaskWithHints =
						programmingTaskWithHints || question.hints.length > 0;
					programmingTaskWithSolutions =
						programmingTaskWithSolutions || question.custom.solutionTemplate.length > 0;
					convertedQuizzes.push(markdownify(question.statement + "\n\n" + code));
				}
				break;
			default:
				console.log(`Unknown question type: ${question.type}`);
				break;
		}
	}
	// Report general unsupported features, instead of reporting each unsupported feature per quiz
	if (programmingTaskWithHints) {
		onUnsupportedItem({
			type: "programmingUnspecific",
			cause: "hintsUnsupported"
		});
	}
	if (programmingTaskWithSolutions) {
		onUnsupportedItem({
			type: "programmingUnspecific",
			cause: "unsupportedSolution"
		});
	}
	return convertedQuizzes;
}

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
export function addHints(hints: { hintId: string; content: string }[]) {
	return hints.map(hint => `[[?]] ${toPlainText(hint.content)}`).join("\n");
}

/**
 * Adds a script to a quiz question which checks if the answer is correct. The advantage is, this can accept multiple different answers like synonyms.
 * Only needed in case the question allows for multiple correct answers.
 * @param acceptedAnswers an array of answers and their respective ID, should be > 1 as this function is not needed otherwise.
 * @returns a string denoting a script accepting each of the different answers as correct.
 */
export function addTextQuizOptionScript(
	acceptedAnswers: { value: string; acceptedAnswerId: string }[]
) {
	let script = `<script>\n`;
	script += `let input = "@input".trim()\n`;
	for (const [i, answer] of acceptedAnswers.entries()) {
		if (i == acceptedAnswers.length - 1) {
			script += `input == "${answer.value}"\n`;
		} else {
			script += `input == "${answer.value}" ||`;
		}
	}
	script += `</script>\n`;
	return script;
}

/**
 * Function to add a gap text question to the markdown file. Done by iterating over each letter to find the gaps as denoted by the e-learning platform and then converting them to the lia script format.
 * There is no complete conversion as the lia script side does not have a equivalent to the multiple answer option of the question.
 * We are looking for { [T/C] : <Answer options> } where answer options be single choice, free text with one or multiple correct answers
 * @param text The complete text including the gaps as denoted by the e-learning platform.
 * @returns The text with the lia script setup.
 */
const removeSelfLearAnswerStructure = /(?<!\\)([\]|[])/g; //Our cloze quizzes use [] to mark correct answers, we do not need this
const removeClosingCurlyBracesOfAnswer = /}(?=[^}]*$)/; //Removes only the last curly braces of the answer and stops looking ahead, replaces it with ]]
const identifyGapsWithMultipleCorrectAnswers = /\[\[\s*T:\s*([^,]+,)(?=.*\])/; //catches our gaps with multiple correct answers
const removeSelfLearnAnswerType = /[T|C]:/g; //removes the T or C and the : of the answer type
const identifyTypeOfAnswer = /C:/; //checks if this is a drop down menu or a free text
const identifyCorrectAnswersInMultipleChoiceGaps =
	/(?<=\[\[\s#|,#|\[\[#|,\s#)\s*(.*?)\s*(?=,|\]\]|\s,|\s\]\])/g; //Grabs the correct answers in { C: [#option, option2]} which is denoted by a #
const removeTheSelfLearnCorrectAnswerMarker =
	/(?<=\[\[\s|,|\[\[|,\s)\s*#(?=.*,|.*\]\]|.*\s,|.*\s\]\])/; //removes the # of the current answer
const startOfAnswerBlock = RegExp(/\{\s*[TC]\s*:\s*.*?\s*/); // searches start of answer option block
/**
 * Function that gets all answer blocks from a cloze style question.
 * It does so by iterating over the text looking for the start of a block and then counting curly braces to make sure
 * it finds the end while still allowing for any number of nested structures.
 */
function getAllClozeAnswerBlocks(text: string): [number, number, string][] {
	const matches: [number, number, string][] = [];
	const chars = [...text];
	let curlyBracketsCount = 0; //indicator/ counter for {
	let index = 0; //the index where the { is found
	let indexEnd = 0; //the index where the last closing } is found
	let foundEndOfBlock = false; //used to indicate that a cloze answer is fully found and allows the conversion to start
	let foundStartOfBlock = false;

	for (let i = 0; i < chars.length; i++) {
		if (chars[i] == `{`) {
			curlyBracketsCount++;
			if (!foundStartOfBlock) {
				foundStartOfBlock = startOfAnswerBlock.test(text.substring(i, i + 5)); //i+5 as this is our tolerance for correct syntax
				if (foundStartOfBlock) {
					index = i;
					curlyBracketsCount = 1;
				}
			}
		}

		if (chars[i] == `}`) {
			curlyBracketsCount--;
			if (curlyBracketsCount == 0 && foundStartOfBlock) {
				foundEndOfBlock = true;
				foundStartOfBlock = false;
			}
		}
		if (foundEndOfBlock) {
			indexEnd = i + 1;
			matches.push([index, indexEnd, text.substring(index, indexEnd)]);
			foundEndOfBlock = false;
		}
	}
	return matches;
}

function transformClozeAnswerBlock(
	[index, indexEnd, answerBlock]: [number, number, string],
	conversionError: () => void
): [number, number, string] {
	const transformedAnswer = transformMultipleChoiceAnswerBlock(
		transformMultipleAnswerTextBlock(
			answerBlock
				.replace(removeSelfLearAnswerStructure, ``)
				.replace(`{`, `[[`)
				.replace(removeClosingCurlyBracesOfAnswer, `]]`),
			conversionError
		)
	).replace(/,/g, `|`);
	return [index, indexEnd, transformedAnswer];
}

function transformMultipleAnswerTextBlock(
	transformedAnswer: string,
	conversionError: () => void
): string {
	const tMatch = transformedAnswer.match(identifyGapsWithMultipleCorrectAnswers); //catches our gaps with multiple correct answers
	if (tMatch != null) {
		transformedAnswer =
			transformedAnswer.substring(
				0,
				transformedAnswer.indexOf(tMatch[0]) + tMatch[0].length - 1
			) + //cut off everything after the first option and close it with new ]]
			`]]`;
		conversionError();
	}
	return transformedAnswer;
}

function transformMultipleChoiceAnswerBlock(transformedAnswer: string): string {
	const cMatch = transformedAnswer.match(identifyTypeOfAnswer); // prepare for selection type word
	transformedAnswer = transformedAnswer.replace(removeSelfLearnAnswerType, ``); // removes the unneeded T and C starters
	if (cMatch != null) {
		const word = transformedAnswer.match(identifyCorrectAnswersInMultipleChoiceGaps);
		if (word != null) {
			for (const match of word) {
				const start = transformedAnswer.indexOf(match);
				const end = start + match.length;
				transformedAnswer = (
					transformedAnswer.slice(0, start) +
					`(` +
					transformedAnswer.slice(start, end) +
					`)` +
					transformedAnswer.slice(end)
				).replace(removeTheSelfLearnCorrectAnswerMarker, ``); //get rid of the # of the current answer;
			}
		}
	}
	return transformedAnswer;
}

export function addClozeQuiz(text: string, conversionError: () => void): string {
	const matches = getAllClozeAnswerBlocks(text);

	const transformedMatches = matches.map(match =>
		transformClozeAnswerBlock(match, conversionError)
	);
	let offset = 0; //needed as we transform the whole text at once and need to adjust the index of the next cloze answer
	transformedMatches.forEach(([index, indexEnd, transformedAnswer]) => {
		text = text.slice(0, index + offset) + transformedAnswer + text.slice(indexEnd + offset);
		offset += transformedAnswer.length - (indexEnd - index);
	});
	console.log("OUTPUT CLOZE: ", text);
	return text;
}
