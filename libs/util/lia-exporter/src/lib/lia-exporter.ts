import {
	toPlainText,
	markdownify as markdownifyDelegate,
	ExportFormat,
	liaScriptExport,
	IndentationLevels,
	selectNarrator,
	removeStorageUrls
} from "./liascript-api-utils";
import { FullCourseExport as CourseWithLessons } from "@self-learning/teaching";
import { LessonContent as LessonExport } from "@self-learning/lesson";
import { Quiz } from "@self-learning/quiz";

import { CourseChapter, LessonContent, findContentType } from "@self-learning/types";
import { ExportOptions, MediaFileReplacement } from "./types";
import { createMultipleChoiceQuestion } from "./question-utils";
import JSZip = require("jszip");

/**
 * Generates a zip file (markdown file + media files)that can be imported into LiaScript.
 * @param param0 The course to export
 * @param exportOptions Options to consider
 * @returns A markdown string that can be used to write a LiaScript compatible markdown file.
 */
export async function exportCourseArchive(
	{ course, lessons }: CourseWithLessons,
	fn?: (msg: string) => void,
	exportOptions?: ExportOptions
) {
	const options: ExportOptions = {
		storageDestination: `media/${course.slug}/`,
		...exportOptions
	};
	const { markdown, mediaFiles } = await exportCourse({ course, lessons }, options);
	const zip = new JSZip();
	zip.file(`${course.title}.md`, markdown);

	for (const mediaFile of mediaFiles) {
		if (fn) {
			fn(`Fetch resource: ${mediaFile.source}`);
		}
		// TODO SE: fetch media file from storage
		// Based on: https://stackoverflow.com/a/52410044
		const blob = await fetch(mediaFile.source).then(r => r.blob());
		zip.file(mediaFile.destination, blob);
	}

	return zip.generateAsync({ type: "blob" });
}

/**
 * Generates a markdown file that can be imported into LiaScript.
 * @param param0 The course to export
 * @param exportOptions Options to consider
 * @returns A markdown string that can be used to write a LiaScript compatible markdown file.
 */
export async function exportCourseMarkdown(
	{ course, lessons }: CourseWithLessons,
	exportOptions?: ExportOptions
) {
	const { markdown } = await exportCourse({ course, lessons }, exportOptions);

	return markdown;
}

/**
 * Generates a markdown file that can be imported into LiaScript together with a list of extracted media files stored on our own storage.
 * @param param0 The course to export
 * @param exportOptions Options to consider
 * @returns A markdown string that can be used to write a LiaScript compatible markdown file.
 */
async function exportCourse({ course, lessons }: CourseWithLessons, exportOptions?: ExportOptions) {
	// Options for all (nested) export functions
	// Specifies default values, which may be overwritten by optional parameters
	const options: NonNullable<ExportOptions> = {
		addTitlePage: true,
		language: "de",
		narrator: "female",
		considerTopics: true,
		exportMailAddresses: true,
		storagesToInclude: [],
		storageDestination: `media/${course.slug}/`,
		...exportOptions
	};

	// List of media files, which were stored on our storage ans shall be exported (downloaded) as well
	const mediaFiles: MediaFileReplacement[] = [];

	// The JSON object that is used as input for the LiaScript API
	let courseDescription: string | undefined;
	if (course.description) {
		const { text, resources } = removeStorageUrls(toPlainText(course.description), options);
		courseDescription = text;
		mediaFiles.push(...resources);
	}
	const json: ExportFormat = {
		// The list of supported items are documented here:
		// https://liascript.github.io/course/?https://raw.githubusercontent.com/liaScript/docs/master/README.md#176
		meta: {
			title: course.title,
			author: course.authors.map(author => author.displayName).join(", "),
			...(options.exportMailAddresses && {
				email: course.authors.map(author => author.user.email).join(", ")
			}),
			date: new Date().toLocaleDateString(),
			version: "1.0",
			narrator: selectNarrator(options),
			...(courseDescription && { comment: courseDescription }),
			...(course.imgUrl && { logo: course.imgUrl })
		},
		sections: []
	};
	const sections = json.sections;

	// The lessons of the course, accessible by their ID
	const lessonsMap = convertLessonsToMap(lessons);

	if (options.addTitlePage) {
		addTitlePage();
	}

	for (const chapter of course.content as CourseChapter[]) {
		console.log(">>Adding a chapter", chapter.title); //Chapters are collections of lessons.
		const baseIndent = options.addTitlePage ? 2 : 1;

		addSection(chapter, baseIndent);
	}

	console.log(`Options: ${JSON.stringify(options)}`);
	console.log(`Media Files: ${mediaFiles.map(m => m.source).join(", ")}`);

	const markdown = await liaScriptExport(json);
	return { markdown, mediaFiles };

	/**
	 * Checks if a given (optional) URL points to a file on our storage.
	 * If so, it adds it to the list of media files and returns the relative path.
	 * @param url A media URL (video, image, etc.) which may point to our storage.
	 * @returns A relative URL or the input URL if it does not point to our storage.
	 */
	function relativizeUrl(url?: string) {
		if (url) {
			if (options.storagesToInclude && options.storagesToInclude.length > 0) {
				for (const storageUrl of options.storagesToInclude) {
					if (url.startsWith(storageUrl)) {
						const source = url;
						url = url.replace(storageUrl, options.storageDestination ?? "");
						mediaFiles.push({ source, destination: url });
						break;
					}
				}
			}

			return url;
		}

		return "";
	}

	function markdownify(input: string) {
		const { markdown, resources } = markdownifyDelegate(input, options);
		mediaFiles.push(...resources);

		return markdown;
	}

	/**
	 * Generates a title page for the course (indented by 1). This includes:
	 * - Title
	 * - Subtitle (optional)
	 * - Picture (optional)
	 * - Description (optional)
	 * - Subject (optional)
	 * - Specializations (optional)
	 */
	function addTitlePage() {
		console.log(">>Adding a title page");
		const section = {
			title: course.title,
			indent: 1 as IndentationLevels,
			body: [] as string[]
		};

		// Support that subtile may become optional in future
		course.subtitle && section.body.push(markdownify(course.subtitle));
		// Add (optional) picture after subtitle before (optional) description
		if (course.imgUrl) {
			const imgUrl = relativizeUrl(course.imgUrl);
			section.body.push(`![Course Logo](${imgUrl})`);
		}

		course.description && section.body.push(markdownify(course.description));

		// Add subject and specializations
		if (options.considerTopics) {
			course.subject && section.body.push(`**Fach:** ${course.subject.title}`);

			if (course.specializations.length > 0) {
				const topic =
					course.specializations.length > 1 ? "Spezialisierungen" : "Spezialisierung";
				section.body.push(
					`**${topic}:** ${course.specializations.map(s => s.title).join(", ")}`
				);
			}
		}
		sections.push(section);
	}

	function addSection(chapter: CourseChapter, indent: IndentationLevels) {
		console.log(">>>Adding a section", chapter.title);
		const section = {
			title: chapter.title,
			indent: indent,
			body: [] as (string | object)[]
		};

		if (chapter.description) {
			const description = markdownify(chapter.description);
			section.body.push(description);
		}

		sections.push(section);

		chapter.content.forEach(entry => {
			const lesson = lessonsMap.get(entry.lessonId);
			if (lesson) {
				const lessonIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
				addLesson(lesson, lessonIndent);
			}
		});
	}

	function addLesson(lesson: LessonExport, indent: IndentationLevels) {
		const nm = {
			title: lesson.title,
			indent: indent,
			body: [] as string[]
		};

		// Lesson's overview page, may contain:
		// - Sub title
		// - Description
		// - Self-regulated question
		lesson.subtitle && nm.body.push(markdownify(lesson.subtitle));
		lesson.description && nm.body.push(markdownify(lesson.description));
		lesson.selfRegulatedQuestion &&
			nm.body.push(markdownify(`**Aktivierungsfrage:** ${lesson.selfRegulatedQuestion}`));
		sections.push(nm);

		const lessonContent = lesson.content as LessonContent;

		const video = findContentType("video", lessonContent);
		if (video.content) {
			const videoIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const videoUrl = relativizeUrl(video.content.value.url);
			const videoPart = {
				title: "Video",
				indent: videoIndent,
				body: [`!?[Video](${videoUrl})`]
			};

			sections.push(videoPart);
		}

		const article = findContentType("article", lessonContent);
		if (article.content) {
			const articleIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const articleUrl = relativizeUrl(article.content.value.content);
			const articlePart = {
				title: "Artikel",
				indent: articleIndent,
				body: [articleUrl]
			};

			sections.push(articlePart);
		}

		const pdf = findContentType("pdf", lessonContent);
		if (pdf.content) {
			const pdfIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const pdfUrl = relativizeUrl(pdf.content.value.url);
			const pdfPart = {
				title: "PDF",
				indent: pdfIndent,
				body: [pdfUrl]
			};

			sections.push(pdfPart);
		}

		if (lesson.quiz) {
			const quizIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			const quizPart = {
				title: "Lernzielkontrolle",
				indent: quizIndent,
				body: [] as string[]
			};

			const quiz = lesson.quiz as Quiz;
			for (const question of quiz.questions) {
				switch (question.type) {
					case "multiple-choice": {
						quizPart.body.push(
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
						quizPart.body.push(
							markdownify(
								question.statement + "\n\n" + answers + hints + answerScript
							)
						);
						break;
					}
					case "text": {
						// As we have no "correct" answer for this, we just use a text input which cannot be wrong.
						const answers = `- [[Freitext]]\n`;
						const hints = addHints(question.hints);
						const answerScript = `<script>\nlet input = "@input".trim()\ninput != ""</script>\n`;
						quizPart.body.push(
							markdownify(
								question.statement + "\n\n" + answers + hints + answerScript
							)
						);
						break;
					}
					case "cloze":
						{
							console.log("Cloze Question: ", question);
							let answer = question.clozeText;
							answer = addClozeQuiz(answer);
							quizPart.body.push(markdownify(question.statement + "\n\n" + answer));
						}
						break;
					case "programming":
						{
							console.log("Programming Question: ", question);
						}
						break;
					default:
						console.log(`Unknown question type: ${question.type}`);
						break;
				}
			}

			sections.push(quizPart);
		}
	}
}

/**
 * Converts Lessons[] to Map<lessonId, Lesson>.
 * @param lessons The lessons to restructure.
 * @returns Lessons as map to identify them faster by their ID.
 */
function convertLessonsToMap(lessons: LessonExport[]) {
	const lessonsMap = new Map<string, LessonExport>();
	for (const lesson of lessons) {
		console.log(">>Adding a lesson to map?", lesson.title);
		lessonsMap.set(lesson.lessonId, lesson);
	}
	return lessonsMap;
}

function addHints(hints: { hintId: string; content: string }[]) {
	let hintsList = "";
	for (const hint of hints) {
		console.log("Writing a Hint to Console: ", hint);
		hintsList += `[[?]] ${toPlainText(hint.content)}\n`;
	}
	console.log("Hints: ", hintsList);
	return hintsList;
}

function addTextQuizOptionScript(acceptedAnswers: { value: string; acceptedAnswerId: string }[]) {
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

function addClozeQuiz(text: string) {
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
