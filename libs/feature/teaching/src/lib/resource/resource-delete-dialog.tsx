"use client";

import { LinkSlashIcon, TrashIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import {
	getResourceSearchEntryKey,
	ResourceKind,
	resourceLabels,
	ResourceSearchEntry
} from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	IconOnlyButton,
	LoadingBox,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { Course, Specialization, Subject } from "@prisma/client";

function canDelete(
	resource: ResourceSearchEntry
): resource is ResourceSearchEntry & { kind: "course" | "lesson" } {
	return resource.kind === "course" || resource.kind === "lesson";
}
function canUnlink(resource: ResourceSearchEntry, blocker: ResourceSearchEntry): boolean {
	return (
		(resource.kind === "lesson" && blocker.kind === "course") ||
		(resource.kind === "course" && blocker.kind === "specialization" && !!blocker.parentId)
	);
}

function toCourseEntry(course: Course): ResourceSearchEntry {
	return {
		kind: "course",
		id: course.courseId,
		key: getResourceSearchEntryKey({ kind: "course", id: course.courseId }),
		title: course.title,
		slug: course.slug
	};
}
function toSpecializationEntry(spec: Specialization & { subject: Subject }): ResourceSearchEntry {
	return {
		kind: "specialization",
		id: spec.specializationId,
		key: getResourceSearchEntryKey({ kind: "specialization", id: spec.specializationId }),
		title: `${spec.subject.title} / ${spec.title}`,
		slug: spec.slug,
		parentId: spec.subjectId
	};
}

function useDeletionBlockers(step: DeleteFlowStep) {
	const { resource, action } = step;
	const courseQuery = trpc.course.findLinkedEntities.useQuery(
		{ courseId: resource.id },
		{ enabled: resource.kind === "course" && action === "delete" }
	);
	const lessonQuery = trpc.lesson.findLinkedLessonEntities.useQuery(
		{ lessonId: resource.id },
		{ enabled: resource.kind === "lesson" && action === "delete" }
	);
	const blockers = useMemo(() => {
		if (action !== "delete") return [];
		if (resource.kind === "course" && courseQuery.data) {
			return courseQuery.data.map(toSpecializationEntry);
		}
		if (resource.kind === "lesson" && lessonQuery.data) {
			return lessonQuery.data.map(toCourseEntry);
		}
		return [];
	}, [resource.kind, courseQuery.data, lessonQuery.data, action]);
	const isError =
		(resource.kind === "course" && courseQuery.isError) ||
		(resource.kind === "lesson" && lessonQuery.isError);
	const isLoading =
		(resource.kind === "course" && courseQuery.isLoading) ||
		(resource.kind === "lesson" && lessonQuery.isLoading);
	const refetch = async () => {
		if (resource.kind === "course") await courseQuery.refetch();
		if (resource.kind === "lesson") await lessonQuery.refetch();
	};
	return { blockers, isLoading, refetch, isError };
}

function useDeletionActions(step: DeleteFlowStep) {
	const { mutateAsync: deleteCourse, isPending: deletingCourse } =
		trpc.course.deleteCourse.useMutation();
	const { mutateAsync: deleteLesson, isPending: deletingLesson } =
		trpc.lesson.deleteLesson.useMutation();
	const { mutateAsync: removeLesson, isPending: unlinkingLesson } =
		trpc.course.removeLesson.useMutation();
	const { mutateAsync: removeCourse, isPending: unlinkingCourse } =
		trpc.specialization.removeCourse.useMutation();
	return {
		isBusy:
			step.action === "delete"
				? deletingCourse || deletingLesson
				: unlinkingLesson || unlinkingCourse,
		execute: async () => {
			if (step.action === "delete") {
				const { resource } = step;
				if (!canDelete(resource)) throw new Error("invalid delete");
				if (resource.kind === "course") await deleteCourse({ slug: resource.slug });
				else await deleteLesson({ lessonId: resource.id });
			} else if (step.action === "unlink") {
				const { resource, blocker } = step;
				if (!canUnlink(resource, blocker)) throw new Error("invalid unlink");
				if (resource.kind === "lesson") {
					await removeLesson({ courseId: blocker.id, lessonId: resource.id });
				} else {
					await removeCourse({
						subjectId: blocker.parentId as string, // guaranteed by canUnlink
						specializationId: blocker.id,
						courseId: resource.id
					});
				}
			}
		}
	};
}

type DeleteFlowStep =
	| { action: "delete"; resource: ResourceSearchEntry }
	| { action: "unlink"; resource: ResourceSearchEntry; blocker: ResourceSearchEntry };

export function ResourceDeleteStackDialog({
	resource,
	onExit
}: {
	resource: ResourceSearchEntry;
	onExit: () => void;
}) {
	//
	const [steps, setSteps] = useState<DeleteFlowStep[]>([{ action: "delete", resource }]);
	const step = steps[steps.length - 1];
	const goBack = () => (steps.length > 1 ? setSteps(s => s.slice(0, -1)) : onExit());
	const push = (step: DeleteFlowStep) => setSteps(prev => [...prev, step]);

	console.log(step);

	const { t } = useTranslation("pages-dashboard");
	const { blockers, isLoading, isError, refetch } = useDeletionBlockers(step);
	const { execute, isBusy } = useDeletionActions(step);

	const labels = actionLabels(step);

	const doAction = async () => {
		try {
			await execute();
			showToast({
				type: "success",
				title: t(labels.successKey),
				subtitle: ""
			});
			goBack();
			await refetch();
		} catch (error) {
			showToast({
				type: "error",
				title: t(labels.errorKey),
				subtitle: String(error)
			});
		}
	};

	if (isLoading) {
		return (
			<Dialog title={t(labels.titleKey)} onClose={goBack}>
				<LoadingBox />
			</Dialog>
		);
	}

	if (isError) {
		return (
			<Dialog title={t(labels.titleKey)} onClose={goBack}>
				<p>Unexpected error</p>
			</Dialog>
		);
	}

	// will be empty on unlink step
	if (blockers.length > 0) {
		return (
			<Dialog title={t("Delete_Not_Possible")} onClose={goBack}>
				<p className="mb-2">{t(blockedMessageKey(step.resource.kind))}</p>
				<p className="mb-4">{t(blockersIntroKey(step.resource.kind))}</p>
				<DeletionBlockersTable
					blockers={blockers}
					resource={step.resource}
					onDelete={blocker => push({ action: "delete", resource: blocker })}
					onUnlink={blocker =>
						push({ action: "unlink", resource: step.resource, blocker })
					}
				/>
				<DialogActions onClose={goBack} />
			</Dialog>
		);
	}

	const confirmButtonClass =
		step.action === "unlink" ? "btn-primary" : "btn-primary hover:bg-c-danger";

	return (
		<Dialog title={t(labels.titleKey)} onClose={goBack}>
			<p>{t(labels.messageKey)}</p>
			<DialogActions onClose={goBack}>
				<button
					type="button"
					className={confirmButtonClass}
					disabled={isBusy}
					onClick={doAction}
				>
					{t(labels.buttonKey)}
				</button>
			</DialogActions>
		</Dialog>
	);
}

export function ResourceDeleteOption(props: Omit<ResourceSearchEntry, "key">) {
	const { t } = useTranslation("pages-dashboard");
	const [open, setOpen] = useState(false);
	const resource: ResourceSearchEntry = {
		...props,
		key: getResourceSearchEntryKey(props)
	};
	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				title={t("Delete")}
				onClick={() => setOpen(true)}
			/>
			{open && (
				<ResourceDeleteStackDialog resource={resource} onExit={() => setOpen(false)} />
			)}
		</>
	);
}

function DeletionBlockersTable({
	blockers,
	resource,
	onDelete,
	onUnlink
}: {
	blockers: ResourceSearchEntry[];
	resource: ResourceSearchEntry;
	onDelete: (blocker: ResourceSearchEntry) => void;
	onUnlink: (blocker: ResourceSearchEntry) => void;
}) {
	const { t } = useTranslation("pages-dashboard");
	return (
		<Table
			head={
				<>
					<TableHeaderColumn>{t("Resource")}</TableHeaderColumn>
					<TableHeaderColumn>{t("Title")}</TableHeaderColumn>
					<TableHeaderColumn>{t("Actions")}</TableHeaderColumn>
				</>
			}
		>
			{blockers.map(blocker => (
				<tr key={blocker.key}>
					<TableDataColumn>
						<span className="text-light">{resourceLabels[blocker.kind]}</span>
					</TableDataColumn>
					<TableDataColumn>
						<span className="text-light">{blocker.title}</span>
					</TableDataColumn>
					<TableDataColumn className="flex gap-2 p-2">
						{canUnlink(resource, blocker) && (
							<IconOnlyButton
								icon={<LinkSlashIcon className="h-5 w-5" />}
								className="btn-stroked"
								title={t("Unlink")}
								onClick={() => onUnlink(blocker)}
							/>
						)}
						{canDelete(blocker) && (
							<IconOnlyButton
								icon={<TrashIcon className="h-5 w-5" />}
								className="btn-stroked hover:bg-c-danger"
								title={t("Delete")}
								onClick={() => onDelete(blocker)}
							/>
						)}
					</TableDataColumn>
				</tr>
			))}
		</Table>
	);
}

// translations
function blockedMessageKey(kind: ResourceKind): string {
	switch (kind) {
		case "course":
			return "Course_Cannot_Be_Deleted";
		case "lesson":
			return "Lesson_Cannot_Be_Deleted";
		default:
			return "Course_Cannot_Be_Deleted";
	}
}
function blockersIntroKey(kind: ResourceKind): string {
	switch (kind) {
		case "course":
			return "Used_In_Specializations";
		case "lesson":
			return "Used_In_Courses";
		default:
			return "Used_In_Specializations";
	}
}
function confirmDeleteKey(kind: ResourceKind): string {
	switch (kind) {
		case "course":
			return "Confirm_Delete_Course";
		case "lesson":
			return "Confirm_Delete_Lesson";
		default:
			return "Confirm_Delete_Course";
	}
}
function confirmUnlinkKey(resource: ResourceSearchEntry, blocker: ResourceSearchEntry): string {
	if (resource.kind === "lesson" && blocker.kind === "course") {
		return "Confirm_Unlink_Lesson_From_Course";
	}
	return "Confirm_Unlink_Course_From_Specialization";
}

function actionLabels(step: DeleteFlowStep) {
	if (step.action === "unlink") {
		return {
			titleKey: "Unlink",
			messageKey: confirmUnlinkKey(step.resource, step.blocker),
			buttonKey: "Unlink",
			successKey: "Unlink_Success",
			errorKey: "Unlink_Error"
		};
	}
	return {
		titleKey: "Delete",
		messageKey: confirmDeleteKey(step.resource.kind),
		buttonKey: "Delete",
		successKey: "Delete_Success",
		errorKey: "Delete_Error"
	};
}
