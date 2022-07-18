import { getRandomId } from "@self-learning/util/common";

export type Chapter = {
	type: "chapter";
	title: string;
	content: Content;
};

export type ChapterWithNr = {
	type: "chapter";
	title: string;
	chapterNr: string;
	chapterId: string;
	content: MappedContent;
};

export type LessonWithNr = { type: "lesson"; lessonNr: number; lessonId: string };

export type Lesson = {
	type: "lesson";
	title: string;
	lessonId: string;
	hasQuiz: boolean;
	requires?: Competence[];
	rewards?: Competence[];
};

export type Competence = { title: string; level: number; context?: string };

export type Content = (Chapter | Lesson)[];

export type Summary = {
	count: {
		lessons: number;
		chapters: number;
		quizzes: number;
	};
	competences: Map<string, Competence>;
};

export type MappedContent = (ChapterWithNr | LessonWithNr)[];

export function mapContent(
	content: Content,
	lessonNrRef = { lessonNr: 1 },
	parentChapter = ""
): MappedContent {
	let chapterCount = 1;

	const mappedContent: MappedContent = content.map((item): MappedContent[0] => {
		if (item.type === "chapter") {
			const chapterNr =
				parentChapter === "" ? `${chapterCount}` : `${parentChapter}.${chapterCount}`;

			chapterCount++;

			return {
				type: "chapter",
				chapterNr: chapterNr,
				chapterId: getRandomId(),
				content: mapContent(item.content, lessonNrRef, chapterNr),
				title: item.title
			};
		}

		if (item.type === "lesson") {
			return {
				...item,
				lessonNr: lessonNrRef.lessonNr++
			};
		}

		return item;
	});

	return mappedContent;
}
