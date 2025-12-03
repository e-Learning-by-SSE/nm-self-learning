import { LessonLearnersViewProps } from "./learners-viewer/page";
import { useLessonContext } from "./use-lesson-context";

export function ChapterName({
	course,
	lesson
}: {
	course: LessonLearnersViewProps["course"];
	lesson: LessonLearnersViewProps["lesson"];
}) {
	const lessonContext = useLessonContext(lesson.lessonId, course?.slug ?? "");
	const chapterName = course ? lessonContext.chapterName : null;

	return <div className="font-semibold text-secondary min-h-[24px]">{chapterName}</div>;
}
