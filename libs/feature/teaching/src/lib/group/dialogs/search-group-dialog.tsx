"use client";
import { Combobox, ComboboxOption } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { DropdownDialog, OnDialogCloseFn, Paginator } from "@self-learning/ui/common";
import { keepPreviousData } from "@tanstack/react-query";
import { Fragment, useState } from "react";

export type GroupSearchEntry = {
	groupId: number;
	name: string;
	members: string[];
};

export function SearchGroupDialog({
	isOpen,
	isGlobalSearch,
	onClose
}: {
	isOpen: boolean;
	isGlobalSearch: boolean;
	onClose: OnDialogCloseFn<GroupSearchEntry>;
}) {
	const [filterName, setFilterName] = useState("");
	const [page, setPage] = useState(1);
	const { data: allGroups } = trpc.permission.findGroups.useQuery(
		{
			page,
			name: filterName
		},
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData,
			enabled: isGlobalSearch
		}
	);
	const { data: myGroups } = trpc.permission.findMyGroups.useQuery(
		{
			page
		},
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData,
			enabled: !isGlobalSearch
		}
	);
	const groups = isGlobalSearch ? allGroups : myGroups;

	return (
		<DropdownDialog.Dialog open={isOpen} onClose={onClose}>
			<Combobox value={null}>
				{isGlobalSearch && (
					<DropdownDialog.SearchInput
						filter={filterName}
						setFilter={setFilterName}
						placeholder="Suche nach Gruppe"
					/>
				)}

				<DropdownDialog.PaginationContainer>
					{groups && <Paginator pagination={groups} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{groups?.result.map(group => (
						<ComboboxOption value={group} key={group.groupId} as={Fragment}>
							{({ focus }) => (
								<button
									type="button"
									onClick={() => onClose(group)}
									data-testid="course-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										focus ? "bg-secondary text-white" : ""
									}`}
								>
									<div className="flex-1 text-left">
										<span className="text-light">{group.name}</span>
									</div>
									<div className="flex-1 text-left">
										<span className="text-light">{group.members.length}</span>
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
