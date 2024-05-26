import { FaceFrownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
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
			<div className="bg-gray-200 p-2">{title}</div>
			<div className="w-full overflow-hidden text-ellipsis">
				{showEmptySpace && (
					<div className="block w-full p-2 italic text-gray-500">Keine Ergebnisse</div>
				)}
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

// export function SearchInput({
// 	searchQuery,
// 	setSearchQuery
// }: {
// 	searchQuery: string;
// 	setSearchQuery: (value: string) => void;
// }) {
// 	return (
// 		<div className="relative">
// 			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
// 				<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
// 			</div>
// 			<input
// 				autoComplete="off"
// 				id="search"
// 				name="search"
// 				className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:text-sm lg:leading-6"
// 				placeholder="Suchen..."
// 				type="search"
// 				value={searchQuery}
// 				onChange={e => {
// 					setSearchQuery(e.target.value);
// 				}}
// 			/>
// 		</div>
// 	);
// }

function NoResults() {
	return (
		<div className="px-4 py-8 text-center text-sm sm:px-8">
			<FaceFrownIcon className="mx-auto h-7 w-7 text-gray-400" />
			<p className="mt-4 font-semibold text-gray-900">Nichts hier</p>
			<p className="mt-2 text-gray-500">Leider konnten wir nichts finden was</p>
			<p className="text-gray-500">deiner Suchanfrage entspricht</p>
		</div>
	);
}

export function SearchResults({
	searchQuery,
	resetSearchQuery
}: {
	searchQuery: string;
	resetSearchQuery: () => void;
}) {
	const session = useSession();
	const user = session.data?.user;
	const search = { title: searchQuery, page: 1 };
	const isUserAdmin = user?.role === "ADMIN";

	const { data: lessons, isLoading: lessonLoading } = trpc.lesson.findMany.useQuery(search);

	const { data: authors, isLoading: authorLoading } = trpc.author.findMany.useQuery(search);
	const authorResults = authors?.result.map(({ displayName: title, slug }) => ({ title, slug }));

	const { data: courses, isLoading: coursesLoading } = trpc.course.findMany.useQuery(search);

	const hasResults =
		(lessons && lessons?.result?.length > 0) ||
		(authors && authors?.result?.length > 0) ||
		(courses && courses?.result?.length > 0);

	// TODO make use of loading circles here when they are implemented
	return (
		<>
			{!hasResults && <NoResults />}
			{courses && (
				<SearchSection
					title="Kurse"
					results={courses.result}
					baseLink="courses"
					onClick={resetSearchQuery}
				/>
			)}
			{lessons && isUserAdmin && (
				<SearchSection
					title="Lerneinheiten"
					results={lessons.result}
					baseLink="teaching/lessons/edit"
					onClick={resetSearchQuery}
				/>
			)}

			{authorResults && (
				<SearchSection
					title="Autoren"
					results={authorResults}
					baseLink="authors"
					onClick={resetSearchQuery}
				/>
			)}
		</>
	);
}
