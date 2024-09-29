import { useRouter } from "next/router";
import { useCallback } from "react";

export function useDiaryPage({ pages, diaryId }: { pages: { id: string }[]; diaryId: string }) {
	const { changePage } = useDiaryPageRouter();

	const currentPageIndex = pages.findIndex(page => page.id === diaryId);

	const jumpToFirstEntry = useCallback(() => {
		changePage(pages[0].id);
	}, [changePage, pages]);

	const jumpToLastEntry = useCallback(() => {
		changePage(pages[pages.length - 1].id);
	}, [changePage, pages]);

	const updateToPreviousId = useCallback(() => {
		const newIndex = Math.max(currentPageIndex - 1, 0);
		changePage(pages[newIndex].id);
	}, [changePage, currentPageIndex, pages]);

	const updateToNextId = useCallback(() => {
		const newIndex = Math.min(currentPageIndex + 1, pages.length - 1);
		changePage(pages[newIndex].id);
	}, [changePage, currentPageIndex, pages]);

	return {
		changePage,
		jumpToFirstEntry,
		jumpToLastEntry,
		updateToPreviousId,
		updateToNextId,
		currentPageIndex
	};
}

export function useDiaryPageRouter() {
	const router = useRouter();
	const changePage = useCallback(
		(diaryId: string) => {
			router.push("/learning-diary/page/" + diaryId);
		},
		[router]
	);
	return { changePage };
}
