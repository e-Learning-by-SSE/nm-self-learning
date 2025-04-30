"use client";
import {
	Combobox,
	ComboboxInput,
	ComboboxOptions,
	ComboboxOption,
	Transition
} from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { FaceFrownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { LoadingCircle } from "@self-learning/ui/common";
import { BookOpenIcon, AcademicCapIcon, UserIcon } from "@heroicons/react/24/outline";
import { SearchResultInfo } from "./search-section";
import { useRouter } from "next/router";

export function SearchInput({
	searchQuery,
	setSearchQuery,
	placeHolder,
	onFocus,
	onBlur
}: {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	placeHolder: string;
	onFocus?: () => void;
	onBlur?: () => void;
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
				onFocus={onFocus}
				onBlur={onBlur}
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

function getSearchSections({
	courses = [],
	lessons = [],
	authors = []
}: {
	courses?: SearchResultInfo[];
	lessons?: SearchResultInfo[];
	authors?: SearchResultInfo[];
}) {
	const searchSections = [
		{
			title: "Kurse",
			results: courses,
			baseLink: "courses",
			show: !!courses
		},
		{
			title: "Lerneinheiten",
			results: lessons,
			baseLink: "teaching/lessons/edit",
			show: !!lessons
		},
		{
			title: "Autoren",
			results: authors,
			baseLink: "authors",
			show: !!authors
		}
	];

	const allResults = searchSections.flatMap(section =>
		section.title === "Kurse"
			? section.results.map(result => ({
					...result,
					baseLink: section.baseLink,
					type: "course"
				}))
			: section.title === "Lerneinheiten"
				? section.results.map(result => ({
						...result,
						baseLink: section.baseLink,
						type: "lesson"
					}))
				: section.title === "Autoren"
					? section.results.map(result => ({
							...result,
							baseLink: section.baseLink,
							type: "author"
						}))
					: section.results.map(result => ({ ...result, baseLink: section.baseLink }))
	);
	return allResults;
}

export function SearchBar() {
	const isUser = useSession().status === "authenticated";
	const [filterText, setFilterText] = useState("");
	const titleSearchParams = { title: filterText, page: 1 };
	const authorSearchParams = { displayName: filterText, page: 1 };
	const [isFocused, setIsFocused] = useState(false);
	const router = useRouter();
	const handleFocus = () => {
		setIsFocused(true);
	};
	const handleBlur = () => {
		setIsFocused(false);
	};
	type SearchResultItem = {
		baseLink: string;
		title: string;
		slug: string;
		type?: "course" | "lesson" | "author";
	};

	const [selectedResult, setSelectedResult] = useState<SearchResultItem>();

	const { data: lessons, isLoading: lessonsLoading } =
		trpc.lesson.findMany.useQuery(titleSearchParams);
	const { data: authors, isLoading: authorsLoading } =
		trpc.author.findMany.useQuery(authorSearchParams);
	const authorResults = authors?.result.map(({ displayName: title, slug }) => {
		return { title, slug };
	});
	const { data: courses, isLoading: coursesLoading } =
		trpc.course.findMany.useQuery(titleSearchParams);

	const searchSections: SearchResultItem[] = getSearchSections({
		courses: courses?.result,
		lessons: lessons?.result,
		authors: authorResults
	});
	const isLoading = lessonsLoading || authorsLoading || coursesLoading;

	const HandleSelect = (item: { baseLink: string; title: string; slug: string }) => {
		if (!item) {
			return;
		}

		setSelectedResult(item);

		if (item.baseLink && item.slug) {
			const url = item.baseLink.startsWith("http")
				? `${item.baseLink}/${item.slug}`
				: `/${item.baseLink}/${item.slug}`;
			router.push(url);
		}

		setFilterText("");
	};

	return (
		<Combobox
			value={selectedResult}
			onChange={HandleSelect}
			as="div"
			className="relative w-full max-w-xs hidden lg:block"
		>
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
				</div>
				<ComboboxInput
					autoComplete="off"
					placeholder={"Suchen..."}
					className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:text-sm lg:leading-6"
					value={filterText}
					onChange={e => setFilterText(e.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
			</div>

			<Transition
				show={isFocused && filterText.length > 0 && !isLoading}
				as="div"
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<ComboboxOptions className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					{isLoading ? (
						<LoadingCircle className="h-5 w-5 mx-auto" />
					) : searchSections.length > 0 && isUser ? (
						searchSections.slice(0, 10).map((result, index) => (
							<ComboboxOption
								key={index}
								value={result}
								className={({ focus }) =>
									`flex flex-col items-start w-full overflow-hidden text-ellipsis p-2 cursor-pointer ${
										focus ? "bg-emerald-500 text-white " : "text-gray-900"
									}`
								}
							>
								<span className="font-medium">{result.title}</span>
								<span className="text-xs">
									{result.type === "course"
										? "Kurs"
										: result.type === "lesson"
											? "Lerneinheit"
											: result.type === "author"
												? "Autor"
												: ""}
								</span>
							</ComboboxOption>
						))
					) : (
						<NoResults />
					)}
				</ComboboxOptions>
			</Transition>
		</Combobox>
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
