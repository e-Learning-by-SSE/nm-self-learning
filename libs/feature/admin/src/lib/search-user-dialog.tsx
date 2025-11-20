"use client";
import { Combobox, ComboboxOption } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import {
	DropdownDialog,
	ImageOrPlaceholder,
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
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null}>
				<DropdownDialog.SearchInput
					filter={name}
					setFilter={setName}
					placeholder="Suche nach Nutzer"
				/>

				<DropdownDialog.PaginationContainer>
					{users && <Paginator pagination={users} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{users?.result.map(user => (
						<ComboboxOption value={user.name} key={user.name} as={Fragment}>
							{({ focus }) => (
								<button
									type="button"
									data-testid="author-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										focus ? "bg-c-primary text-white" : ""
									}`}
									onClick={() => {
										onClose(user.name);
									}}
								>
									<ImageOrPlaceholder
										src={user.image ?? undefined}
										className="h-10 w-10 rounded-lg object-cover"
									/>
									<div className="flex flex-col">
										<span className="text-sm font-medium">{user.name}</span>
										<span
											className={`text-start text-xs ${
												focus ? "text-white" : "text-c-text-muted"
											}`}
										>
											{user.email}
										</span>
									</div>
								</button>
							)}
						</ComboboxOption>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
	);
}
