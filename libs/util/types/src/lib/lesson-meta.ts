/* eslint-disable indent */
import { Lesson } from "./lesson";
import { LessonContentMediaType, MetaByContentType } from "./lesson-content";

export type LessonMeta = {
	hasQuiz: boolean;
	mediaTypes: {
		[mediaType in LessonContentMediaType]?: MetaByContentType<mediaType>;
	};
};

/** Extracts information about a lesson. */
export function createLessonMeta(lesson: Lesson): LessonMeta {
	return {
		hasQuiz: !!lesson.quiz && lesson.quiz.questions.length > 0,
		mediaTypes: lesson.content
			? lesson.content.reduce(
					(mediaTypes, item) => ({ ...mediaTypes, [item.type]: item.meta }),
					{}
			  )
			: {}
	};
}
