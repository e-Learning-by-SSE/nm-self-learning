import { IconTextButton, SectionHeader } from "@self-learning/ui/common";
import { Controller, useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { CenteredSection } from "@self-learning/ui/layouts";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { useState } from "react";
import {
	CourseSearchEntry,
	LessonSearchEntry,
	SearchCourseDialog,
	SearchLessonDialog
} from "@self-learning/admin";
import { GroupPermissionRowEditor, GroupPermissionTable } from "../editors/group-permission";

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
						<IconTextButton
							text="Kurs hinzufügen"
							icon={<PlusIcon className="icon w-5" />}
							onClick={() => setSearchCourseActive(true)}
						/>
						<IconTextButton
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
			</GroupPermissionTable>
			{error && <span className="px-4 text-xs text-red-500">{error}</span>}
		</CenteredSection>
	);
}
