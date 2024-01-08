import Link from "next/link";

export function SearchSection({
	title,
	results,
	baseLink,
	setSearchQuery
}: {
	title: string;
	results: { title: string; slug: string }[];
	baseLink: string;
	setSearchQuery: (changes: string) => void;
}) {
	return (
		<>
			<div className="bg-gray-200 p-2">{title}</div>
			<div className="w-full overflow-hidden text-ellipsis">
				{results.slice(0, 4).map(result => (
					<Link
						className="block w-full overflow-hidden text-ellipsis p-2 hover:bg-emerald-500 hover:text-white"
						key={result.title}
						onClick={() => setSearchQuery("")}
						href={`/${baseLink}/${result.slug}`}
					>
						{result.title}
					</Link>
				))}
			</div>
		</>
	);
}
