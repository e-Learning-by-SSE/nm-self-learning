import { LessonType } from "@prisma/client";
import { compileMarkdown } from "@self-learning/markdown";
import { LessonData } from "./lesson-data-access";

export async function getStaticLessonProps(lesson: LessonData) {
	let mdDescription = null;
	const mdArticle = null;
	let mdQuestion = null;
	let mdSubtitle = null;

	if (lesson.description) {
		mdDescription = await compileMarkdown(lesson.description);
	}

	if (lesson.subtitle && lesson.subtitle.length > 0) {
		mdSubtitle = await compileMarkdown(lesson.subtitle);
	}

	// TODO change to check if the lesson is self regulated
	if (lesson.lessonType === LessonType.SELF_REGULATED) {
		mdQuestion = await compileMarkdown(lesson.selfRegulatedQuestion ?? "Kein Inhalt.");
	}

	return {
		article: mdArticle,
		description: mdDescription,
		preQuestion: mdQuestion,
		subtitle: mdSubtitle
	};
}
