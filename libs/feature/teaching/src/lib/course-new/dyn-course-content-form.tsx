import { CourseChapter, extractLessonIds } from "@self-learning/types";
import { Alert, SectionHeader, showToast } from "@self-learning/ui/common";
import { useCourseContentForm } from "../course/course-content-editor/use-content-form";
import { useState } from "react";
import { onLessonCreatorSubmit } from "../lesson/lesson-editor";
import {
	LessonSelector,
	LessonSummary
} from "../course/course-content-editor/dialogs/lesson-selector";
import { trpc } from "@self-learning/api-client";
import { LessonFormModel } from "../lesson/lesson-form-model";
import { ArrowDownTrayIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { LessonEditorDialogWithGuard } from "../course/course-content-editor/dialogs/lesson-editor-dialog";
import { LessonNode } from "../course/course-content-editor/course-content-form";
import { useFormContext, useWatch } from "react-hook-form";
import { CourseFormModel } from "../course/course-form-model";
import { useTranslation } from "react-i18next";

type UseCourseContentForm = ReturnType<typeof useCourseContentForm>;

export function DynCourseContentForm() {
	const { content, moveLesson, addLesson, removeLesson } = useCourseContentForm([
		{ title: "", content: [] }
	]);
	const form = useFormContext<CourseFormModel>();
	const courseId = useWatch({ control: form.control, name: "courseId" });

	const onRemoveLesson: UseCourseContentForm["removeLesson"] = (
		chapterIndex,
		lessonId: string
	) => {
		const confirmed = window.confirm(
			"Lerneinheit wirklich entfernen? Hinweis: Die Lerneinheit wird nur aus dem Kapitel entfernt und nicht gelöscht."
		);

		if (confirmed) {
			removeLesson(chapterIndex, lessonId);
		}
	};

	if (!courseId) {
		console.error("CoursePreview used for course without valid courseId");
		return <Alert type={{ severity: "ERROR", message: "This course could not be found." }} />;
	}

	return (
		<section>
			<SectionHeader title="Inhalt" subtitle="Der Inhalt des Kurses." />
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
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();
	const { t } = useTranslation("feature-teaching");
	const [lessonSelectorOpen, setLessonSelectorOpen] = useState(false);
	const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);

	// guaranteed to be in a form context because this component is only used inside CourseContentForm
	const { control } = useFormContext<CourseFormModel>();
	const coursePermissions = useWatch({ control, name: "permissions" }) ?? [];
	const slug = useWatch({ control, name: "slug" });

	// Stored default path, loaded on demand by the "add missing lessons" button
	const defaultPath = trpc.course.getDefaultPathPreview.useQuery({ slug }, { enabled: false });

	// Adds lessons of the stored default path which are not in the content yet
	async function onAddMissingLessons() {
		const { data } = await defaultPath.refetch();
		if (!data) return; // handle error case

		const linked = new Set(chapter.content.map(lesson => lesson.lessonId));
		const missing = extractLessonIds(data.content).filter(lessonId => !linked.has(lessonId));
		missing.forEach(lessonId => onLessonAdded(0, { lessonId }));

		showToast({
			type: missing.length > 0 ? "success" : "info",
			title: t("Course_Content_Add_Missing"),
			subtitle:
				missing.length > 0
					? t("Course_Content_Add_Missing_Done", { count: missing.length })
					: t("Course_Content_Add_Missing_None")
		});
	}

	function onCloseLessonSelector(lesson?: LessonSummary) {
		setLessonSelectorOpen(false);

		if (lesson) {
			onLessonAdded(0, lesson);
		}
	}

	async function handleCreateDialogClose(lesson?: LessonFormModel) {
		const createdLesson = await onLessonCreatorSubmit(
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
					<span>Lerneinheit erstellen</span>
				</button>
				<button
					type="button"
					className="btn-stroked"
					onClick={() => setLessonSelectorOpen(true)}
				>
					<LinkIcon className="icon" />
					<span>Lerneinheit verknüpfen</span>
				</button>
				<button
					type="button"
					className="btn-stroked"
					disabled={defaultPath.isFetching}
					onClick={onAddMissingLessons}
				>
					<ArrowDownTrayIcon className="icon" />
					<span>{t("Course_Content_Add_Missing")}</span>
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
