import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { ImageOrPlaceholder, OnDialogCloseFn } from "@self-learning/ui/common";
import { Fragment, useMemo, useState } from "react";

/**
 * Dialog that allows the user to select an author from a list of authors.
 */
export function SpecializationSelector({
	onClose,
	open
}: {
	open: boolean;
	onClose: OnDialogCloseFn<{ specializationId: string; title: string }>;
}) {
	const { data: subjects } = trpc.subject.getAllWithSpecializations.useQuery();
	const [filter, setFilter] = useState("");

	const filtered = useMemo(() => {
		if (!subjects) return [];

		if (!filter || filter === "") {
			return subjects;
		}

		const lcFilter = filter.toLowerCase();

		return subjects.map(subject => ({
			...subject,
			specializations: subject.specializations.filter(s =>
				s.title.toLowerCase().includes(lcFilter)
			)
		}));
	}, [filter, subjects]);

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
						className="ov mx-auto flex h-fit w-[90vw] flex-col overflow-hidden rounded-lg bg-white lg:w-[800px]"
						style={{ maxHeight: "624px" }}
					>
						<Combobox value={null} onChange={onClose}>
							<span className="flex items-center gap-2 border-b border-b-light-border py-1 px-6">
								<SearchIcon className="h-6 text-light" />
								<Combobox.Input
									className="w-full border-none focus:ring-0"
									placeholder="Suche nach Spezialisierung..."
									onChange={e => setFilter(e.target.value)}
								/>
							</span>
							<div className="playlist-scroll flex flex-col overflow-auto">
								<Combobox.Options className="flex flex-col" static={true}>
									{filtered?.map(subject => (
										<div key={subject.subjectId} className="flex flex-col">
											<span className="bg-gray-100 px-4 py-2 text-sm font-semibold">
												{subject.title}
											</span>
											<ul className="flex flex-col divide-y divide-light-border">
												{subject.specializations.map(spec => (
													<Combobox.Option
														value={spec}
														key={spec.specializationId}
														as={Fragment}
													>
														{({ active }) => (
															<button
																type="button"
																className={`flex items-center gap-4 rounded pr-4 ${
																	active
																		? "bg-secondary text-white"
																		: ""
																}`}
															>
																<ImageOrPlaceholder
																	src={
																		spec.cardImgUrl ?? undefined
																	}
																	className="h-10 w-10 bg-white object-cover"
																/>
																<span className="text-sm font-medium">
																	{spec.title}
																</span>
															</button>
														)}
													</Combobox.Option>
												))}
											</ul>
										</div>
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
