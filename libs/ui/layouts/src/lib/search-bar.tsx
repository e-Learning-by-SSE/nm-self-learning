import { Transition } from "@headlessui/react";
import { FaceFrownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SearchSection } from "./search-section";

export function SearchInput({
	searchQuery,
	setSearchQuery,
	placeHolder
}: {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	placeHolder: string;
}) {
	return (
		<div className="relative">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
			</div>
			<input
				autoComplete="off"
				id="search"
				name="search"
				className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:text-sm lg:leading-6"
				placeholder={placeHolder}
				type="search"
				value={searchQuery}
				onChange={e => {
					setSearchQuery(e.target.value);
				}}
			/>
		</div>
	);
}

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

function SearchResults({
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

	const { data: lessons } = trpc.lesson.findMany.useQuery(search);

	const { data: authors } = trpc.author.findMany.useQuery(search);
	const authorResults = authors?.result.map(({ displayName: title, slug }) => ({ title, slug }));

	const { data: courses } = trpc.course.findMany.useQuery(search);

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

export function SearchBar() {
	const [searchQuery, setSearchQuery] = useState("");
	const resetCallback = () => setSearchQuery("");

	return (
		<div className="hidden items-center justify-center px-2 lg:ml-6 lg:flex lg:justify-end">
			<div className="relative w-full max-w-lg lg:max-w-xs">
				<label htmlFor="search" className="sr-only">
					Suche
				</label>
				<SearchInput
					placeHolder={"Suchen..."}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
				/>

				<Transition
					show={true}
					as="div"
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					{searchQuery !== "" && (
						<div className="absolute right-0 z-10 mt-2 w-full origin-top-right truncate rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<SearchResults
								searchQuery={searchQuery}
								resetSearchQuery={resetCallback}
							/>
						</div>
					)}
				</Transition>
			</div>
		</div>
	);
}

export function UniversalSearchBar({
	searchQuery,
	setSearchQuery,
	placeHolder
}: {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	placeHolder: string;
}) {
	return (
		<div className="flex flex-1 items-center">
			<div className="relative w-full">
				<label htmlFor="search" className="sr-only">
					Suche
				</label>
				<SearchInput
					placeHolder={placeHolder}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
				/>
			</div>
		</div>
	);
}
