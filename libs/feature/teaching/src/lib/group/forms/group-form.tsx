import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { Chip, IconTextButton } from "@self-learning/ui/common";
import { PlusIcon } from "@heroicons/react/24/solid";
import {
	GroupSearchEntry,
	SearchGroupDialog,
	useDefaultGroup
} from "../dialogs/search-group-dialog";
import { AccessLevel } from "@prisma/client";
import { GenericCombobox } from "../editors/group-members";
import { useRequiredSession } from "@self-learning/ui/layouts";

/**
 * GroupAccessEditor - Sidebar form section for selecting group access and auto-filling default group.
 *
 * Note: Must be used within a form with field `permissions: LessonFormModel["permissions"]` in context.
 *
 * Usage: Used for permission forms that require one or more groups. It shows the current group access
 * list, allows adding new groups via SearchGroupDialog, and can auto-add the user's default group once.
 * It also warns users when removing their last access group.
 *
 * UI: Sidebar section with title/subtitle, add-group button, permission chips with access-level selectors,
 * and SearchGroupDialog for group selection.
 * Related: SearchGroupDialog, useDefaultGroup, LessonFormModel
 *
 * @param subtitle - Subtitle text for the sidebar section
 * @param doUseDefaultGroup - If true, auto-add the user's default group on first load when empty
 */
export function GroupAccessEditor({
	subtitle,
	doUseDefaultGroup
}: {
	subtitle: string;
	doUseDefaultGroup: boolean;
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

	// If user creates a group, and has default group set - preset group parent (once)
	const hasSetSingleGroup = useRef(false);
	const defaultGroup = useDefaultGroup({
		defaultGroupId: session.data?.user.defaultGroupId,
		enabled: doUseDefaultGroup && editor.fields.length === 0
	});
	useEffect(() => {
		if (hasSetSingleGroup.current) return;
		if (!defaultGroup) return;
		handleAddGroup(defaultGroup);

		hasSetSingleGroup.current = true;
	}, [defaultGroup, handleAddGroup]);

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
									<div className="flex flex-col gap-1 py-2">
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
									</div>
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
					exclude={editor.fields.map(f => f.groupId)}
				/>
			)}

			{error && <span className="px-4 text-xs text-red-500">{error}</span>}
		</Form.SidebarSection>
	);
}
