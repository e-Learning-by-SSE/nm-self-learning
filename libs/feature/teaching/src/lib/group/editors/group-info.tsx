import { Chip, IconTextButton, SectionHeader } from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Controller, useFormContext } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { InputWithButton, LabeledField, useSlugify } from "@self-learning/ui/forms";
import { SearchGroupDialog, useDefaultGroup } from "../dialogs/search-group-dialog";
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

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "name", "slug");

	// If user creates a group, and has default group set - preset group parent (once)
	const hasSetSingleGroup = useRef(false);
	console.log(session.data?.user);
	const defaultGroup = useDefaultGroup({
		defaultGroupId: session.data?.user.defaultGroupId,
		enabled: fillInSingleGroup && !form.getValues("parent") && !hasSetSingleGroup.current
	});
	useEffect(() => {
		if (hasSetSingleGroup.current) return;
		if (!defaultGroup) return;

		form.setValue("parent", { id: defaultGroup.groupId, name: defaultGroup.name });
		hasSetSingleGroup.current = true;
	}, [defaultGroup, form]);

	return (
		<CenteredSection>
			<SectionHeader title="Grunddaten" subtitle="Grunddaten dieser Gruppe." />
			<div className="flex flex-col gap-4">
				<LabeledField label="Name" error={errors.name?.message}>
					<input
						{...register("name")}
						type="text"
						className="textfield"
						placeholder="Name der neuen Gruppe"
					/>
				</LabeledField>
				<LabeledField label="Slug" error={errors.slug?.message}>
					<InputWithButton
						input={
							<input
								{...form.register("slug")}
								onBlur={slugifyIfEmpty}
								type="text"
								className="textfield"
								autoComplete="off"
							/>
						}
						button={
							<button type="button" className="btn-stroked" onClick={slugifyField}>
								Generieren
							</button>
						}
					/>
				</LabeledField>
				<LabeledField label="Hauptgruppe auswählen">
					<IconTextButton
						text="Auswählen"
						icon={<ArrowsUpDownIcon className="icon h-5" />}
						className="btn-secondary"
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
											exclude={field.value ? [field.value.id] : undefined}
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
