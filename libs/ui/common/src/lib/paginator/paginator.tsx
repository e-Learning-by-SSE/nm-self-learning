import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useMemo } from "react";

type PaginatedLinks = {
	front: number[];
	middle: number[];
	back: number[];
	maxPage: number;
};

export function Paginator({
	page,
	url,
	totalCount,
	pageSize
}: {
	page: number;
	url: string;
	totalCount: number;
	pageSize: number;
}) {
	const pageLinks = useMemo(() => {
		const arr = new Array(Math.ceil(totalCount / pageSize)).fill(0).map((_, i) => i + 1);

		// TODO: Implement some logic to split the array into front, middle and back when there are too many pages

		return {
			front: arr,
			middle: [],
			back: [],
			maxPage: arr.length
		} satisfies PaginatedLinks;
	}, [totalCount, pageSize]);

	return (
		<div className="flex items-center justify-between border-t border-gray-200  py-4 pl-4">
			<div className="flex flex-1 justify-between sm:hidden">
				<Link
					href={`${url}&page=${page - 1}`}
					className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Previous
				</Link>
				<a
					href={`${url}&page=${page + 1}`}
					className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Next
				</a>
			</div>
			<div className="hidden items-center sm:flex sm:flex-1 sm:justify-between">
				<div>
					<p className="text-sm text-light">
						Zeige <span className="font-medium text-black">{pageSize ?? 0}</span> von{" "}
						<span className="font-medium text-black">{totalCount ?? 0}</span>{" "}
						Ergebnissen
					</p>
				</div>
				<div>
					<nav
						className="isolate inline-flex -space-x-px rounded-lg shadow-sm"
						aria-label="Pagination"
					>
						{page > 1 ? (
							<Link
								href={`${url}&page=${page - 1}`}
								className="relative inline-flex items-center rounded-l-lg border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
							>
								<span className="sr-only">Previous</span>
								<ChevronLeftIcon className="h-5" />
							</Link>
						) : (
							<span className="relative inline-flex items-center rounded-l-lg border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-300">
								<span className="sr-only">Previous</span>
								<ChevronLeftIcon className="h-5" />
							</span>
						)}

						{pageLinks.front.map(p => (
							<PageLink
								key={p}
								isActive={p === page}
								page={p}
								url={`${url}&page=${p}`}
							/>
						))}

						{pageLinks.back.length > 0 && (
							<span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
								...
							</span>
						)}

						{pageLinks.middle.length > 0 && (
							<>
								{pageLinks.middle.map(p => (
									<PageLink
										key={p}
										isActive={p === page}
										page={p}
										url={`${url}&page=${p}`}
									/>
								))}
								<span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
									...
								</span>
							</>
						)}

						{pageLinks.back.length > 0 &&
							pageLinks.back.map(p => (
								<PageLink
									key={p}
									isActive={p === page}
									page={p}
									url={`${url}&page=${p}`}
								/>
							))}

						{page < pageLinks.maxPage ? (
							<Link
								href={`${url}&page=${page + 1}`}
								className="relative inline-flex items-center rounded-r-lg border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
							>
								<span className="sr-only">Previous</span>
								<ChevronRightIcon className="h-5" />
							</Link>
						) : (
							<span className="relative inline-flex items-center rounded-r-lg border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-50 focus:z-20">
								<span className="sr-only">Next</span>
								<ChevronRightIcon className="h-5" />
							</span>
						)}
					</nav>
				</div>
			</div>
		</div>
	);
}

function PageLink({ page, isActive, url }: { url: string; page: number; isActive: boolean }) {
	return (
		<Link
			href={url}
			aria-current="page"
			className={`relative inline-flex items-center border  px-4 py-2 text-sm font-medium text-secondary focus:z-20 ${
				isActive
					? "z-10 border-secondary bg-emerald-50 hover:bg-emerald-100"
					: "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
			}`}
		>
			{page}
		</Link>
	);
}
