import { TrashIcon, UsersIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { CourseSearchEntry } from "@self-learning/admin";
import {
	normalizeFormResourceAccess,
	ResourceAccessFormSchema,
	ResourceAccessFormType
} from "@self-learning/types";
import {
	IconOnlyButton,
	OnDialogCloseFn,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { GenericCombobox } from "./group-members";
import { ArrayDiffStatus, TableDiffColumn } from "../misc/use-array-diff";

export type PermissionFormModel = ResourceAccessFormType;

const accessLevelOptions = [
	{ label: "Full", value: AccessLevel.FULL },
	{ label: "Edit", value: AccessLevel.EDIT },
	{ label: "View", value: AccessLevel.VIEW }
];

/**
 * usePermissionEditor - Hook providing state and handlers for permission form field changes.
 *
 * Usage: Called by permission editor components to manage permission updates (access level, resource).
 * Provides setter functions and automatic validation via ResourceAccessFormSchema.parse().
 *
 * @param onChange - Callback with updated PermissionFormModel when any field changes
 * @param permission - Current permission form data (optional)
 * @returns Object with setters (setLevel, setCourse) for updating permission fields
 */
export function usePermissionEditor(
	onChange: OnDialogCloseFn<PermissionFormModel>,
	permission?: PermissionFormModel
) {
	const update = (patch: Partial<PermissionFormModel>) => {
		const current = permission ?? ({} as PermissionFormModel);
		const validated = ResourceAccessFormSchema.parse({ ...current, ...patch });
		onChange(validated);
	};

	const setLevel = (accessLevel: AccessLevel) => {
		update({ accessLevel });
	};

	const setCourse = (course: CourseSearchEntry) => {
		update({ course });
	};

	return {
		setLevel,
		setCourse
	};
}

/**
 * GroupPermissionRowEditor - Editable table row displaying a permission with inline access level control.
 *
 * Usage: Renders a single permission as an editable table row within GroupPermissionTable. Displays
 * resource type (Kurs/Lerneinheit), title, slug, and access level as an editable dropdown.
 * Optional delete button calls onDelete callback.
 *
 * UI: Table row with resource info (read-only), access level dropdown (editable), trash icon to delete
 * Related: GroupPermissionTable, usePermissionEditor, GroupPermissionRow (read-only version)
 *
 * @param permission - Permission form data
 * @param onChange - Callback when access level dropdown changes
 * @param onDelete - Optional callback when trash icon clicked; receives the permission to delete
 */
export function GroupPermissionRowEditor({
	permission,
	diffStatus,
	onChange,
	onDelete
}: {
	permission: PermissionFormModel;
	diffStatus?: ArrayDiffStatus;
	onChange: OnDialogCloseFn<PermissionFormModel>;
	onDelete?: OnDialogCloseFn<PermissionFormModel>;
}) {
	const { setLevel } = usePermissionEditor(onChange, permission);
	const p = normalizeFormResourceAccess(permission);

	return (
		<tr>
			<TableDiffColumn status={diffStatus}>
				<span className="text-light">{p.type}</span>
			</TableDiffColumn>

			<TableDataColumn>
				<span className="text-light">{p.title}</span>
			</TableDataColumn>
			<TableDataColumn>
				<span className="text-light">{p.slug}</span>
			</TableDataColumn>

			<TableDataColumn>
				<GenericCombobox
					value={permission?.accessLevel ?? null}
					onChange={setLevel}
					options={accessLevelOptions}
					label={"Auswählen"}
				/>
			</TableDataColumn>
			<TableDataColumn>
				<IconOnlyButton
					icon={<TrashIcon className="h-4 w-4" />}
					className="btn-x-mark"
					onClick={() => onDelete && onDelete(permission)}
				/>
			</TableDataColumn>
		</tr>
	);
}

/**
 * GroupPermissionTable - Wrapper table component for displaying group permissions in rows.
 *
 * Usage: Container table for rendering a list of group permissions (courses/lessons). Provides standard
 * table header with columns (Resource type, Title, Slug, Access level, Actions). Use with
 * GroupPermissionRow or GroupPermissionRowEditor children.
 *
 * UI: Table with 5 columns (resource type, title, slug, access level, delete button)
 * Related: GroupPermissionRow, GroupPermissionRowEditor, Table (UI component)
 *
 * @param children - Array of row elements (GroupPermissionRow or GroupPermissionRowEditor)
 */
export function GroupPermissionTable({ children }: { children: React.ReactNode[] }) {
	return (
		<Table
			head={
				<>
					<TableHeaderColumn>Ressource</TableHeaderColumn>
					<TableHeaderColumn>Titel</TableHeaderColumn>
					<TableHeaderColumn>Slug</TableHeaderColumn>
					<TableHeaderColumn>Zugriffsebene</TableHeaderColumn>
					<TableHeaderColumn></TableHeaderColumn>
				</>
			}
			overflow="visible"
		>
			{children}
		</Table>
	);
}

/**
 * GroupPermissionRow - Read-only table row displaying a permission and relation action.
 *
 * Usage: Renders a single group permission in a read-only list with a button to open the relation
 * dialog showing which users have access through this group. Used in group detail pages.
 *
 * UI: Table row with resource type, title, slug, access level, and a "who has access" button.
 * Related: GroupPermissionTable, GroupPermissionRelationsDialog
 *
 * @param permission - Permission data to display
 * @param onEdit - Optional callback when edit action is triggered (currently unused)
 * @param onDelete - Optional callback when delete action is triggered (currently unused)
 * @param onRelations - Callback when the relations button is clicked
 */
export function GroupPermissionRow({
	permission,
	diffStatus,
	onEdit,
	onDelete,
	onRelations
}: {
	permission: PermissionFormModel;
	diffStatus?: ArrayDiffStatus;
	onEdit?: OnDialogCloseFn<PermissionFormModel>;
	onDelete?: OnDialogCloseFn<PermissionFormModel>;
	onRelations?: OnDialogCloseFn<PermissionFormModel>;
}) {
	const p = normalizeFormResourceAccess(ResourceAccessFormSchema.parse(permission));

	return (
		<tr>
			<TableDiffColumn status={diffStatus}>
				<span className="text-light">{p.type}</span>
			</TableDiffColumn>

			<TableDataColumn>
				<span className="text-light">{p.title}</span>
			</TableDataColumn>
			<TableDataColumn>
				<span className="text-light">{p.slug}</span>
			</TableDataColumn>
			<TableDataColumn>
				<span className="text-light">{p.accessLevel}</span>
			</TableDataColumn>
			<TableDataColumn className="p-2 flex">
				<IconOnlyButton
					icon={<UsersIcon className="h-4 w-4" />}
					className="btn-with-icon"
					onClick={() => onRelations && onRelations(permission)}
					title={"Wer hat Zugriff auf diese Ressource?"}
				/>
				{/* <IconOnlyButton TODO not in this PR
					icon={<PencilIcon className="h-4 w-4" />}
					onClick={() => onEdit && onEdit(permission)}
				/>
				<IconOnlyButton
					icon={<TrashIcon className="h-4 w-4" />}
					className="btn-x-mark"
					onClick={() => onDelete && onDelete(permission)}
				/> */}
			</TableDataColumn>
		</tr>
	);
}
