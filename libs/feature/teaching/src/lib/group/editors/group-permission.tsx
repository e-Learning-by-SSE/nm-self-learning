import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { CourseSearchEntry, SearchCourseDialog } from "@self-learning/admin";
import { Member, ResourceAccessFormSchema, ResourceAccessFormType } from "@self-learning/types";
import { Chip, DialogActions, IconButton, OnDialogCloseFn } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { GenericCombobox } from "./group-members";

export type MemberFormModel = Member;
export type PermissionFormModel = ResourceAccessFormType;

export function GroupPermissionAdd({
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
	const accessLevelOptions = [
		{ label: "Full", value: AccessLevel.FULL },
		{ label: "Edit", value: AccessLevel.EDIT },
		{ label: "View", value: AccessLevel.VIEW }
	];

	const [searchCourseActive, setSearchCourseActive] = useState(false);

	const updatePermission = (patch: Partial<PermissionFormModel>) => {
		const current = permission ?? ({} as PermissionFormModel);
		const validated = ResourceAccessFormSchema.parse({ ...current, ...patch });
		onChange(validated);
	};

	const onCancel = () => {
		onSubmit && onSubmit(undefined);
	};

	const onSelectCourse = (course?: CourseSearchEntry) => {
		setSearchCourseActive(false);
		if (course) {
			updatePermission({ course });
		}
	};

	const onSelectLevel = (accessLevel: AccessLevel) => {
		updatePermission({ accessLevel });
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
			<LabeledField label="Access level auswählen">
				<GenericCombobox
					value={permission?.accessLevel ?? null}
					onChange={onSelectLevel}
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
