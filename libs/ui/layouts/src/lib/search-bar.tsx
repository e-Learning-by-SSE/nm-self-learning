import { EmojiSadIcon, SearchIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import { SearchSection } from "./search-section";

export function SearchBar() {
	const session = useSession();
	const user = session.data?.user;

	const [searchQuery, setSearchQuery] = useState("");

	const { data: courses } = trpc.course.findMany.useQuery({
		title: searchQuery,
		page: 1
	});

	const { data: lessons } =
		user?.role === "ADMIN"
			? trpc.lesson.findMany.useQuery({ title: searchQuery, page: 1 })
			: { data: null };

	const { data: authors } = trpc.author.findMany.useQuery({
		displayName: searchQuery,
		page: 1
	});

	useEffect(() => {
		setSearchQuery(searchQuery as string);
	}, [searchQuery]);

	return (
		<div className="hidden flex-1 items-center justify-center px-2 lg:ml-6 lg:flex lg:justify-end">
			<div className="relative w-full max-w-lg lg:max-w-xs">
				<label htmlFor="search" className="sr-only">
					Suche
				</label>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="search"
						name="search"
						className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:text-sm lg:leading-6"
						placeholder="Suchen..."
						type="search"
						value={searchQuery}
						onChange={e => {
							setSearchQuery(e.target.value);
						}}
					/>
				</div>

				<Transition
					show={true}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					{searchQuery === "" ? (
						<div></div>
					) : (
						<div className="absolute right-0 z-10 mt-2 w-full origin-top-right truncate rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							{courses?.result?.length === 0 &&
							lessons?.result?.length === 0 &&
							authors?.result?.length === 0 ? (
								<div className="px-4 py-8 text-center text-sm sm:px-8">
									<EmojiSadIcon className="mx-auto h-7 w-7 text-gray-400" />
									<p className="mt-4 font-semibold text-gray-900">Nichts hier</p>
									<p className="mt-2 text-gray-500">
										Leider konnten wir nichts finden was
									</p>
									<p className="text-gray-500">deiner Suchanfrage entspricht</p>
								</div>
							) : (
								<>
									{courses && courses.result?.length > 0 ? (
										<SearchSection
											title="Kurse"
											results={courses.result.map(element => {
												return {
													title: element.title,
													slug: element.slug
												};
											})}
											baseLink="courses"
											setSearchQuery={setSearchQuery}
										/>
									) : (
										<div></div>
									)}

									{user?.role === "ADMIN" &&
									lessons &&
									lessons.result?.length > 0 ? (
										<SearchSection
											title="Lerneinheiten"
											results={lessons.result.map(element => {
												return {
													title: element.title,
													slug: element.lessonId
												};
											})}
											baseLink="teaching/lessons/edit"
											setSearchQuery={setSearchQuery}
										/>
									) : (
										<div></div>
									)}

									{authors && authors.result?.length > 0 ? (
										<SearchSection
											title="Autoren"
											results={authors.result.map(element => {
												return {
													title: element.displayName,
													slug: element.slug
												};
											})}
											baseLink="authors"
											setSearchQuery={setSearchQuery}
										/>
									) : (
										<div></div>
									)}
								</>
							)}
						</div>
					)}
				</Transition>
			</div>
		</div>
	);
}
