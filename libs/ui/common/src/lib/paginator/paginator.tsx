import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { Paginated } from "@self-learning/util/common";
import Link from "next/link";
import { useMemo } from "react";

type PaginatedLinks = {
	front: number[];
	middle: number[];
	back: number[];
	maxPage: number;
};

export function Paginator({
	pagination,
	url,
	onPageChange
}: {
	pagination: Paginated<unknown>;
	url: string;
	/** If defined, selecting a page will no longer cause a navigation! Callers are responsible for changing data.  */
	onPageChange?: (page: number) => void;
}) {
	const pageLinks = useMemo(() => {
		const arr = new Array(Math.ceil(pagination.totalCount / pagination.pageSize))
			.fill(0)
			.map((_, i) => i + 1);

		// TODO: Implement some logic to split the array into front, middle and back when there are too many pages

		return {
			front: arr,
			middle: [],
			back: [],
			maxPage: arr.length
		} satisfies PaginatedLinks;
	}, [pagination]);

	const { page, pageSize, totalCount, result } = pagination;

	return (
		<div className="flex flex-wrap items-center justify-between gap-4 py-4">
			<p className="text-sm text-light">
				Zeige{" "}
				<span className="font-medium text-black">{Math.min(result.length, pageSize)}</span>{" "}
				von <span className="font-medium text-black">{totalCount}</span> Ergebnissen
			</p>
			<nav
				className="isolate inline-flex -space-x-px rounded-lg shadow-sm"
				aria-label="Pagination"
			>
				<ForwardBackwardLink
					disabled={page === 1}
					href={`${url}&page=${page - 1}`}
					isForward={false}
					onPageChange={onPageChange ? () => onPageChange(page - 1) : undefined}
				/>

				{pageLinks.front.map(p => (
					<PageLink
						key={p}
						isActive={p === page}
						page={p}
						url={`${url}&page=${p}`}
						onPageChange={onPageChange}
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
								onPageChange={onPageChange}
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
							onPageChange={onPageChange}
						/>
					))}

				<ForwardBackwardLink
					disabled={page === pageLinks.maxPage || result.length === 0}
					href={`${url}&page=${page + 1}`}
					isForward={true}
					onPageChange={onPageChange ? () => onPageChange(page + 1) : undefined}
				/>
			</nav>
		</div>
	);
}

function ForwardBackwardLink({
	onPageChange,
	href,
	disabled,
	isForward
}: {
	onPageChange?: () => void;
	href: string;
	isForward: boolean;
	disabled: boolean;
}) {
	const className = `relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
		isForward ? "rounded-r-lg" : "rounded-l-lg"
	} ${disabled ? "text-gray-300" : "text-gray-500"}`;

	const icon = isForward ? (
		<ChevronRightIcon className="h-5" />
	) : (
		<ChevronLeftIcon className="h-5" />
	);

	if (disabled) {
		return (
			<span className={className}>
				<span className="sr-only">Previous</span>
				{icon}
			</span>
		);
	}

	if (typeof onPageChange === "function") {
		return (
			<button className={className} onClick={onPageChange}>
				<span className="sr-only">Previous</span>
				{icon}
			</button>
		);
	}

	return (
		<Link href={href} className={className}>
			<span className="sr-only">Previous</span>
			{icon}
		</Link>
	);
}

function PageLink({
	page,
	isActive,
	url,
	onPageChange
}: {
	url: string;
	page: number;
	isActive: boolean;
	onPageChange?: (page: number) => void;
}) {
	if (typeof onPageChange === "function") {
		return (
			<button
				className={`relative inline-flex items-center border  px-4 py-2 text-sm font-medium text-secondary focus:z-20 ${
					isActive
						? "z-10 border-secondary bg-emerald-50 hover:bg-emerald-100"
						: "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
				}`}
				onClick={() => onPageChange(page)}
			>
				{page}
			</button>
		);
	}

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
