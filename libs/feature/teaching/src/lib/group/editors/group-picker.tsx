import { useState } from "react";
import { DetailsDropdown, IconTextButton, Chip, OnDialogCloseFn } from "@self-learning/ui/common";
import { SearchGroupDialog } from "@self-learning/teaching";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { GroupEntry } from "@self-learning/types";

export function GroupPicker({
	header,
	description,
	value,
	onChange,
	isAdmin
}: {
	header: string;
	description: string;
	value: GroupEntry | null;
	onChange: OnDialogCloseFn<GroupEntry | null>;
	isAdmin: boolean;
}) {
	const [isPickerOpen, setIsPickerOpen] = useState(false);

	return (
		<>
			<DetailsDropdown header={header} headerStyles="text-sm font-semibold">
				<span className="text-sm text-light">{description}</span>
			</DetailsDropdown>
			<IconTextButton
				icon={<ArrowsUpDownIcon className="icon h-5" />}
				className="btn-secondary"
				text="Eine Gruppe auswählen..."
				onClick={() => setIsPickerOpen(true)}
			/>

			{value ? (
				<Chip displayImage={false} onRemove={() => onChange(null)}>
					<div className="p-2 flex flex-col gap-1">
						{value.name}
						<span className="text-sm text-light">{value.slug}</span>
					</div>
				</Chip>
			) : (
				<p className="text-sm text-light">Keine Gruppe ausgewählt</p>
			)}

			{isPickerOpen && (
				<SearchGroupDialog
					isOpen={isPickerOpen}
					isGlobalSearch={isAdmin}
					onClose={async selectedGroup => {
						if (selectedGroup) {
							const slug = selectedGroup.slug || "";
							onChange({
								id: selectedGroup.groupId,
								name: (selectedGroup.name || "") as string,
								slug
							});
						}
						setIsPickerOpen(false);
					}}
				/>
			)}
		</>
	);
}
