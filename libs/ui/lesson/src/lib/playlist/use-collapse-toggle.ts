import { traverseCourseContent } from "@self-learning/types";
import { useCallback, useEffect, useState } from "react";
import { PlaylistContent } from "./playlist";

/** Hook that provides the current  toggle-state and methods to toggle one or all sections at once. */
export function useCollapseToggle(content: PlaylistContent) {
	const [globalCollapsed, globalCollapseToggle] = useState(false);
	const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
		getAllChapterNrs(content)
	);

	const toggleCollapse = useCallback((chapterNr: string) => {
		setCollapsedSections(items => {
			return {
				...items,
				[chapterNr]: !items[chapterNr]
			};
		});
	}, []);

	useEffect(() => {
		setCollapsedSections(chapters => {
			for (const chapter of Object.keys(chapters)) {
				chapters[chapter] = globalCollapsed;
			}

			return { ...chapters };
		});
	}, [globalCollapsed]);

	return {
		/** Indicates, whether all sections should be collapsed or not. */
		globalCollapsed,
		/** Toggle for opening/closing all section. */
		globalCollapseToggle,
		/** Toggles the open/closed state for a specific section. */
		toggleCollapse,
		/** Object that contains the open/closed state of each section. */
		collapsedSections
	};
}

function getAllChapterNrs(content: PlaylistContent): Record<string, boolean> {
	const chapterNrs: Record<string, boolean> = {};

	traverseCourseContent(content, chapterOrLesson => {
		if (chapterOrLesson.type === "chapter") {
			chapterNrs[chapterOrLesson.chapterNr] = false;
		}
	});

	return chapterNrs;
}
