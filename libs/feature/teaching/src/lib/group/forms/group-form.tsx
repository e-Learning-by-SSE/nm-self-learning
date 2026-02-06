import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext, useFormState, useWatch } from "react-hook-form";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { Chip, IconTextButton } from "@self-learning/ui/common";
import { ArrowsUpDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import {
	GroupSearchEntry,
	SearchGroupDialog,
	useSingleMembership
} from "../dialogs/search-group-dialog";
import { AccessLevel } from "@prisma/client";
import { GenericCombobox } from "../editors/group-members";
import { useRequiredSession } from "@self-learning/ui/layouts";

export function GroupForm({ subtitle }: { subtitle: string }) {
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
	const { control } = useFormContext<{ permissions: LessonFormModel["permissions"] }>();

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Gruppe" subtitle={subtitle}>
				<IconTextButton
					text="Auswählen"
					icon={<ArrowsUpDownIcon className="icon h-5" />}
					onClick={() => setGroupDialogOpen(true)}
				/>
			</Form.SidebarSectionTitle>

			<Controller
				name="permissions"
				control={control}
				render={({ field, fieldState }) => {
					const error = fieldState.error?.message;

					return (
						<>
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

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Gruppen" subtitle={subtitle}>
				<IconTextButton
					text="Hinzufugen"
					className="btn-secondary"
					icon={<PlusIcon className="icon h-5" />}
					onClick={() => setGroupDialogOpen(true)}
				/>
			</Form.SidebarSectionTitle>

			<>
				{permissions.length === 0 ? (
					<p className="text-sm text-light">Keine Gruppen</p>
				) : (
					<div className="flex flex-col gap-2">
						{editor.fields.map((field, index) => {
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
				{isGroupDialogOpen && (
					<SearchGroupDialog
						isOpen={isGroupDialogOpen}
						isGlobalSearch={true}
						onClose={group => {
							setGroupDialogOpen(false);
							if (!group) return;
							// check if already appended
							const duplicate = editor.fields.find(u => u.groupId === group?.groupId);
							if (duplicate) return;

							editor.append({
								groupId: group.groupId,
								accessLevel: AccessLevel.EDIT,
								groupName: group.name
							});
						}}
					/>
				)}
			</>
		</Form.SidebarSection>
	);
}

export function GroupAccessEditor({
	subtitle,
	fillInSingleGroup
}: {
	subtitle: string;
	fillInSingleGroup: boolean;
}) {
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
	const { control } = useFormContext<{ permissions: LessonFormModel["permissions"] }>();

	// Admin can assign any group as main
	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	const memberships = session.data?.user.memberships;

	const mmbrSet = useMemo(() => new Set(memberships ?? []), [memberships]);

	const editor = useFieldArray({
		name: "permissions",
		control
	});

	const isEmpty = editor.fields.length === 0;

	const { errors } = useFormState({ control });
	const error = errors.permissions?.message;

	const accessLevelOptions = [
		{ label: "Full", value: AccessLevel.FULL },
		{ label: "Edit", value: AccessLevel.EDIT },
		{ label: "View", value: AccessLevel.VIEW }
	];

	const handleAddGroup = useCallback(
		(group?: GroupSearchEntry) => {
			if (!group) return;

			if (editor.fields.length === 0) {
				// first group becomes has full
				editor.replace([
					{
						groupId: group.groupId,
						accessLevel: AccessLevel.FULL,
						groupName: group.name
					}
				]);
			} else {
				// check duplicates
				const exists = editor.fields.find(f => f.groupId === group.groupId);
				if (exists) return;

				editor.append({
					groupId: group.groupId,
					accessLevel: AccessLevel.EDIT,
					groupName: group.name
				});
			}
		},
		[editor]
	);

	function handleRemoveGroup(index: number, value: LessonFormModel["permissions"][number]) {
		// check if it is last group user has access to
		const mmbrCnt = editor.fields.reduce(
			(count, g) => count + (mmbrSet.has(g.groupId) ? 1 : 0),
			0
		);
		if (
			mmbrCnt === 1 &&
			mmbrSet.has(value.groupId) &&
			!window.confirm(
				"Durch das Entfernen dieses Gruppenzugriffs verlieren Sie Ihren Zugriff. Fortfahren?"
			)
		)
			return;
		editor.remove(index);
	}

	// If user creates a group, not an admin, and has single membership - preset group parent (once)
	const hasSetSingleGroup = useRef(false);
	const singleGroup = useSingleMembership({
		userGroups: session.data?.user.memberships,
		enabled:
			fillInSingleGroup &&
			editor.fields.length === 0 &&
			!hasSetSingleGroup.current &&
			!isAdmin
	});
	useEffect(() => {
		if (hasSetSingleGroup.current) return;
		if (!singleGroup) return;
		handleAddGroup(singleGroup);

		hasSetSingleGroup.current = true;
	}, [singleGroup, handleAddGroup]);

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Gruppe & Zugriff" subtitle={subtitle}>
				<IconTextButton
					text={"Hinzufügen"}
					icon={<PlusIcon className="icon h-5" />}
					className="btn-secondary"
					onClick={() => setGroupDialogOpen(true)}
				/>
			</Form.SidebarSectionTitle>

			{isEmpty && <p className="text-sm text-light">Keine Gruppen</p>}

			<div className="flex flex-col gap-2 mt-2">
				{editor.fields.map((field, index) => (
					<Controller
						key={field.id}
						name={`permissions.${index}`}
						control={control}
						render={({ field }) => {
							const tmp = mmbrSet.has(field.value?.groupId);
							return (
								<Chip
									displayImage={false}
									onRemove={() => handleRemoveGroup(index, field.value)}
								>
									<span>
										{field.value?.groupName} {tmp && <i>(Mitglied)</i>}
									</span>
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
							);
						}}
					/>
				))}
			</div>

			{isGroupDialogOpen && (
				<SearchGroupDialog
					isOpen={isGroupDialogOpen}
					isGlobalSearch={!isEmpty || isAdmin}
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
