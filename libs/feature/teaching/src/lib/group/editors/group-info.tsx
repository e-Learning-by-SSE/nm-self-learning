import { Chip, IconButton, SectionHeader } from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Controller, useFormContext } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { LabeledField } from "@self-learning/ui/forms";
import { SearchGroupDialog } from "../dialogs/search-group-dialog";
import { useState } from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";

export function GroupInfoEditor() {
	const form = useFormContext<GroupFormModel>();
	const {
		register,
		control,
		formState: { errors }
	} = form;
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);

	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	return (
		<CenteredSection>
			<SectionHeader title="Grunddaten" subtitle="Grunddaten dieser Gruppe." />
			<div className="flex flex-col gap-4">
				<LabeledField label="Titel" error={errors.name?.message}>
					<input
						{...register("name")}
						type="text"
						className="textfield"
						placeholder="Name der neuen Gruppe"
					/>
				</LabeledField>
				<LabeledField label="Hauptgruppe auswählen">
					<IconButton
						text="Auswählen"
						icon={<ArrowsUpDownIcon className="icon h-5" />}
						onClick={() => setGroupDialogOpen(true)}
					/>
					<Controller
						name="parent"
						control={control}
						render={({ field, fieldState }) => {
							const error = fieldState.error?.message;
							return (
								<>
									{field.value && (
										<Chip
											onRemove={() => {
												field.onChange(null);
											}}
											displayImage={false}
										>
											{field.value.name}
										</Chip>
									)}
									{!field.value && (
										<p className="text-sm text-light">
											Keine Hauptgruppe gewählt
										</p>
									)}
									{isGroupDialogOpen && (
										<SearchGroupDialog
											isOpen={isGroupDialogOpen}
											isGlobalSearch={isAdmin}
											onClose={group => {
												setGroupDialogOpen(false);
												if (!group) return;
												field.onChange({
													id: group?.groupId,
													name: group?.name
												});
											}}
										/>
									)}
									{error && (
										<span className="px-4 text-xs text-red-500">{error}</span>
									)}
								</>
							);
						}}
					/>
				</LabeledField>
			</div>
		</CenteredSection>
	);
}
