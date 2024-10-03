import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon
} from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { PagesMeta } from "../access-learning-diary";
import { Tooltip } from "@self-learning/ui/common";

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

function useDiaryPage({ pages, diaryId }: { pages: { id: string }[]; diaryId: string }) {
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

/** This component relies on the LearningDiaryPages list being sorted in ascending manner (refer to the database function)  */
export function PageChanger({ pages, currentPageId }: { pages: PagesMeta; currentPageId: string }) {
	const currentPageIndex = pages.findIndex(page => page.id === currentPageId);
	const [pageInput, setPageInput] = useState(currentPageIndex + 1);

	const { changePage, jumpToFirstEntry, jumpToLastEntry, updateToPreviousId, updateToNextId } =
		useDiaryPage({ pages, diaryId: currentPageId });

	const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		console.debug(value, pages);
		if (!isNaN(value) && value >= 1 && value <= pages.length) {
			changePage(pages[value - 1].id);
		}
		setPageInput(value);
	};

	return (
		<div className="flex space-x-4 items-center">
			<Tooltip placement={"bottom"} content="Zum ersten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={jumpToFirstEntry}
					disabled={currentPageIndex === 0}
				>
					<ChevronDoubleLeftIcon className="h-4 w-4" />
				</button>
			</Tooltip>
			<Tooltip placement={"bottom"} content="Zum vorherigen Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={updateToPreviousId}
					disabled={currentPageIndex === 0}
				>
					<ChevronLeftIcon className="h-5 w-5 mr-2" />
					Vorheriger Eintrag
				</button>
			</Tooltip>
			<form className="flex items-center">
				<input
					type="number"
					// ref={inputRef}
					value={pageInput}
					// instead of using the submit event, this enables live updating while switching "pages"
					onInput={handlePageInputChange}
					className="w-16 text-center border rounded"
					min={1}
					max={pages.length}
				/>
				<span className="ml-2">/ {pages.length}</span>
			</form>
			<Tooltip placement={"bottom"} content="Zum nächsten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={updateToNextId}
					disabled={currentPageIndex === pages.length - 1}
				>
					Nächster Eintrag
					<ChevronRightIcon className="h-5 w-5 ml-2" />
				</button>
			</Tooltip>
			<Tooltip placement={"bottom"} content="Zum letzten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={jumpToLastEntry}
					disabled={currentPageIndex === pages.length - 1}
				>
					<ChevronDoubleRightIcon className="h-4 w-4" />
				</button>
			</Tooltip>
		</div>
	);
}
