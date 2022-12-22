import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	LoadingBox,
	OnDialogCloseFn,
	Paginator
} from "@self-learning/ui/common";
import { Fragment, useState } from "react";

export function SearchUserDialog({
	onClose,
	open
}: {
	open: boolean;
	/** Returns the `username` of the selected user, or `undefined`, if no user was selected. */
	onClose: OnDialogCloseFn<string>;
}) {
	const [name, setName] = useState("");
	const [page, setPage] = useState(1);
	const { data: users } = trpc.admin.findUsers.useQuery(
		{
			page,
			name
		},
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

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
									placeholder="Suche nach Nutzer..."
									onChange={e => setName(e.target.value)}
								/>
							</span>

							{!users ? (
								<LoadingBox />
							) : (
								<>
									<div className="px-4">
										<Paginator
											pagination={users}
											url="#"
											onPageChange={setPage}
										/>
									</div>

									<div className="divide-border-light playlist-scroll flex flex-col divide-y overflow-auto">
										<Combobox.Options
											className="flex flex-col divide-y divide-light-border"
											static={true}
										>
											{users?.result.map(user => (
												<Combobox.Option
													value={user.name}
													key={user.name}
													as={Fragment}
												>
													{({ active }) => (
														<button
															type="button"
															data-testid="author-option"
															className={`flex items-center gap-4 rounded px-4 py-2 ${
																active
																	? "bg-secondary text-white"
																	: ""
															}`}
														>
															<ImageOrPlaceholder
																src={user.image ?? undefined}
																className="h-10 w-10 rounded-lg object-cover"
															/>
															<div className="flex flex-col">
																<span className="text-sm font-medium">
																	{user.name}
																</span>
																<span
																	className={`text-start text-xs ${
																		active
																			? "text-white"
																			: "text-light"
																	}`}
																>
																	{user.email}
																</span>
															</div>
														</button>
													)}
												</Combobox.Option>
											))}
										</Combobox.Options>
									</div>
								</>
							)}
						</Combobox>
					</HeadlessDialog.Panel>
				</div>
			</div>
		</HeadlessDialog>
	);
}
