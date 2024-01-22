import { t } from "@self-learning/api";
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
 * @param text The complete text including the gaps as denoted by the e-learning platform.
 * @returns The text with the lia script setup.
 */
export function addClozeQuiz(text: string) {
	//const text = "Das ist eine {T: [Textantwort]}. Das ist ein Textfeld {T: [Antwort, Lücke]} mit zwei richtigen Möglichkeiten.Das ist ein Single-Choice Feld mit {C: [#eins, zwei]} Antwortmöglichkeiten, aus denen ausgewählt werden muss. Falsche Antworten werden mit einem # gekennzeichnet.LaTeX kann verwendet werden, um mathematische Formeln und Symbole darzustellen. Zum Beispiel: $$V_{sphere} = \frac{4}{3}\pi r^3$$. Es kann auch in Single-Choice Feldern benutzt werden: {C: [#eins, $$V_{sphere} = \frac{4}{3}\pi r^3$$]}"
	let chars = [...text];
	let start = 0; //indicator/ counter for {
	let index = 0; //the index where the { is found
	let indexEnd = 0; //the index where the last closing } is found
	let found = 0; //confirmation that the first { is used to denote a answer in the cloze text
	let conf = 0; //as the second character can be a letter T or C make sure that the third is a ":" only then consider a answer block found
	let reducedToN = false; //used to indicate that a cloze answer is fully found and allows the conversion to start
	for (let i = 0; i < chars.length; i++) {
		//run through all letters of the text
		if (chars[i] == `}`) {
			//created to allow/ deal with } inside of normal text or answer blocks
			start--;
			if (start <= 0) {
				//no reason / use to have it below 0, but meant as a catch for } without the opening counterpart
				start = 0;
				if (conf == 1) {
					//Only start the reduction to 0 IF conf is 1 meaning a answer block is identified
					reducedToN = true;
				}
			}
		}
		//set found if the character matches one of the expected next ones only IF start is 1 otherwise reset index as well as start
		if (start == 1 && found == 0 && chars[i] != `T` && chars[i] != `C` && chars[i] != " ") {
			start = 0;
			index = 0;
		} else if (start == 1 && found == 0) {
			found++;
		}
		//Only if start and found are set, add conf if the next character matches the expected ones
		if (start == 1 && found == 1 && conf == 0 && chars[i] != `:`) {
			//make it insensitive to whitespaces in the start of the answer block
			if (chars[i] != `C` && chars[i] != `T` && chars[i] != " ") {
				start = 0;
				found = 0;
				index = 0;
			}
		} else if (start == 1 && found == 1 && conf == 0) {
			conf++;
		}
		//count the opening {}
		if (chars[i] == `{`) {
			start++;
			if (start == 1) {
				index = i;
			}
		}
		if (reducedToN) {
			indexEnd = i + 1;
			//transform a single answer block into the format needed for lia Script
			let newString = text.substring(index, indexEnd).replace(/(?<!\\)([\]|[])/g, ``); //remove the unneeded [ ]
			newString = newString.replace(`{`, `[[`); //Matches and substitutes the first { for the needed [[
			newString = newString.replace(/}(?=[^}]*$)/, `]]`); //Matches and replaced only the last } with ]]
			const tmatch = newString.match(/\[\[\s*T:\s*([^,]+,)(?=.*\])/); //catches our gaps with multiple correct answers
			if (tmatch != null) {
				newString =
					newString.substring(0, newString.indexOf(tmatch[0]) + tmatch[0].length - 1) + //cut off everything after the first option and close it with new ]]
					`]]`;
			}
			const cmatch = newString.match(/C:/); // prepare for selection type word
			newString = newString.replace(/[T|C]:/g, ``); // removes the unneeded T and C starters
			//Deal with the selection sub case by adding () all answers marked by #
			if (cmatch != null) {
				const word = newString.match(
					/(?<=\[\[\s#|,#|\[\[#|,\s#)\s*(.*?)\s*(?=,|\]\]|\s,|\s\]\])/g
				);
				if (word != null) {
					for (const match of word) {
						const strWord = match; //only get the matched word!
						const start = newString.indexOf(strWord);
						const end = start + strWord.length;
						newString =
							newString.slice(0, start) +
							`(` +
							newString.slice(start, end) +
							`)` +
							newString.slice(end);
						newString = newString.replace(
							/(?<=\[\[\s|,|\[\[|,\s)\s*#(?=.*,|.*\]\]|.*\s,|.*\s\]\])/,
							``
						); //get rid of the # of the current answer
					}
				}
			}
			newString = newString.replace(/,/g, `|`); // replace all , with |
			reducedToN = false;
			text = text.slice(0, index) + newString + text.slice(indexEnd); //replace the old answer block with the new one
			indexEnd = 0;
			found = 0;
			conf = 0;
			chars = [...text]; // re split the text as the index of everything might have changed
		}
	}
	return text;
}

export function addProgrammingTask(text: string) {}
