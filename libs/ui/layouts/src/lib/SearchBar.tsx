import { SearchIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export function search(searchQuery: string, user: Session["user"] | undefined) {
	const { data: courses } = trpc.course.findMany.useQuery(
		{ title: searchQuery, page: 1 },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	const { data: lessons } =
		user?.role === "ADMIN"
			? trpc.lesson.findMany.useQuery(
					{ title: searchQuery, page: 1 },
					{
						staleTime: 10_000,
						keepPreviousData: true
					}
			  )
			: { data: null };

	const { data: authors } = trpc.author.findMany.useQuery(
		{ displayName: searchQuery, page: 1 },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	return [courses, lessons, authors];
}

export function SearchBar() {
	const session = useSession();
	const user = session.data?.user;

	const [searchQuery, setSearchQuery] = useState("");

	const [courses, lessons, authors] = search(searchQuery, user);

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
					{searchQuery === "" ||
					courses === undefined ||
					lessons === undefined ||
					authors === undefined ? (
						<div></div>
					) : (
						<div className="absolute right-0 z-10 mt-2 w-full origin-top-right truncate rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							{courses?.result?.length === 0 &&
							lessons?.result?.length === 0 &&
							authors?.result?.length === 0 ? (
								<div className="px-4 py-8 text-center text-sm sm:px-8">
									<svg
										className="mx-auto h-6 w-6 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
										/>
									</svg>
									<p className="mt-4 font-semibold text-gray-900">Nichts hier</p>
									<p className="mt-2 text-gray-500">
										Leider konnten wir nichts finden was
									</p>
									<p className="text-gray-500">deiner Suchanfrage entspricht</p>
								</div>
							) : (
								<>
									{courses && courses.result?.length > 0 ? (
										<>
											<div className="bg-gray-200 p-2">Kurse</div>
											<div className="w-full overflow-hidden text-ellipsis">
												{courses.result.slice(0, 4).map(course => (
													<Link
														className="block w-full overflow-hidden text-ellipsis p-2 hover:bg-emerald-500 hover:text-white"
														key={course.title}
														onClick={() => setSearchQuery("")}
														href={`/courses/${course.slug}`}
													>
														{course.title}
													</Link>
												))}
											</div>
										</>
									) : (
										<div></div>
									)}

									{user?.role === "ADMIN" &&
									lessons &&
									lessons.result?.length > 0 ? (
										<>
											<div className="bg-gray-200 p-2">Lerneinheiten</div>
											<div className="w-full overflow-hidden text-ellipsis">
												{lessons.result.slice(0, 4).map(lesson => (
													<Link
														className="block w-full  overflow-hidden text-ellipsis p-2 hover:bg-emerald-500 hover:text-white"
														key={lesson.title}
														onClick={() => setSearchQuery("")}
														href={`/teaching/lessons/edit/${lesson.lessonId}`}
													>
														{lesson.title}
													</Link>
												))}
											</div>
										</>
									) : (
										<div></div>
									)}

									{authors && authors.result?.length > 0 ? (
										<>
											<div className="bg-gray-200 p-2">Autoren</div>
											<div className="w-full overflow-hidden text-ellipsis">
												{authors.result.slice(0, 4).map(author => (
													<Link
														className="block w-full  overflow-hidden text-ellipsis p-2 hover:bg-emerald-500 hover:text-white"
														key={author.displayName}
														onClick={() => setSearchQuery("")}
														href={`/authors/${author.slug}`}
													>
														{author.displayName}
													</Link>
												))}
											</div>
										</>
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
