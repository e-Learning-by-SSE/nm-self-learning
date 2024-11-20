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
import { Square3Stack3DIcon, Squares2X2Icon } from "@heroicons/react/20/solid";

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
		<div className="flex flex-row justify-between items-center space-x-4">
			<Tooltip placement={"bottom"} content="Zum ersten Eintrag springen">
				<button
					className="flex place-content-center items-center gap-2 rounded-lg bg-emerald-500 px-4 xl:px-8 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-opacity-25"
					onClick={jumpToFirstEntry}
					disabled={currentPageIndex === 0}
				>
					<ChevronDoubleLeftIcon className="h-10 w-10 xl:h-4 xl:w-4" />
				</button>
			</Tooltip>
			<Tooltip placement={"bottom"} content="Zum vorherigen Eintrag springen">
				<button
					className="flex place-content-center items-center gap-2 rounded-lg bg-emerald-500 px-4 xl:px-8 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-opacity-25"
					onClick={updateToPreviousId}
					disabled={currentPageIndex === 0}
				>
					<ChevronLeftIcon className="h-10 w-10 xl:h-4 xl:w-4" />
					<span className="hidden sm:inline">Vorheriger Eintrag</span>
				</button>
			</Tooltip>
			<form className="flex items-center">
				<input
					type="number"
					value={pageInput}
					onInput={handlePageInputChange}
					className="w-12 sm:w-16 text-center border rounded"
					min={1}
					max={pages.length}
				/>
				<span className="ml-2">/ {pages.length}</span>
			</form>
			<Tooltip placement={"bottom"} content="Zum nächsten Eintrag springen">
				<button
					className="flex place-content-center items-center gap-2 rounded-lg bg-emerald-500 px-4 xl:px-8 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-opacity-25"
					onClick={updateToNextId}
					disabled={currentPageIndex === pages.length - 1}
				>
					<span className="hidden sm:inline">Nächster Eintrag</span>
					<ChevronRightIcon className="h-10 w-10 xl:h-4 xl:w-4" />
				</button>
			</Tooltip>
			<Tooltip placement={"bottom"} content="Zum letzten Eintrag springen">
				<button
					className="flex place-content-center items-center gap-2 rounded-lg bg-emerald-500 px-4 xl:px-8 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-opacity-25"
					onClick={jumpToLastEntry}
					disabled={currentPageIndex === pages.length - 1}
				>
					<ChevronDoubleRightIcon className="h-10 w-10 xl:h-4 xl:w-4" />
				</button>
			</Tooltip>
		</div>
	);
}
