import type { Lesson } from "./lesson";
import type { LessonContentMediaType, MetaByContentType } from "./lesson-content";

export type LessonMeta = {
	hasQuiz: boolean;
	mediaTypes: {
		[mediaType in LessonContentMediaType]?: MetaByContentType<mediaType>;
	};
};

/** Extracts information about a lesson, summing durations per media type. */
export function createLessonMeta(lesson: Lesson): LessonMeta {
	const mediaTypes: LessonMeta["mediaTypes"] = {};

	for (const item of lesson.content ?? []) {
		if (item.type === "video") {
			mediaTypes.video = {
				duration: (mediaTypes.video?.duration ?? 0) + Math.trunc(item.meta.duration)
			};
		} else {
			mediaTypes[item.type] = {
				estimatedDuration:
					(mediaTypes[item.type]?.estimatedDuration ?? 0) +
					Math.trunc(item.meta.estimatedDuration)
			};
		}
	}

	return {
		hasQuiz: !!lesson.quiz && lesson.quiz.questions.length > 0,
		mediaTypes
	};
}

/** Returns the total duration of all media types in seconds. */
export function getLessonDuration(meta: LessonMeta | null | undefined): number {
	const mediaTypes = meta?.mediaTypes;
	return Math.trunc(
		(mediaTypes?.video?.duration ?? 0) +
		(mediaTypes?.article?.estimatedDuration ?? 0) +
		(mediaTypes?.pdf?.estimatedDuration ?? 0) +
		(mediaTypes?.iframe?.estimatedDuration ?? 0)
	);
}
