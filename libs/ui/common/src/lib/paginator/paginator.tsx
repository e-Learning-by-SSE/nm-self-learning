import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
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

		if (arr.length <= 8) {
			return {
				front: arr,
				middle: [],
				back: [],
				maxPage: arr.length
			} satisfies PaginatedLinks;
		}

		const page = pagination.page;

		if (page > 3 && page < arr.length - 2) {
			return {
				front: [1],
				middle: [page - 1, page, page + 1],
				back: [arr.length],
				maxPage: arr.length
			} satisfies PaginatedLinks;
		}

		if (page <= 3) {
			return {
				front: arr.slice(0, page + 1),
				middle: [],
				back: [arr.length],
				maxPage: arr.length
			} satisfies PaginatedLinks;
		}

		return {
			front: [1],
			middle: [],
			back: arr.slice(page - 2, arr.length),
			maxPage: arr.length
		};
	}, [pagination]);

	const { page, pageSize, totalCount, result } = pagination;

	return (
		<div className="flex flex-wrap items-center justify-between gap-4 py-4">
			<p className="text-sm text-c-text-muted">
				Zeige{" "}
				<span className="font-medium text-c-text-strong">
					{Math.min(result.length, pageSize)}
				</span>{" "}
				von <span className="font-medium text-c-text-strong">{totalCount}</span> Ergebnissen
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
					<span className="relative inline-flex items-center border border-c-border-strong bg-white px-4 py-2 text-sm font-medium text-c-text">
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
						<span className="relative inline-flex items-center border border-c-border-strong bg-white px-4 py-2 text-sm font-medium text-c-text">
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
	const className = `relative inline-flex items-center border border-c-border-strong bg-white px-2 py-2 text-sm font-medium ${
		isForward ? "rounded-r-lg" : "rounded-l-lg"
	} ${disabled ? "text-gray-300" : "text-c-text"}`;

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
				className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium text-c-primary focus:z-20 ${
					isActive
						? "z-10 border-c-primary bg-c-primary-subtle hover:bg-c-primary-muted"
						: "border-c-border-strong bg-white text-c-text bg-c-text-muted hover:bg-c-hover-subtle"
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
			className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium text-c-primary focus:z-20 ${
				isActive
					? "z-10 border-c-primary bg-c-primary-subtle hover:bg-emerald-100"
					: "border-c-border-strong bg-white text-c-text-muted hover:bg-c-hover-subtle"
			}`}
		>
			{page}
		</Link>
	);
}
