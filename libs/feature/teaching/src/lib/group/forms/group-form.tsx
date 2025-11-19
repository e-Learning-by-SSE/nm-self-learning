import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { Form } from "@self-learning/ui/forms";
import { Chip, IconButton } from "@self-learning/ui/common";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { SearchGroupDialog } from "../dialogs/search-group-dialog";
import { AccessLevel } from "@prisma/client";

export function GroupForm({ subtitle }: { subtitle: string }) {
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
	const { control } = useFormContext<{ permissions: LessonFormModel["permissions"] }>();

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
					const isEmpty = !field.value?.length;
					const selectedGroupText = !isEmpty
						? field.value[0].groupName
						: "Keine Gruppe gewählt";
					const error = fieldState.error?.message;

					return (
						<>
							{isEmpty && <p className="text-sm text-light">{selectedGroupText}</p>}
							{!isEmpty && (
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
