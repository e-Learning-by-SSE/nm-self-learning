import { database } from "@self-learning/database";
import { SubtitleSrc, LessonContent } from "@self-learning/types";
import { ConvertTranscriptionToSubtitle } from "@self-learning/util/common";

export async function save_subtitle_for_lesson(
	lessonId: string,
	video_url: string,
	transcription: SubtitleSrc
) {
	const subtitle = await ConvertTranscriptionToSubtitle(transcription);

	const lesson = await database.lesson.findUnique({
		where: {
			lessonId
		}
	});

	if (!lesson) {
		throw new Error("Lesson not found");
	}

	const content = lesson.content as LessonContent | undefined;

	if (!content || content.length === 0) {
		throw new Error("Content not found");
	}

	// Lang Code -> Lang Label, e.g. "de" -> "Deutsch"
	const languageNames = new Intl.DisplayNames(["de"], { type: "language" });
	const getLanguageLabel = (lang?: string) => {
		const code = lang ?? "de";
		return languageNames.of(code) ?? code;
	};

	await database.lesson.update({
		where: {
			lessonId
		},
		data: {
			content: content.map(c =>
				c.type === "video" && c.value.url === video_url
					? {
							...c,
							value: {
								...c.value,
								subtitle: {
									src: subtitle,
									label: getLanguageLabel(transcription.language),
									srcLang: transcription.language ?? "de"
								}
							}
						}
					: c
			)
		}
	});
}
