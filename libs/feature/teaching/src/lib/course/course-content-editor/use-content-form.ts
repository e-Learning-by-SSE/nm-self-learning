import { traverseCourseContent } from "@self-learning/types";
import { getRandomId } from "@self-learning/util/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ChapterWithNr, Competence, mapContent, MappedContent, Summary } from "./types";

export type NewChapterDialogResult = { title: string; description?: string };

export function useCourseContentForm() {
	const { control, setValue } = useFormContext<{ content: unknown[] }>();
	const { fields } = useFieldArray({ control, name: "content" });

	const [content, setContent] = useState<MappedContent>(mapContent(fields as any)); // TODO: fix types

	const summary = useMemo(() => {
		const sum = createSummary(content);
		return { count: sum.count, competences: [...sum.competences.values()] };
	}, [content]);

	useEffect(() => {
		// Update form whenever the internally managed `content` changes
		setValue("content", content);
	}, [content, setValue]);

	const [openNewChapterDialog, setOpenNewChapterDialog] = useState(false);
	const [addChapterTarget, setAddChapterTarget] = useState<string | null>(null);
	const [showInfo, setShowInfo] = useState(false);
	const [highlightedCompetence, _setHighlightedCompetence] = useState<string | null>(null);

	const setHighlightedCompetence = useCallback(
		(title: string | null) => {
			setShowInfo(true);
			_setHighlightedCompetence(current => (current === title ? null : title));
		},
		[_setHighlightedCompetence]
	);

	const onAddChapter = useCallback(
		(chapterId: string) => {
			// Find chapter with chapterId
			console.log(chapterId);
			setAddChapterTarget(chapterId);
			setOpenNewChapterDialog(true);
		},
		[setAddChapterTarget, setOpenNewChapterDialog]
	);

	function addChapterDialogClosed(result?: NewChapterDialogResult) {
		console.log(result);
		setOpenNewChapterDialog(false);

		if (result && addChapterTarget) {
			setContent(prev => {
				const chapter = findChapterById(prev, addChapterTarget);

				if (chapter) {
					chapter.content.push({
						type: "chapter",
						chapterId: getRandomId(),
						title: result.title,
						content: [],
						chapterNr: "" // will be set by mapContent
					});
				}

				return mapContent(prev);
			});
		}

		setAddChapterTarget(null);
	}

	const onAddLesson = useCallback(
		(chapterId: string, lesson: any) => {
			setContent(prev => {
				const chapter = findChapterById(prev, chapterId);

				if (chapter) {
					chapter.content.push({
						type: "lesson",
						title: lesson.title,
						lessonId: lesson.lessonId,
						hasQuiz: false,
						lessonNr: 0 // will be set by mapContent,
					});
				}

				return mapContent(prev);
			});
		},
		[setContent]
	);

	return {
		content,
		summary,
		openNewChapterDialog,
		addChapterDialogClosed,
		onAddChapter,
		onAddLesson,
		showInfo,
		setShowInfo,
		highlightedCompetence,
		setHighlightedCompetence
	};
}

function createSummary(content: MappedContent) {
	const summary: Summary = {
		competences: new Map<string, Competence>(),
		count: {
			chapters: 0,
			lessons: 0,
			quizzes: 0
		}
	};

	traverseCourseContent(content, item => {
		if (item.type === "chapter") {
			summary.count.chapters++;
		} else if (item.type === "lesson") {
			summary.count.lessons++;

			if (item.hasQuiz) {
				summary.count.quizzes++;
			}

			if (item.rewards) {
				for (const competence of item.rewards) {
					const exists = summary.competences.get(competence.title);

					if (!exists || exists.level < competence.level) {
						summary.competences.set(competence.title, competence);
					}
				}
			}
		}
	});

	return summary;
}

function findChapterById(content: MappedContent, id: string): ChapterWithNr | null {
	for (const chapter of content) {
		if (chapter.type === "chapter") {
			if (chapter.chapterId === id) {
				return chapter;
			}

			const found = findChapterById(chapter.content, id);
			if (found) {
				return found;
			}
		}
	}

	return null;
}
