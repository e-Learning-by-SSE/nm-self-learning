import { useMemo, useState } from "react";
import { Controller, useFieldArray, useFormContext, useFormState, useWatch } from "react-hook-form";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { Chip, IconButton } from "@self-learning/ui/common";
import { ArrowsUpDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { GroupSearchEntry, SearchGroupDialog } from "../dialogs/search-group-dialog";
import { AccessLevel } from "@prisma/client";
import { GenericCombobox } from "../editors/group-members";
import { useRequiredSession } from "@self-learning/ui/layouts";

export function GroupForm({ subtitle }: { subtitle: string }) {
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
	const { control } = useFormContext<{ permissions: LessonFormModel["permissions"] }>();
	const permissions = useWatch({
		control,
		name: "permissions"
	});

	const grantorGroup = useMemo(() => {
		return permissions?.find(p => !p.grantorId) ?? null;
	}, [permissions]);

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Gruppe" subtitle={subtitle}>
				<IconButton
					text="Auswählen"
					icon={<ArrowsUpDownIcon className="icon h-5" />}
					onClick={() => setGroupDialogOpen(true)}
				/>
			</Form.SidebarSectionTitle>

			<Controller
				name="permissions"
				control={control}
				render={({ field, fieldState }) => {
					const selectedGroupText = grantorGroup?.groupName ?? "Keine Gruppe gewählt";
					const error = fieldState.error?.message;

					return (
						<>
							{!grantorGroup && (
								<p className="text-sm text-light">{selectedGroupText}</p>
							)}
							{grantorGroup && (
								<Chip
									onRemove={() => {
										field.onChange([]);
									}}
									displayImage={false}
								>
									{selectedGroupText}
								</Chip>
							)}
							{isGroupDialogOpen && (
								<SearchGroupDialog
									isOpen={isGroupDialogOpen}
									isGlobalSearch={false}
									onClose={group => {
										setGroupDialogOpen(false);
										if (!group) return;
										// Temporal solution: just add one group with FULL permissions
										field.onChange([
											{
												groupId: group.groupId,
												accessLevel: AccessLevel.FULL,
												groupName: group.name
											}
										]);
									}}
								/>
							)}
							{error && <span className="px-4 text-xs text-red-500">{error}</span>}
						</>
					);
				}}
			/>
		</Form.SidebarSection>
	);
}

export function ResourceAccessEditor({ subtitle }: { subtitle: string }) {
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
	const { control } = useFormContext<{ permissions: LessonFormModel["permissions"] }>();
	const editor = useFieldArray({
		name: "permissions",
		control
	});
	const accessLevelOptions = [
		{ label: "Full", value: AccessLevel.FULL },
		{ label: "Edit", value: AccessLevel.EDIT },
		{ label: "View", value: AccessLevel.VIEW }
	];
	const permissions = useWatch({
		control,
		name: "permissions"
	});
	const grantorGroup = useMemo(() => {
		return permissions?.find(p => !p.grantorId) ?? null;
	}, [permissions]);

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Gruppen" subtitle={subtitle}>
				<IconButton
					text="Hinzufugen"
					icon={<PlusIcon className="icon h-5" />}
					onClick={() => setGroupDialogOpen(true)}
				/>
			</Form.SidebarSectionTitle>

			<>
				{grantorGroup && permissions.length <= 1 && (
					<p className="text-sm text-light">Keine Gruppen</p>
				)}
				{!grantorGroup && <p className="text-sm text-light">Keine Hauptgruppe</p>}
				{grantorGroup && (
					<div className="flex flex-col gap-2">
						{editor.fields.map((field, index) => {
							if (!field.grantorId) return null;
							return (
								<Controller
									key={field.id}
									name={`permissions.${index}`}
									control={control}
									render={({ field }) => (
										// const error = fieldState.error?.message;
										<Chip
											displayImage={false}
											onRemove={() => editor.remove(index)}
										>
											<span>{field.value?.groupName}</span>
											<LabeledField label="Zugriffsebene auswählen">
												<GenericCombobox
													value={field.value?.accessLevel ?? null}
													onChange={newLevel =>
														field.onChange({
															...field.value,
															accessLevel: newLevel
														})
													}
													options={accessLevelOptions}
													label={"Auswählen"}
												/>
											</LabeledField>
										</Chip>
										// {error && <span className="px-4 text-xs text-red-500">{error}</span>}
									)}
								/>
							);
						})}
					</div>
				)}
				{isGroupDialogOpen && grantorGroup && (
					<SearchGroupDialog
						isOpen={isGroupDialogOpen}
						isGlobalSearch={true}
						onClose={group => {
							setGroupDialogOpen(false);
							if (!group) return;
							// check if the same as grantor
							if (grantorGroup.groupId === group.groupId) return;
							// check if already appended
							const duplicate = editor.fields.find(u => u.groupId === group?.groupId);
							if (duplicate) return;

							editor.append({
								groupId: group.groupId,
								accessLevel: AccessLevel.EDIT,
								groupName: group.name,
								grantorId: grantorGroup.groupId
							});
						}}
					/>
				)}
			</>
		</Form.SidebarSection>
	);
}

export function GroupAccessEditor({ subtitle }: { subtitle: string }) {
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
	const { control } = useFormContext<{ permissions: LessonFormModel["permissions"] }>();

	// Admin can assign any group as main
	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";

	const editor = useFieldArray({
		name: "permissions",
		control
	});

	const permissions = useWatch({
		control,
		name: "permissions"
	});

	const grantorGroup = useMemo(() => permissions?.find(p => !p.grantorId) ?? null, [permissions]);

	const { errors } = useFormState({ control });
	const error = errors.permissions?.message;

	const accessLevelOptions = [
		{ label: "Full", value: AccessLevel.FULL },
		{ label: "Edit", value: AccessLevel.EDIT },
		{ label: "View", value: AccessLevel.VIEW }
	];

	const handleAddGroup = (group?: GroupSearchEntry) => {
		if (!group) return;

		if (!grantorGroup) {
			// first group becomes grantor
			editor.replace([
				{
					groupId: group.groupId,
					accessLevel: AccessLevel.FULL,
					groupName: group.name,
					grantorId: null
				}
			]);
		} else {
			// check duplicates
			const exists = editor.fields.find(f => f.groupId === group.groupId);
			if (exists) return;

			editor.append({
				groupId: group.groupId,
				accessLevel: AccessLevel.EDIT,
				groupName: group.name,
				grantorId: grantorGroup.groupId
			});
		}
	};

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Gruppe & Zugriff" subtitle={subtitle}>
				<IconButton
					text={grantorGroup ? "Hinzufügen" : "Auswählen"}
					icon={
						grantorGroup ? (
							<PlusIcon className="icon h-5" />
						) : (
							<ArrowsUpDownIcon className="icon h-5" />
						)
					}
					onClick={() => setGroupDialogOpen(true)}
				/>
			</Form.SidebarSectionTitle>

			{/* Grantor Group */}
			{grantorGroup ? (
				<Chip
					displayImage={false}
					onRemove={() => editor.replace([])} // clears everything
				>
					{grantorGroup.groupName}
				</Chip>
			) : (
				<p className="text-sm text-light">Keine Hauptgruppe gewählt</p>
			)}

			{/* Additional Groups */}
			<div className="flex flex-col gap-2 mt-2">
				{editor.fields.map((field, index) => {
					if (!field.grantorId) return null; // skip grantor
					return (
						<Controller
							key={field.id}
							name={`permissions.${index}`}
							control={control}
							render={({ field }) => (
								<Chip displayImage={false} onRemove={() => editor.remove(index)}>
									<span>{field.value?.groupName}</span>
									<LabeledField label="Zugriffsebene auswählen">
										<GenericCombobox
											value={field.value?.accessLevel ?? null}
											onChange={newLevel =>
												field.onChange({
													...field.value,
													accessLevel: newLevel
												})
											}
											options={accessLevelOptions}
											label="Auswählen"
										/>
									</LabeledField>
								</Chip>
							)}
						/>
					);
				})}
			</div>

			{/* Group Dialog */}
			{isGroupDialogOpen && (
				<SearchGroupDialog
					isOpen={isGroupDialogOpen}
					isGlobalSearch={!!grantorGroup || isAdmin}
					onClose={group => {
						setGroupDialogOpen(false);
						handleAddGroup(group);
					}}
				/>
			)}

			{error && <span className="px-4 text-xs text-red-500">{error}</span>}
		</Form.SidebarSection>
	);
}
