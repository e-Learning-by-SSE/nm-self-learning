import { getRandomId } from "@self-learning/util/common";
import { useState, useMemo, useCallback } from "react";
import { MappedContent, mapContent, ChapterWithNr, Competence, Summary } from "./types";

export type NewChapterDialogResult = { title: string; description?: string };

export function useCourseContentForm() {
	const [content, setContent] = useState<MappedContent>(
		mapContent([
			{
				type: "chapter",
				title: "Chapter 1",
				content: [
					{
						type: "lesson",
						title: "Lesson 1",
						lessonId: getRandomId(),
						hasQuiz: true,
						requires: [],
						rewards: [
							{ level: 1, title: "elementary-command" },
							{ level: 1, title: "basic-program-structure" }
						]
					},
					{
						type: "lesson",
						title: "Lesson 2",
						lessonId: getRandomId(),
						hasQuiz: true,
						requires: [{ level: 1, title: "elementary-command" }],
						rewards: [{ level: 2, title: "elementary-command" }]
					},
					{
						type: "chapter",
						title: "Chapter 1.1",
						content: [
							{
								type: "lesson",
								title: "Lesson 3",
								lessonId: getRandomId(),
								hasQuiz: true,
								requires: [
									{ level: 2, title: "elementary-command" },
									{ level: 2, title: "basic-program-structure" }
								],
								rewards: [{ level: 3, title: "elementary-command" }]
							},
							{
								type: "lesson",
								title: "Lesson 4",
								hasQuiz: false,
								lessonId: getRandomId()
							}
						]
					},
					{
						type: "chapter",
						title: "Chapter 1.2",
						content: [
							{
								type: "lesson",
								title: "Lesson 5",
								hasQuiz: false,
								lessonId: getRandomId()
							},
							{
								type: "lesson",
								title: "Lesson 6",
								hasQuiz: false,
								lessonId: getRandomId()
							},
							{
								type: "chapter",
								title: "Nested Chapter",
								content: [
									{
										type: "lesson",
										title: "Nested Lesson 1",
										hasQuiz: true,
										lessonId: getRandomId()
									},
									{
										type: "lesson",
										title: "Nested Lesson 2",
										hasQuiz: true,
										lessonId: getRandomId()
									}
								]
							}
						]
					}
				]
			},
			{
				type: "chapter",
				title: "Chapter 2",
				content: [
					{
						type: "chapter",
						title: "Chapter 2.1",
						content: [
							{
								type: "lesson",
								title: "Lesson 7",
								hasQuiz: true,
								lessonId: getRandomId()
							},
							{
								type: "lesson",
								title: "Lesson 8",
								hasQuiz: true,
								lessonId: getRandomId()
							}
						]
					},
					{
						type: "chapter",
						title: "Chapter 2.2",
						content: [
							{
								type: "lesson",
								title: "Lesson 9",
								hasQuiz: true,
								lessonId: getRandomId()
							},
							{
								type: "lesson",
								title: "Lesson 10",
								hasQuiz: true,
								lessonId: getRandomId()
							}
						]
					},
					{ type: "lesson", title: "Lesson 11", hasQuiz: true, lessonId: getRandomId() }
				]
			}
		])
	);

	const summary = useMemo(() => {
		const sum = createSummary(content);
		return { count: sum.count, competences: [...sum.competences.values()] };
	}, [content]);

	const [openNewChapterDialog, setOpenNewChapterDialog] = useState(false);
	const [addChapterTarget, setAddChapterTarget] = useState<string | null>(null);
	const [showInfo, setShowInfo] = useState(true);
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

	traverseContent(content, item => {
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

function traverseContent(content: MappedContent, fn: (c: MappedContent[0]) => void) {
	content.forEach(item => {
		if (item.type === "chapter") {
			fn(item);
			traverseContent(item.content, fn);
		} else {
			fn(item);
		}
	});
}
