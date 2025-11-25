import { Combobox, ComboboxOption } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { DropdownDialog, ImageOrPlaceholder, OnDialogCloseFn } from "@self-learning/ui/common";
import { Fragment, useMemo, useState } from "react";

/**
 * Dialog to select an existing specialization.
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
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null}>
				<DropdownDialog.SearchInput
					filter={filter}
					setFilter={setFilter}
					placeholder="Suche nach Spezialisierung"
				/>

				<DropdownDialog.Options>
					{filtered?.map(subject => (
						<div key={subject.subjectId} className="flex flex-col">
							<span className="bg-c-surface-2 px-4 py-2 text-sm font-semibold">
								{subject.title}
							</span>
							<ul className="flex flex-col divide-y divide-c-border">
								{subject.specializations.map(spec => (
									<ComboboxOption
										value={spec}
										key={spec.specializationId}
										as={Fragment}
									>
										{({ focus }) => (
											<button
												type="button"
												onClick={() => onClose(spec)}
												className={`flex items-center gap-4 rounded pr-4 ${
													focus ? "bg-c-primary text-white" : ""
												}`}
											>
												<ImageOrPlaceholder
													src={spec.cardImgUrl ?? undefined}
													className="h-10 w-10 bg-white object-cover"
												/>
												<span className="text-sm font-medium">
													{spec.title}
												</span>
											</button>
										)}
									</ComboboxOption>
								))}
							</ul>
						</div>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
	);
}
