import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Competence, Summary } from "./types";

export type NewChapterDialogResult = { title: string; description?: string };

export function useCourseContentForm() {
	const { control, setValue } = useFormContext<{ content: unknown[] }>();
	const { fields } = useFieldArray({ control, name: "content" });

	const [content, setContent] = useState([]);

	useEffect(() => {
		// Update form whenever the internally managed `content` changes
		setValue("content", content);
	}, [content, setValue]);

	const summary = useMemo(() => {
		const sum = createSummary(content);
		return { count: sum.count, competences: [...sum.competences.values()] };
	}, [content]);

	const [openNewChapterDialog, setOpenNewChapterDialog] = useState(false);
	const [addChapterTarget, setAddChapterTarget] = useState<string | null>(null);

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
			//
		}

		setAddChapterTarget(null);
	}

	const onAddLesson = useCallback(
		(chapterId: string, lesson: any) => {
			setContent(prev => {
				return prev;
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
		onAddLesson
	};
}

function createSummary(content: any) {
	const summary: Summary = {
		competences: new Map<string, Competence>(),
		count: {
			chapters: 0,
			lessons: 0,
			quizzes: 0
		}
	};

	return summary;
}
