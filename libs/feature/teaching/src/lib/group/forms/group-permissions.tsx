import { DropdownMenu, IconTextButton, SectionHeader } from "@self-learning/ui/common";
import { Controller, useFieldArray, useFormContext, useFormState, useWatch } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { CenteredSection } from "@self-learning/ui/layouts";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { SearchResourceDialog } from "@self-learning/admin";
import {
	allResourceKinds,
	getResourceAccessFormKey,
	resourceLabels,
	ResourceKind,
	ResourceSearchEntry,
	toResourceAccessForm
} from "@self-learning/types";
import {
	GroupPermissionRow,
	GroupPermissionRowEditor,
	GroupPermissionTable
} from "../editors/group-permission";
import { useArrayDiff } from "../misc/use-array-diff";

/**
 * GroupPermissionsEditor - Section for editing a group's resource permissions.
 *
 * Note: Must be used within a form with field `permissions: GroupFormModel["permissions"]` in context.
 *
 * Usage: Used in group edit/create flows to add resources to a group's permissions list.
 * It opens a resource search dialog, appends selected resources, and renders editable rows
 * for each permission.
 *
 * UI: Header with add button, SearchResourceDialog overlay, and a permission table.
 * Related: GroupPermissionTable, GroupPermissionRowEditor, SearchResourceDialog
 */
export function GroupPermissionsEditor() {
	const { control } = useFormContext<{ permissions: GroupFormModel["permissions"] }>();
	const editor = useFieldArray({
		name: "permissions",
		control
	});
	const { errors } = useFormState({ control });
	const error = errors.permissions?.message;
	const onSelectResource = (resource?: ResourceSearchEntry) => {
		setSearchResourceActive(false);
		if (!resource) return;

		const permission = toResourceAccessForm(resource);
		const duplicate = editor.fields.find(
			field => getResourceAccessFormKey(field) === getResourceAccessFormKey(permission)
		);
		if (duplicate) return;

		editor.append(permission);
	};

	const [searchResourceActive, setSearchResourceActive] = useState(false);
	const [searchResourceKinds, setSearchResourceKinds] = useState<ResourceKind[]>();

	function openSearchResourceDialog(kinds?: ResourceKind[]) {
		setSearchResourceKinds(kinds);
		setSearchResourceActive(true);
	}

	const permissions = useWatch({
		control,
		name: "permissions"
	});
	const diff = useArrayDiff({
		current: permissions,
		getKey: getResourceAccessFormKey,
		isEqual: (left, right) =>
			getResourceAccessFormKey(left) === getResourceAccessFormKey(right) &&
			left.accessLevel === right.accessLevel
	});

	return (
		<CenteredSection>
			<SectionHeader
				title="Ressourcen"
				subtitle="Alle Ressourcen dieser Gruppe."
				button={
					<DropdownMenu
						title="Ressource hinzufügen"
						button={
							<IconTextButton
								text="Ressource hinzufügen"
								icon={<PlusIcon className="icon w-5" />}
							/>
						}
					>
						<button
							type="button"
							className="w-full px-3 py-2 text-left"
							onClick={() => openSearchResourceDialog()}
						>
							Alle Ressourcen
						</button>
						{allResourceKinds.map(kind => (
							<button
								key={kind}
								type="button"
								className="w-full px-3 py-2 text-left"
								onClick={() => openSearchResourceDialog([kind])}
							>
								{resourceLabels[kind]}
							</button>
						))}
					</DropdownMenu>
				}
			/>
			{searchResourceActive && (
				<SearchResourceDialog
					open={searchResourceActive}
					kinds={searchResourceKinds}
					onClose={onSelectResource}
				/>
			)}

			<GroupPermissionTable>
				{editor.fields.map((field, index) => (
					<Controller
						key={field.id}
						name={`permissions.${index}`}
						control={control}
						render={({ field, fieldState }) => (
							<>
								<GroupPermissionRowEditor
									permission={field.value}
									diffStatus={diff.getStatus(field.value)}
									onChange={field.onChange}
									onDelete={() => editor.remove(index)}
								/>
								{fieldState.error?.message && (
									<tr>
										<td colSpan={100} className="bg-red-50 rounded-lg">
											<span className="px-2 py-1 text-xs text-red-500">
												{fieldState.error.message}
											</span>
										</td>
									</tr>
								)}
							</>
						)}
					/>
				))}
				{diff.deleted.map(item => (
					<GroupPermissionRow
						key={item.key}
						permission={item.value}
						diffStatus="deleted"
					/>
				))}
			</GroupPermissionTable>
			{error && <span className="px-4 text-xs text-red-500">{error}</span>}
		</CenteredSection>
	);
}
