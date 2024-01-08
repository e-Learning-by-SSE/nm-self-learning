import Link from "next/link";

export function SearchSection({
	title,
	results,
	baseLink,
	onClick,
	maxDisplayedSearchResults = 4, // how many search results are at most displayed for the section
	searchResultOffset = 0 // Where in the results the display should start
}: {
	title: string;
	results: { title: string; slug: string }[];
	baseLink: string;
	onClick: () => void;
	maxDisplayedSearchResults?: number;
	searchResultOffset?: number;
}) {
	return (
		<>
			<div className="bg-gray-200 p-2">{title}</div>
			<div className="w-full overflow-hidden text-ellipsis">
				{results.slice(searchResultOffset, maxDisplayedSearchResults).map(result => (
					<Link
						className="block w-full overflow-hidden text-ellipsis p-2 hover:bg-emerald-500 hover:text-white"
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
