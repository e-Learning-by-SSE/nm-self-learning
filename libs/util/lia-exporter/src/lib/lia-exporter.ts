import {
	toPlainText,
	markdownify,
	ExportFormat,
	liaScriptExport,
	IndentationLevels,
	LiaScriptSection
} from "./low-level-api";
import { FullCourseExport as CourseWithLessons } from "@self-learning/teaching";
import { LessonContent as LessonExport } from "@self-learning/lesson";
import { Quiz } from "@self-learning/quiz";
import { QuestionType, QuizContent } from "@self-learning/question-types";

import { CourseChapter, LessonContent, findContentType } from "@self-learning/types";

export function exportCourse({ course, lessons }: CourseWithLessons, addTitlePage = false) {
	const json: ExportFormat = {
		meta: {
			title: course.title,
			author: course.authors.join(", "),
			description: course.description ? toPlainText(course.description) : undefined,
			version: "1.0"
		},
		sections: []
	};

	if (addTitlePage) {
		const section = {
			title: course.title,
			indent: 1,
			body: [] as string[]
		};

		if (course.description) {
			const description = markdownify(course.description);
			section.body.push(description);
		}
	}

	const lessonsMap = new Map<string, LessonExport>();
	for (const lesson of lessons) {
		lessonsMap.set(lesson.lessonId, lesson);
	}
	for (const chapter of course.content as CourseChapter[]) {
		const baseIndent = addTitlePage ? 2 : 1;

		addSection(chapter, lessonsMap, baseIndent, json.sections);
	}

	return liaScriptExport(json);
}

function addSection(
	chapter: CourseChapter,
	lessons: Map<string, LessonExport>,
	indent: IndentationLevels,
	sections: LiaScriptSection[]
) {
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
		const lesson = lessons.get(entry.lessonId);
		if (lesson) {
			const lessonIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			addLesson(lesson, lessonIndent, sections);
		}
	});
}

function addLesson(lesson: LessonExport, indent: IndentationLevels, sections: LiaScriptSection[]) {
	const nm = {
		title: lesson.title,
		indent: indent,
		body: [] as string[]
	};

	if (lesson.description) {
		const description = markdownify(lesson.description);
		nm.body.push(description);
	}
	sections.push(nm);

	const lessonContent = lesson.content as LessonContent;

	const video = findContentType("video", lessonContent);
	if (video.content) {
		const videoIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
		const videoPart = {
			title: "Video",
			indent: videoIndent,
			body: [`!?[Video](${video.content.value.url})`]
		};

		sections.push(videoPart);
	}

	const article = findContentType("article", lessonContent);
	if (article.content) {
		const articleIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
		const articlePart = {
			title: "Artikel",
			indent: articleIndent,
			body: [markdownify(article.content.value.content, { htmlTag: "article" })]
		};

		sections.push(articlePart);
	}

	const pdf = findContentType("pdf", lessonContent);
	if (pdf.content) {
		const pdfIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
		const pdfPart = {
			title: "PDF",
			indent: pdfIndent,
			body: [pdf.content.value.url]
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
			console.log(question);
			switch (question.type) {
				case "multiple-choice": {
					let answers = "";
					for (const answer of question.answers) {
						if (answer.isCorrect) {
							answers += `- [[x]] ${markdownify(answer.content)}\n`;
						} else {
							answers += `- [[ ]] ${markdownify(answer.content)}\n`;
						}
					}
					quizPart.body.push(markdownify(question.statement + "\n\n" + answers));
					break;
				}
				case "exact":
					break;
				case "text":
					break;
				case "cloze":
					break;
				case "programming":
					break;
				default:
					console.log(`Unknown question type: ${question.type}`);
					break;
			}
		}

		sections.push(quizPart);
	}
}
