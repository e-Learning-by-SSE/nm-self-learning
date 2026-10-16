import { CourseChapter } from "@self-learning/types";
import { Alert, SectionHeader } from "@self-learning/ui/common";
import { useCourseContentForm } from "../course/course-content-editor/use-content-form";
import { useState } from "react";
import { onLessonCreatorSubmit } from "../lesson/lesson-editor";
import {
	LessonSelector,
	LessonSummary
} from "../course/course-content-editor/dialogs/lesson-selector";
import { trpc } from "@self-learning/api-client";
import { LessonFormModel } from "../lesson/lesson-form-model";
import { LinkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { LessonEditorDialogWithGuard } from "../course/course-content-editor/dialogs/lesson-editor-dialog";
import { LessonNode } from "../course/course-content-editor/course-content-form";
import { useFormContext, useWatch } from "react-hook-form";
import { CourseFormModel } from "../course/course-form-model";
import { useTranslation } from "next-i18next";

type UseCourseContentForm = ReturnType<typeof useCourseContentForm>;

export function DynCourseContentForm() {
	const { t } = useTranslation("feature-teaching");
	const { content, moveLesson, addLesson, removeLesson } = useCourseContentForm([
		{ title: "", content: [] }
	]);
	const form = useFormContext<CourseFormModel>();
	const courseId = useWatch({ control: form.control, name: "courseId" });

	const onRemoveLesson: UseCourseContentForm["removeLesson"] = (
		chapterIndex,
		lessonId: string
	) => {
		const confirmed = window.confirm(t("Course_Content_Remove_Lesson_Confirm"));

		if (confirmed) {
			removeLesson(chapterIndex, lessonId);
		}
	};

	if (!courseId) {
		console.error("CoursePreview used for course without valid courseId");
		return (
			<Alert type={{ severity: "ERROR", message: t("Course_Preview_Course_Not_Found") }} />
		);
	}

	return (
		<section>
			<SectionHeader
				title={t("Course_Content_Title")}
				subtitle={t("Course_Content_Section_Subtitle")}
			/>
			<div className="mb-4" />

			<div>
				<SingleChapterNode
					chapter={content[0]}
					courseId={courseId}
					onLessonAdded={addLesson}
					moveLesson={moveLesson}
					removeLesson={onRemoveLesson}
				/>
			</div>
		</section>
	);
}

// TODO mostly copypaste from course-content-form.tsx
function SingleChapterNode({
	chapter,
	courseId,
	onLessonAdded,
	moveLesson,
	removeLesson
}: {
	chapter: CourseChapter;
	courseId: string;
	onLessonAdded: UseCourseContentForm["addLesson"];
	moveLesson: UseCourseContentForm["moveLesson"];
	removeLesson: UseCourseContentForm["removeLesson"];
}) {
	const { t } = useTranslation("feature-teaching");
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();
	const [lessonSelectorOpen, setLessonSelectorOpen] = useState(false);
	const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);

	// guaranteed to be in a form context because this component is only used inside CourseContentForm
	const { control } = useFormContext<CourseFormModel>();
	const coursePermissions = useWatch({ control, name: "permissions" }) ?? [];
	function onCloseLessonSelector(lesson?: LessonSummary) {
		setLessonSelectorOpen(false);

		if (lesson) {
			onLessonAdded(0, lesson);
		}
	}

	async function handleCreateDialogClose(lesson?: LessonFormModel) {
		const createdLesson = await onLessonCreatorSubmit(
			t,
			() => {
				setCreateLessonDialogOpen(false);
			},
			createLessonAsync,
			lesson
		);

		if (createdLesson) {
			onLessonAdded(0, createdLesson);
		}
	}

	return (
		<li className="flex flex-col gap-2 rounded-lg bg-c-surface-2 p-4">
			{chapter.description && chapter.description.length > 0 && (
				<p className="pb-4 text-sm text-c-text-muted">
					{t(chapter.description, { ns: "kee" })}
				</p>
			)}

			<ul className="flex flex-col gap-1">
				{chapter.content.map(lesson => (
					<LessonNode
						key={lesson.lessonId}
						courseId={courseId}
						lesson={lesson}
						moveLesson={moveLesson}
						onRemove={() => removeLesson(0, lesson.lessonId)}
					/>
				))}
			</ul>

			<div className="flex gap-3 justify-center pt-4">
				<button
					type="button"
					className="btn-stroked"
					onClick={() => setCreateLessonDialogOpen(true)}
				>
					<PlusIcon className="icon" />
					<span>{t("Create_Lesson")}</span>
				</button>
				<button
					type="button"
					className="btn-stroked"
					onClick={() => setLessonSelectorOpen(true)}
				>
					<LinkIcon className="icon" />
					<span>{t("Course_Content_Link_Lesson")}</span>
				</button>
			</div>

			{lessonSelectorOpen && (
				<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
			)}
			{createLessonDialogOpen && (
				<LessonEditorDialogWithGuard
					courseId={courseId}
					onClose={handleCreateDialogClose}
					inheritedPermissions={coursePermissions}
				/>
			)}
		</li>
	);
}
