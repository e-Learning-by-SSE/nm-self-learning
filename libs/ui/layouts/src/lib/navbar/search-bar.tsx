import { Transition } from "@headlessui/react";
import { SearchResults } from "../search-results";
import { useState } from "react";
import { SearchInput } from "libs/ui/common/src/lib/dialog/dropdown-dialog";

export function SearchBar() {
	const [searchQuery, setSearchQuery] = useState("");
	const resetCallback = () => setSearchQuery("");

	return (
		<div className="hidden flex-1 items-center justify-center px-2 lg:ml-6 lg:flex lg:justify-end">
			<div className="relative w-full max-w-lg lg:max-w-xs">
				<label htmlFor="search" className="sr-only">
					Suche
				</label>
				{/* <SearchInputt searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}
				<SearchInput
					filter={searchQuery}
					setFilter={setSearchQuery}
					placeholder="Suchen..."
				/>

				<Transition
					show={true}
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
