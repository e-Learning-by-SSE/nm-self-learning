import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { Paginator } from "@self-learning/ui/common";
import { Fragment, useState } from "react";

export function LessonSelector({
	open,
	onClose
}: {
	open: boolean;
	onClose: (lesson?: LessonSummary) => void;
}) {
	const [title, setTitle] = useState("");
	const [page, setPage] = useState(1);
	const { data } = trpc.lesson.findMany.useQuery(
		{ title, page },
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
							<span className="flex items-center border-b border-b-light-border py-1 px-3">
								<SearchIcon className="h-6 text-light" />
								<Combobox.Input
									className="w-full border-none focus:ring-0"
									placeholder="Suche nach Titel"
									onChange={e => setTitle(e.target.value)}
									autoComplete="off"
								/>
							</span>
							<span className="px-4">
								{data && (
									<Paginator pagination={data} url="#" onPageChange={setPage} />
								)}
							</span>
							<div className="divide-border-light playlist-scroll flex flex-col divide-y overflow-auto">
								<Combobox.Options
									static={true}
									className="flex flex-col divide-y divide-light-border"
								>
									{data?.result.map(lesson => (
										<Combobox.Option
											value={lesson}
											key={lesson.lessonId}
											as={Fragment}
										>
											{({ active }) => (
												<button
													type="button"
													className={`flex flex-col gap-1 rounded px-4 py-2 ${
														active ? "bg-secondary text-white" : ""
													}`}
												>
													<span className="text-sm font-medium ">
														{lesson.title}
													</span>
													<span
														className={`text-xs font-normal ${
															active ? "text-white" : "text-light"
														}`}
													>
														von{" "}
														{lesson.authors
															.map(a => a.displayName)
															.join(", ")}
													</span>
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

export type LessonSummary = { lessonId: string; title: string; slug: string };
