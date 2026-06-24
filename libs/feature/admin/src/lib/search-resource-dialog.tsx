"use client";
import { Combobox, ComboboxOption } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { resourceLabels, ResourceKind, ResourceSearchEntry } from "@self-learning/types";
import {
	DropdownDialog,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	Paginator
} from "@self-learning/ui/common";
import { keepPreviousData } from "@tanstack/react-query";
import { Fragment, useState } from "react";

export function SearchResourceDialog({
	open,
	onClose,
	kinds,
	scope = "all"
}: {
	open: boolean;
	onClose: OnDialogCloseFn<ResourceSearchEntry>;
	kinds?: ResourceKind[];
	scope?: "all" | "mine";
}) {
	const [title, setTitle] = useState("");
	const [page, setPage] = useState(1);
	const queryInput = { page, title, kinds };
	const allResources = trpc.permission.searchResources.useQuery(queryInput, {
		enabled: scope === "all",
		staleTime: 10_000,
		placeholderData: keepPreviousData
	});
	const myResources = trpc.permission.getMyResources.useQuery(queryInput, {
		enabled: scope === "mine",
		staleTime: 10_000,
		placeholderData: keepPreviousData
	});
	const resources = scope === "mine" ? myResources.data : allResources.data;

	return (
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null}>
				<DropdownDialog.SearchInput
					filter={title}
					setFilter={value => {
						setTitle(value);
						setPage(1);
					}}
					placeholder="Suche nach Ressource"
				/>

				<DropdownDialog.PaginationContainer>
					{resources && (
						<Paginator pagination={resources} url="#" onPageChange={setPage} />
					)}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{resources?.result.map(resource => (
						<ComboboxOption value={resource} key={resource.key} as={Fragment}>
							{({ focus }) => (
								<button
									type="button"
									onClick={() => onClose(resource)}
									data-testid="resource-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										focus ? "bg-c-primary text-white" : ""
									}`}
								>
									<ImageOrPlaceholder
										src={resource.imgUrl ?? undefined}
										className="h-10 w-10 rounded-lg object-cover"
									/>
									<div className="flex flex-col gap-1 text-start">
										<span className="text-sm font-medium">
											{resource.title}
										</span>
										<span
											className={`text-start text-xs ${
												focus ? "text-white" : "text-c-text-muted"
											}`}
										>
											{resourceLabels[resource.kind]}
											{resource.accessLevel
												? ` (${resource.accessLevel})`
												: ""}
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
