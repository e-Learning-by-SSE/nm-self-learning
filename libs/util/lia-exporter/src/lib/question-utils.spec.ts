import {
	convertTextQuiz,
	convertExactQuiz,
	convertMultipleChoice,
	convertClozeAnswerBlock
} from "./question-utils";
import { Quiz } from "@self-learning/quiz";
import { markdownify as markdownifyDelegate, MediaFileReplacement } from "./liascript-api-utils";
import { MissedElement } from "./lia-exporter";

//Preparing the test methods and types!
type QuestionTypeText = Quiz["questions"][0] & { type: "text" };
type QuestionTypeExact = Quiz["questions"][0] & { type: "exact" };
type QuestionTypeMultiple = Quiz["questions"][0] & { type: "multiple-choice" };
type QuestionTypeCloze = Quiz["questions"][0] & { type: "cloze" };

const mediaFiles: MediaFileReplacement[] = [];

function markdownifyModifiedReport(
	input: string,
	onUnsupportedItem: (missedElement: MissedElement) => void
) {
	const { markdown, resources } = markdownifyDelegate(input, onUnsupportedItem, {});
	mediaFiles.push(...resources);

	return markdown;
}

function markdownify(input: string) {
	const onUnsupportedItem = (missedElement: MissedElement) => {
		console.log("Unsupported item", missedElement);
	};

	return markdownifyModifiedReport(input, onUnsupportedItem);
}

const onUnsupportedItem = (missedElement: MissedElement) => {
	console.log("Unsupported item", missedElement);
};

describe("Quizzes", () => {
	describe("convertTextQuiz", () => {
		it("Valid Quiz; 1 Hint; No answer -> Success; Non empty answer check", () => {
			const question: QuestionTypeText = {
				type: "text",
				statement: "# Was ist 1 + 1 ?",
				questionId: "TextId",
				withCertainty: true,

				hints: [{ hintId: "1", content: "Ein Hinweis." }]
			};

			const expectedOutput = `<section>

# Was ist 1 + 1 ?

- [[Freitext]]
[[?]] Ein Hinweis.
<script>
let input = "@input".trim()
input != ""</script>

</section>`;

			const result = convertTextQuiz({ question, markdownify });

			expect(result).toEqual(expectedOutput);
		});
	});

	describe("convertExactQuiz", () => {
		it("Valid Quiz; No Hint; 1 answer -> Success", () => {
			const question: QuestionTypeExact = {
				type: "exact",
				statement: "# Was ist 1 + 1 ?",
				questionId: "exactId",
				withCertainty: true,
				hints: [],
				caseSensitive: true,
				acceptedAnswers: [{ value: "2", acceptedAnswerId: "answerId" }]
			};

			const expectedOutput = `<section>

# Was ist 1 + 1 ?

- [[2]]
<script>
let input = "@input".trim()
input == "2"
</script>

</section>`;

			const result = convertExactQuiz({ question, markdownify });

			expect(result).toEqual(expectedOutput);
		});
	});

	describe("convertMultipleChoice", () => {
		it("Valid MC; 2 Hints; Answers -> Success", () => {
			const question: QuestionTypeMultiple = {
				type: "multiple-choice",
				statement: "# How was your day?\nA description text related to the question.",
				questionId: "multipleId",
				withCertainty: true,
				questionStep: 1,
				hints: [
					{
						hintId: "abc",
						content: "The first hint."
					},
					{
						hintId: "def",
						content: "# Another hint with formatted text \n- Eins\n- Zwei"
					}
				],
				answers: [
					{ content: "Very Good", answerId: "answerId", isCorrect: true },
					{ content: "Good", answerId: "answerId", isCorrect: true },
					{ content: "Bad", answerId: "answerId", isCorrect: false },
					{ content: "Very Bad", answerId: "answerId", isCorrect: false }
				]
			};

			const expectedOutput = `<section>

# How was your day?
A description text related to the question.

- [[x]] Very Good
- [[x]] Good
- [[ ]] Bad
- [[ ]] Very Bad
[[?]] The first hint.
[[?]] Another hint with formatted text: - Eins - Zwei
</section>`;

			const result = convertMultipleChoice({ question, markdownify });

			expect(result).toEqual(expectedOutput);
		});
	});

	describe("convertClozeChoice", () => {
		it("Valid Cloze; No Hints; Answers -> Success", () => {
			const question: QuestionTypeCloze = {
				type: "cloze",
				clozeText:
					"Das ist eine {T: [Textantwort]}. Das ist ein Textfeld {T: [Antwort, Lücke]} mit zwei richtigen Möglichkeiten.\nDas ist ein Single-Choice Feld mit {C: [#eins, zwei]} Antwortmöglichkeiten, aus denen ausgewählt werden muss. Falsche Antworten werden mit einem # gekennzeichnet.\nLaTeX kann verwendet werden, um mathematische Formeln und Symbole darzustellen. Zum Beispiel: $$V_{sphere} = \\frac{4}{3}\\pi r^3$$. Es kann auch in Single-Choice Feldern benutzt werden: {C: [#eins, $$V_{sphere} = \\frac{4}{3}\\pi r^3$$]}",
				statement: "",
				questionId: "clozeId",
				withCertainty: false,
				hints: []
			};

			const expectedOutput = `Das ist eine [[ Textantwort]]. Das ist ein Textfeld [[ Antwort]] mit zwei richtigen Möglichkeiten.
Das ist ein Single-Choice Feld mit [[(eins)| zwei]] Antwortmöglichkeiten, aus denen ausgewählt werden muss. Falsche Antworten werden mit einem # gekennzeichnet.
LaTeX kann verwendet werden, um mathematische Formeln und Symbole darzustellen. Zum Beispiel: $$V_{sphere} = \\frac{4}{3}\\pi r^3$$. Es kann auch in Single-Choice Feldern benutzt werden: [[(eins)| $$V_{sphere} = \\frac{4}{3}\\pi r^3$$]]`;

			const result = convertClozeAnswerBlock({
				question,
				markdownify,
				onUnsupportedItem,
				index: 1
			});

			expect(result).toEqual(expectedOutput);
		});
	});
});
