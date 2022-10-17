import { LessonInfo } from "@self-learning/types";

type Lesson = LessonInfo & { lessonNr: number };

type Chapter = {
	title: string;
	description?: string | null;
	content: Lesson[];
};

export type Content = Chapter[];
