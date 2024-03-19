import { MissedElement } from "./lia-exporter";
import { toPlainText } from "./liascript-api-utils";
import { Quiz } from "@self-learning/quiz";

/**
 * Converts all quizzes of a Nano-Module into LiaScript format.
 * @param quiz The quizzes of a Nano-Module to convert.
 * @param markdownify A function to escape a markdown-formatted text to be used in LiaScript.
 * @returns
 */
type QuestionType = Quiz["questions"][0];
export function convertQuizzes(
	quiz: Quiz,
	markdownify: (input: string) => string,
	onUnsupportedItem: (report: MissedElement) => void
) {
	const convertedQuizzes: string[] = []; // entfernen -> keine Seiteneffekte -> property zurueckgeben
	let programmingTaskWithSolutions = false;
	let programmingTaskWithHints = false;

	for (const [index, question] of quiz.questions.entries()) {
		switch (question.type) {
			case "multiple-choice": {
				convertedQuizzes.push(convertMultipleChoice({ question, markdownify }));
				break;
			}
			case "exact": {
				convertedQuizzes.push(convertExactQuiz({ question, markdownify }));
				break;
			}
			case "text": {
				convertedQuizzes.push(convertTextQuiz({ question, markdownify }));
				break;
			}
			case "cloze":
				{
					convertedQuizzes.push(
						convertClozeAnswerBlock({
							question,
							markdownify,
							onUnsupportedItem,
							index
						})
					);
				}
				break;
			case "programming":
				{
					const result = convertProgrammingQuiz({
						question,
						markdownify,
						onUnsupportedItem,
						index
					});
					convertedQuizzes.push(result.question);
					programmingTaskWithHints = programmingTaskWithHints || result.hintError;
					programmingTaskWithSolutions =
						programmingTaskWithSolutions || result.solutionError;
				}
				break;
			default:
				onUnsupportedItem({
					type: "unknownQuestionType",
					index,
					id: question.questionId,
					questionType: question.type
				});
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

export function convertTextQuiz({
	question,
	markdownify
}: {
	question: QuestionType;
	markdownify: (input: string) => string;
}): string {
	return markdownify(
		question.statement +
			"\n\n" +
			"- [[Freitext]]\n" +
			addHints(question.hints) +
			`\n<script>\nlet input = "@input".trim()\ninput != ""</script>\n`
	);
}

export function convertExactQuiz({
	question,
	markdownify
}: {
	question: QuestionType & { type: "exact" };
	markdownify: (input: string) => string;
}): string {
	return markdownify(
		question.statement +
			"\n\n" +
			`- [[${question.acceptedAnswers[0].value}]]\n` +
			addHints(question.hints) +
			addTextQuizOptionScript(question.acceptedAnswers)
	);
}

/**
 * Converts a multiple choice question into LiaScript format.
 * @param question The question (statement) of the multiple choice question.
 * @param markdownify A function to escape a markdown-formatted text to be used in LiaScript.
 * @returns The question which may be used as input for the LiaScript API.
 * However, markdown must be preprocessed before using the API.
 */

export function convertMultipleChoice({
	question,
	markdownify
}: {
	question: QuestionType & { type: "multiple-choice" };
	markdownify: (input: string) => string;
}): string {
	let mc = question.statement + "\n\n";
	for (const answer of question.answers) {
		if (answer.isCorrect) {
			mc += `- [[x]] ${answer.content}\n`;
		} else {
			mc += `- [[ ]] ${answer.content}\n`;
		}
	}
	return markdownify(mc + addHints(question.hints));
}

export function convertProgrammingQuiz({
	question,
	markdownify,
	onUnsupportedItem,
	index
}: {
	question: QuestionType & { type: "programming" };
	markdownify: (input: string) => string;
	onUnsupportedItem: (report: MissedElement) => void;
	index: number;
}): { question: string; hintError: boolean; solutionError: boolean } {
	const codeBlockStartSequence = "```";
	let code = codeBlockStartSequence + question.language + "\n";
	if (question.custom.mode === "standalone") {
		code += "\n\n";
	} else {
		code += question.custom.solutionTemplate; //provide the starting point for the solution
	}
	code += "\n" + codeBlockStartSequence + "\n";
	if (question.language === `javascript`) {
		code += "<script>@input</script>\n";
	} else {
		onUnsupportedItem({
			type: "programming",
			index: index,
			id: question.questionId,
			cause: "unsupportedLanguage",
			language: question.language
		});
	}
	return {
		question: markdownify(question.statement + "\n\n" + code),
		hintError: question.hints.length > 0,
		solutionError: question.custom.solutionTemplate.length > 0
	};
}

/**
 * Method to convert a cloze Quiz into a LiaScript compatible format.
 * @param index Index of the question
 * @param questionId The ID of the question
 * @param questionStatement The question text
 * @param questionClozeText The gap text making up the question
 * @param convertedQuizzes The list to store all converted quizzes
 * @param markdownify the method to fit the text into the liascript markdown
 * @param onUnsupportedItem Method to collect the errors of unsupported structures.
 */
export function convertClozeAnswerBlock({
	question,
	markdownify,
	onUnsupportedItem,
	index
}: {
	question: QuestionType & { type: "cloze" };
	markdownify: (input: string) => string;
	onUnsupportedItem: (report: MissedElement) => void;
	index: number;
}): string {
	const conversionError: () => void = () => {
		onUnsupportedItem({
			type: "clozeText",
			id: question.questionId,
			index,
			cause: "unsupportedAnswerType"
		});
	};
	return markdownify(
		question.statement + "\n\n" + addClozeQuiz(question.clozeText, conversionError)
	);
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
	let script = `<script>\nlet input = "@input".trim()\n`;
	for (const [i, answer] of acceptedAnswers.entries()) {
		if (i === acceptedAnswers.length - 1) {
			script += `input == "${answer.value}"\n`;
		} else {
			script += `input == "${answer.value}" ||`;
		}
	}
	script += "</script>\n";
	return script;
}

/**
 * Function that gets all answer blocks from a cloze style question.
 * It does so by iterating over the text looking for the start of a block and then counting curly braces to make sure
 * it finds the end while still allowing for any number of nested structures.
 */
const startOfAnswerBlock = RegExp(/\{\s*[TC]\s*:\s*.*?\s*/); // searches start of answer option block

function getAllClozeAnswerBlocks(
	text: string
): { indexStartAnswerBlock: number; indexEndAnswerBlock: number; answerBlock: string }[] {
	const matches: {
		indexStartAnswerBlock: number;
		indexEndAnswerBlock: number;
		answerBlock: string;
	}[] = [];
	const chars = [...text];
	let curlyBracketsCount = 0; //indicator/ counter for {
	let indexStartAnswerBlock = 0; //the index where the { is found
	let indexEndAnswerBlock = 0; //the index where the last closing } is found
	let foundEndOfBlock = false; //used to indicate that a cloze answer is fully found and allows the conversion to start
	let foundStartOfBlock = false;

	for (let i = 0; i < chars.length; i++) {
		if (chars[i] === "{") {
			curlyBracketsCount++;
			if (!foundStartOfBlock) {
				foundStartOfBlock = startOfAnswerBlock.test(text.substring(i, i + 5)); //i+5 as this is our tolerance for correct syntax
				if (foundStartOfBlock) {
					indexStartAnswerBlock = i;
					curlyBracketsCount = 1;
				}
			}
		}

		if (chars[i] === "}") {
			curlyBracketsCount--;
			if (curlyBracketsCount === 0 && foundStartOfBlock) {
				foundEndOfBlock = true;
				foundStartOfBlock = false;
			}
		}
		if (foundEndOfBlock) {
			indexEndAnswerBlock = i + 1;
			matches.push({
				indexStartAnswerBlock: indexStartAnswerBlock,
				indexEndAnswerBlock: indexEndAnswerBlock,
				answerBlock: text.substring(indexStartAnswerBlock, indexEndAnswerBlock)
			});
			foundEndOfBlock = false;
		}
	}
	return matches;
}
const removeSelfLearAnswerStructure = /(?<!\\)([\]|[])/g; //Our cloze quizzes use [] to mark correct answers, we do not need this
const removeClosingCurlyBracesOfAnswer = /}(?=[^}]*$)/; //Removes only the last curly braces of the answer and stops looking ahead, replaces it with ]]

/**
 * The method transforms the cloze answers for a given array. First it replaces the starting and ending curly braces with [[ and ]]
 *
 * @param param0 This is a triplet of the start index, the end index and the answer block itself. Only the text will be transformed.
 * @param conversionError In case we encounter un convertible answer blocks we propagate the error
 * @returns
 */

function transformClozeAnswerBlock(
	{
		indexStartAnswerBlock,
		indexEndAnswerBlock,
		answerBlock
	}: { indexStartAnswerBlock: number; indexEndAnswerBlock: number; answerBlock: string },
	conversionError: () => void
): { indexStartAnswerBlock: number; indexEndAnswerBlock: number; transformedAnswer: string } {
	const transformedAnswer = transformMultipleChoiceAnswerBlock(
		transformMultipleAnswerTextBlock(
			answerBlock
				.replace(removeSelfLearAnswerStructure, "")
				.replace("{", "[[")
				.replace(removeClosingCurlyBracesOfAnswer, "]]"),
			conversionError
		)
	).replace(/,/g, "|");
	return { indexStartAnswerBlock, indexEndAnswerBlock, transformedAnswer };
}

const identifyGapsWithMultipleCorrectAnswers = /\[\[\s*T:\s*([^,]+,)(?=.*\])/; //catches our gaps with multiple correct answers
/**
 * This method deals with multiple answer free text blocks. These are not supported by liaScript thus we propagate an
 * error if we encounter them. The block will be translated to a free text block with only one correct answer.
 * The first correct answer (from left to right) will be used.
 * If the block does not confirmed multiple answers it is returned as is.
 * @param transformedAnswer The answer block to transform
 * @param conversionError In case we are dealing with a multiple answer free text block this will propagate the error
 * @returns the transformed answer
 */
function transformMultipleAnswerTextBlock(
	transformedAnswer: string,
	conversionError: () => void
): string {
	const tMatch = transformedAnswer.match(identifyGapsWithMultipleCorrectAnswers); //catches our gaps with multiple correct answers
	if (tMatch != null) {
		//cut off everything after the first option and close it with new ]]
		transformedAnswer =
			transformedAnswer.substring(
				0,
				transformedAnswer.indexOf(tMatch[0]) + tMatch[0].length - 1
			) + "]]";

		// Cloze with alternative answers detected, but not supported by LiaScript
		// Return first answer and create report that item could not completely exported (MissingElement)
		conversionError();
	}
	return transformedAnswer;
}

const removeSelfLearnAnswerType = /[T|C]:/g; //removes the T or C and the : of the answer type
const identifyTypeOfAnswer = /C:/; //checks if this is a drop down menu or a free text
const identifyCorrectAnswersInMultipleChoiceGaps =
	/(?<=\[\[\s#|,#|\[\[#|,\s#)\s*(.*?)\s*(?=,|\]\]|\s,|\s\]\])/g; //Grabs the correct answers in { C: [#option, option2]} which is denoted by a #
const removeTheSelfLearnCorrectAnswerMarker =
	/(?<=\[\[\s|,|\[\[|,\s)\s*#(?=.*,|.*\]\]|.*\s,|.*\s\]\])/; //removes the # of the current answer

/**
 * Deals with multiple choice answer blocks (via dropdown). First all correct answers are identified and then transformed to fit liaScript syntax.
 * It will just return the input text if there is no multiple choice sighted.
 * @param transformedAnswer The answer block to transform
 * @returns The transformed answer block
 */

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
					"(" +
					transformedAnswer.slice(start, end) +
					")" +
					transformedAnswer.slice(end)
				).replace(removeTheSelfLearnCorrectAnswerMarker, ""); //get rid of the # of the current answer;
			}
		}
	}
	return transformedAnswer;
}

/**
 * Function to add a gap text question to the markdown file. First all answer blocks are collected from the text.
 * These are then transformed to fit liaScript syntax and finally they are added in the text to replace the original answer blocks
 * @param text The complete text including the gaps as denoted by the e-learning platform.
 * @returns The text with the lia script setup.
 */

export function addClozeQuiz(text: string, conversionError: () => void): string {
	let offset = 0; //needed as we transform the whole text at once and need to adjust the index of the next cloze answer

	return getAllClozeAnswerBlocks(text)
		.map(match => transformClozeAnswerBlock(match, conversionError))
		.reduce(
			(
				transformedText,
				{ indexStartAnswerBlock, indexEndAnswerBlock, transformedAnswer }
			) => {
				//The replacement NEEDS to be done before the offset is updated! It is meant to fix the new char positions in the string AFTER changing the answer blocks with new length
				const temp =
					transformedText.slice(0, indexStartAnswerBlock + offset) +
					transformedAnswer +
					transformedText.slice(indexEndAnswerBlock + offset);
				offset += transformedAnswer.length - (indexEndAnswerBlock - indexStartAnswerBlock);
				return temp;
			},
			text
		);
}
