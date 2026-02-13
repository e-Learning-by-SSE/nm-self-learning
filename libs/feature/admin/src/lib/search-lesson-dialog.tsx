"use client";
import { Combobox, ComboboxOption } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { DropdownDialog, OnDialogCloseFn, Paginator } from "@self-learning/ui/common";
import { keepPreviousData } from "@tanstack/react-query";
import { Fragment, useState } from "react";

export type LessonSearchEntry = { lessonId: string; title: string; slug: string };

export function SearchLessonDialog({
	open,
	onClose
}: {
	open: boolean;
	onClose: OnDialogCloseFn<LessonSearchEntry>;
}) {
	const [title, setTitle] = useState("");
	const [page, setPage] = useState(1);
	const { data: lessons } = trpc.lesson.findMany.useQuery(
		{
			page,
			title
		},
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	return (
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null}>
				<DropdownDialog.SearchInput
					filter={title}
					setFilter={setTitle}
					placeholder="Suche nach Lerneinheit"
				/>

				<DropdownDialog.PaginationContainer>
					{lessons && <Paginator pagination={lessons} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{lessons?.result.map(lesson => (
						<ComboboxOption value={lesson} key={lesson.lessonId} as={Fragment}>
							{({ focus }) => (
								<button
									type="button"
									onClick={() => onClose(lesson)}
									data-testid="course-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										focus ? "bg-secondary text-white" : ""
									}`}
								>
									<div className="flex flex-col gap-1 text-start">
										<span className="text-sm font-medium">{lesson.title}</span>
										<span
											className={`text-start text-xs ${
												focus ? "text-white" : "text-light"
											}`}
										>
											{lesson.authors.map(a => a.displayName).join(", ")}
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
