import { Chip, IconTextButton, SectionHeader } from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Controller, useFormContext } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { LabeledField } from "@self-learning/ui/forms";
import { SearchGroupDialog, useSingleMembership } from "../dialogs/search-group-dialog";
import { useEffect, useRef, useState } from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";

export function GroupInfoEditor({ fillInSingleGroup }: { fillInSingleGroup: boolean }) {
	const form = useFormContext<GroupFormModel>();
	const {
		register,
		control,
		formState: { errors }
	} = form;
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);

	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";

	// If user creates a group, not an admin, and has single membership - preset group parent (once)
	const hasSetSingleGroup = useRef(false);
	const singleGroup = useSingleMembership({
		userGroups: session.data?.user.memberships,
		enabled:
			fillInSingleGroup && !form.getValues("parent") && !hasSetSingleGroup.current && !isAdmin
	});
	useEffect(() => {
		if (hasSetSingleGroup.current) return;
		if (!singleGroup) return;

		form.setValue("parent", { id: singleGroup.groupId, name: singleGroup.name });
		hasSetSingleGroup.current = true;
	}, [singleGroup, form]);

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
					<IconTextButton
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
