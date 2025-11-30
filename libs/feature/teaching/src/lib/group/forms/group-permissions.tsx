import { IconButton, SectionHeader } from "@self-learning/ui/common";
import { Controller, useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { CenteredSection } from "@self-learning/ui/layouts";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { useState } from "react";
import {
	CourseSearchEntry,
	LessonSearchEntry,
	SearchCourseDialog,
	SearchLessonDialog
} from "@self-learning/admin";
import { GroupPermissionAdd } from "../editors/group-permission";

export function GroupPermissionsEditor() {
	const { control } = useFormContext<{ permissions: GroupFormModel["permissions"] }>();
	const editor = useFieldArray({
		name: "permissions",
		control
	});
	const { errors } = useFormState({ control });
	const error = errors.permissions?.message;
	const onSelectCourse = (course?: CourseSearchEntry) => {
		setSearchCourseActive(false);
		if (!course) return;
		// check if already appended
		const duplicate = editor.fields.find(u => u.course?.courseId === course.courseId);
		if (duplicate) return;
		//
		editor.append({
			course,
			accessLevel: AccessLevel.FULL
		});
	};
	const onSelectLesson = (lesson?: LessonSearchEntry) => {
		setSearchLessonActive(false);
		if (!lesson) return;
		// check if already appended
		const duplicate = editor.fields.find(u => u.lesson?.lessonId === lesson.lessonId);
		if (duplicate) return;
		//
		editor.append({
			lesson,
			accessLevel: AccessLevel.FULL
		});
	};

	const [searchCourseActive, setSearchCourseActive] = useState(false);
	const [searchLessonActive, setSearchLessonActive] = useState(false);

	return (
		<CenteredSection>
			<SectionHeader
				title="Ressourcen"
				subtitle="Alle Ressourcen dieser Gruppe."
				button={
					<>
						<IconButton
							text="Kurs hinzufügen"
							icon={<PlusIcon className="icon w-5" />}
							onClick={() => setSearchCourseActive(true)}
						/>
						<IconButton
							text="Lerneinheit hinzufügen"
							icon={<PlusIcon className="icon w-5" />}
							onClick={() => setSearchLessonActive(true)}
						/>
					</>
				}
			/>
			{searchCourseActive && (
				<SearchCourseDialog open={searchCourseActive} onClose={onSelectCourse} />
			)}
			{searchLessonActive && (
				<SearchLessonDialog open={searchLessonActive} onClose={onSelectLesson} />
			)}

			<div className="flex flex-col gap-2">
				{editor.fields.map((field, index) => (
					<Controller
						key={field.id}
						name={`permissions.${index}`}
						control={control}
						render={({ field, fieldState }) => (
							<div className="rounded border p-2 border-light-border">
								<GroupPermissionAdd
									permission={field.value}
									onChange={field.onChange}
								/>
								<button
									type="button"
									title="Entfernen"
									className="rounded p-1 hover:bg-red-100 text-red-500"
									onClick={() => editor.remove(index)}
								>
									<TrashIcon className="h-4 w-4" />
								</button>
								{fieldState.error?.message && (
									<span className="px-4 text-xs text-red-500">
										{fieldState.error.message}
									</span>
								)}
							</div>
						)}
					/>
				))}
			</div>
			{error && <span className="px-4 text-xs text-red-500">{error}</span>}
		</CenteredSection>
	);
}
