import { ArrowsUpDownIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { CourseSearchEntry, SearchCourseDialog } from "@self-learning/admin";
import { ResourceAccessFormSchema, ResourceAccessFormType } from "@self-learning/types";
import {
	Chip,
	DialogActions,
	IconButton,
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
				title: perm.lesson!.title,
				id: "l:" + perm.lesson!.lessonId,
				slug: perm.lesson!.slug,
				accessLevel: perm.accessLevel
			};
}

export function getPermKey(perm: ResourceAccessFormType) {
	return perm.course ? "c:" + perm.course.courseId : "l:" + perm.lesson!.lessonId;
}

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
					<IconButton
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
					variant="x-mark"
					onClick={() => onDelete && onDelete(permission)}
				/>
			</TableDataColumn>
		</tr>
	);
}

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

export function GroupPermissionRow({
	permission,
	onEdit,
	onDelete
}: {
	permission: PermissionFormModel;
	onEdit?: OnDialogCloseFn<PermissionFormModel>;
	onDelete?: OnDialogCloseFn<PermissionFormModel>;
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
					icon={<PencilIcon className="h-4 w-4" />}
					onClick={() => onEdit && onEdit(permission)}
				/>
				<IconOnlyButton
					icon={<TrashIcon className="h-4 w-4" />}
					variant="x-mark"
					onClick={() => onDelete && onDelete(permission)}
				/>
			</TableDataColumn>
		</tr>
	);
}
