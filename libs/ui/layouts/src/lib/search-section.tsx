import Link from "next/link";

export type SearchResultInfo = { title: string; slug: string };

export function SearchSection({
	title,
	results,
	baseLink,
	onClick,
	maxDisplayedSearchResults = 4, // how many search results are at most displayed for the section
	searchResultOffset = 0 // Where in the results the display should start
}: {
	title: string;
	results: SearchResultInfo[];
	baseLink: string;
	onClick: () => void;
	maxDisplayedSearchResults?: number;
	searchResultOffset?: number;
}) {
	const showEmptySpace = results.length === 0;
	return (
		<>
			<div className="bg-c-surface-3 p-2">{title}</div>
			<div className="w-full overflow-hidden text-ellipsis">
				{showEmptySpace && (
					<div className="block w-full p-2 italic text-c-text-muted">
						Keine Ergebnisse
					</div>
				)}
				{results.slice(searchResultOffset, maxDisplayedSearchResults).map(result => (
					<Link
						className="block w-full overflow-hidden text-ellipsis p-2 hover:bg-c-primary hover:text-white"
						key={result.title}
						onClick={onClick}
						href={`/${baseLink}/${result.slug}`}
					>
						{result.title}
					</Link>
				))}
			</div>
		</>
	);
}
