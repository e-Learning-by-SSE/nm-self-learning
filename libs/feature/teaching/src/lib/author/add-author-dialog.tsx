import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { ImageOrPlaceholder } from "@self-learning/ui/common";
import { inferRouterOutputs } from "@trpc/server";
import { Fragment, useMemo, useState } from "react";

export type AuthorFromGetAllQuery = inferRouterOutputs<AppRouter>["author"]["getAll"][0];

/**
 * Dialog that allows the user to select an author from a list of authors.
 */
export function AddAuthorDialog({
	onClose,
	open
}: {
	open: boolean;
	onClose: (author?: AuthorFromGetAllQuery) => void;
}) {
	const { data: _authors } = trpc.author.getAll.useQuery();
	const [filter, setFilter] = useState("");

	const filteredAuthors = useMemo(() => {
		if (!_authors) return [];

		if (!filter || filter === "") {
			return _authors;
		}

		const lcFilter = filter.toLowerCase();
		return _authors.filter(author => author.displayName.toLowerCase().includes(lcFilter));
	}, [_authors, filter]);

	return (
		<HeadlessDialog open={open} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full translate-y-1/4 justify-center">
					{/* The actual dialog panel  */}
					<HeadlessDialog.Panel
						className="mx-auto flex h-fit w-[90vw] flex-col overflow-hidden rounded-lg bg-white lg:w-[800px]"
						style={{ maxHeight: "624px" }}
					>
						<Combobox value={null} onChange={onClose}>
							<span className="flex items-center gap-2 border-b border-b-light-border py-1 px-6">
								<SearchIcon className="h-6 text-light" />
								<Combobox.Input
									className="w-full border-none focus:ring-0"
									placeholder="Suche nach Autor..."
									onChange={e => setFilter(e.target.value)}
								/>
							</span>
							<div className="divide-border-light playlist-scroll flex flex-col divide-y overflow-auto">
								<Combobox.Options
									className="flex flex-col divide-y divide-light-border"
									static={true}
								>
									{filteredAuthors.map(author => (
										<Combobox.Option
											value={author}
											key={author.slug}
											as={Fragment}
										>
											{({ active }) => (
												<button
													type="button"
													data-testid="author-option"
													className={`flex items-center gap-4 rounded px-4 py-2 ${
														active ? "bg-secondary text-white" : ""
													}`}
												>
													<ImageOrPlaceholder
														src={author.imgUrl ?? undefined}
														className="h-10 w-10 rounded-lg object-cover"
													/>
													<div className="flex flex-col">
														<span className="text-sm font-medium">
															{author.displayName}
														</span>
														<span
															className={`text-start text-xs ${
																active ? "text-white" : "text-light"
															}`}
														>
															{author.username}
														</span>
													</div>
												</button>
											)}
										</Combobox.Option>
									))}
								</Combobox.Options>
							</div>
						</Combobox>
					</HeadlessDialog.Panel>
				</div>
			</div>
		</HeadlessDialog>
	);
}
