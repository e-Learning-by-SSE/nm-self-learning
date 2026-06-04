import { ArrowsUpDownIcon, TrashIcon, UsersIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { CourseSearchEntry, SearchCourseDialog } from "@self-learning/admin";
import { ResourceAccessFormSchema, ResourceAccessFormType } from "@self-learning/types";
import {
	Chip,
	DialogActions,
	IconTextButton,
	IconOnlyButton,
	OnDialogCloseFn,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { GenericCombobox } from "./group-members";

export type PermissionFormModel = ResourceAccessFormType;

const accessLevelOptions = [
	{ label: "Full", value: AccessLevel.FULL },
	{ label: "Edit", value: AccessLevel.EDIT },
	{ label: "View", value: AccessLevel.VIEW }
];

function normalizePermission(perm: ResourceAccessFormType) {
	return perm.course
		? {
				type: "Kurs",
				title: perm.course.title,
				id: "c:" + perm.course.courseId,
				slug: perm.course.slug,
				accessLevel: perm.accessLevel
			}
		: {
				type: "Lerninhalt",
				title: perm.lesson.title,
				id: "l:" + perm.lesson.lessonId,
				slug: perm.lesson.slug,
				accessLevel: perm.accessLevel
			};
}

export function getPermKey(perm: ResourceAccessFormType) {
	return perm.course ? "c:" + perm.course.courseId : "l:" + perm.lesson.lessonId;
}

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
 * GroupPermissionEditor - Dialog or form section for editing a single group permission (course or lesson access).
 *
 * Usage: Renders editable fields for permission: resource (course/lesson) selector, access level dropdown.
 * Optionally allows choosing a resource (SearchCourseDialog) or displays read-only resource info. Calls onChange
 * on any change. Optional onSubmit adds action buttons.
 *
 * UI: Either resource selector button (if canEditResource) or read-only resource display, access level
 * combobox (FULL/EDIT/VIEW), optional submit/cancel buttons. Opens SearchCourseDialog internally.
 * Related: usePermissionEditor, SearchCourseDialog, GenericCombobox
 *
 * @param permission - Current permission form data
 * @param onChange - Callback when any field changes
 * @param onSubmit - Optional callback for submit button; if provided, adds dialog action buttons
 * @param canEditResource - If true, shows resource selector; if false, resource is read-only
 */
export function GroupPermissionEditor({
	permission,
	onChange,
	onSubmit,
	canEditResource
}: {
	permission?: PermissionFormModel;
	onChange: OnDialogCloseFn<PermissionFormModel>;
	onSubmit?: OnDialogCloseFn<PermissionFormModel>;
	canEditResource?: boolean;
}) {
	const [searchCourseActive, setSearchCourseActive] = useState(false);

	const { setLevel, setCourse } = usePermissionEditor(onChange, permission);

	const onCancel = () => {
		onSubmit && onSubmit(undefined);
	};

	const onSelectCourse = (course?: CourseSearchEntry) => {
		setSearchCourseActive(false);
		if (course) {
			setCourse(course);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{canEditResource && (
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">{permission?.course ? "Kurs" : "Lerneinheit"}</h1>
					<IconTextButton
						text="Kurs auswählen"
						icon={<ArrowsUpDownIcon className="icon h-5" />}
						onClick={() => setSearchCourseActive(true)}
					/>
					{searchCourseActive && (
						<SearchCourseDialog open={searchCourseActive} onClose={onSelectCourse} />
					)}
				</div>
			)}
			{!canEditResource && permission?.course && (
				<h1 className="text-xl">Kurs {permission?.course?.title}</h1>
			)}
			{!canEditResource && permission?.lesson && (
				<h1 className="text-xl">Lerneinheit {permission?.lesson?.title}</h1>
			)}
			{permission?.course && (
				<Chip displayImage={false}>
					<span>{permission?.course?.title ?? "N/A"}</span>
					<span className="text-sm text-light">{permission?.course?.slug}</span>
				</Chip>
			)}
			{permission?.lesson && (
				<Chip displayImage={false}>
					<span>{permission?.lesson?.title ?? "N/A"}</span>
					<span className="text-sm text-light">{permission?.lesson?.slug}</span>
				</Chip>
			)}
			<LabeledField label="Zugriffsebene auswählen">
				<GenericCombobox
					value={permission?.accessLevel ?? null}
					onChange={setLevel}
					options={accessLevelOptions}
					label={"Auswählen"}
				/>
			</LabeledField>

			{onSubmit && (
				<DialogActions onClose={onCancel}>
					<button className="btn-primary" type="submit">
						Speichern
					</button>
				</DialogActions>
			)}
		</div>
	);
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
	onChange,
	onDelete
}: {
	permission: PermissionFormModel;
	onChange: OnDialogCloseFn<PermissionFormModel>;
	onDelete?: OnDialogCloseFn<PermissionFormModel>;
}) {
	const { setLevel } = usePermissionEditor(onChange, permission);
	const p = normalizePermission(permission);

	return (
		<tr>
			<TableDataColumn>
				<span className="text-light">{p.type}</span>
			</TableDataColumn>

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
	onEdit,
	onDelete,
	onRelations
}: {
	permission: PermissionFormModel;
	onEdit?: OnDialogCloseFn<PermissionFormModel>;
	onDelete?: OnDialogCloseFn<PermissionFormModel>;
	onRelations?: OnDialogCloseFn<PermissionFormModel>;
}) {
	const p = normalizePermission(ResourceAccessFormSchema.parse(permission));

	return (
		<tr>
			<TableDataColumn>
				<span className="text-light">{p.type}</span>
			</TableDataColumn>

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
