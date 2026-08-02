"use client";

import { LinkSlashIcon, TrashIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import {
	getResourceSearchEntryKey,
	ResourceKind,
	resourceLabels,
	ResourcePermissions,
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
	TableHeaderColumn,
	Trans
} from "@self-learning/ui/common";
import { useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { AccessLevel, Course, Specialization, Subject } from "@prisma/client";
import { ResourceGuard, testResourceGuard, useRequiredSession } from "@self-learning/ui/layouts";

type Permissions = { permissions?: ResourcePermissions };
export type ResourceDeleteEntry = ResourceSearchEntry & Permissions;

const DEFAULT_DIALOG_STYLE_SIZE = {
	minWidth: 420,
	maxHeight: "80vh",
	maxWidth: "32rem"
};

/**
 * Defines whether delete is available for a certain resource.
 * If you change it, change also @see useDeletionBlockers and @see useDeletionActions (and translation keys!)
 * @param resource
 * @returns
 */
function isDeleteAvailable(
	resource: ResourceDeleteEntry
): resource is ResourceDeleteEntry & { kind: "course" | "lesson" | "specialization" } {
	return resource.kind === "course" || resource.kind === "lesson";
}
/**
 * Defines whether delete is available for a pair of resources.
 * If you change it, change also @see useDeletionBlockers and @see useDeletionActions (and translation keys!)
 * @param resource - what user wants to delete
 * @param blocker - what user wants to unlink from the resource
 * @returns
 */
function isUnlinkAvailable(resource: ResourceDeleteEntry, blocker: ResourceDeleteEntry): boolean {
	return (
		(resource.kind === "lesson" && blocker.kind === "course") ||
		(resource.kind === "course" && blocker.kind === "specialization" && !!blocker.parentId) ||
		(resource.kind === "course" && blocker.kind === "subject")
	);
}

function toCourseEntry(course: Course & Permissions): ResourceDeleteEntry {
	return {
		kind: "course",
		id: course.courseId,
		key: getResourceSearchEntryKey({ kind: "course", id: course.courseId }),
		title: course.title,
		slug: course.slug,
		permissions: course.permissions
	};
}
function toSpecializationEntry(
	spec: Specialization & Permissions & { subject: Subject }
): ResourceDeleteEntry {
	return {
		kind: "specialization",
		id: spec.specializationId,
		key: getResourceSearchEntryKey({ kind: "specialization", id: spec.specializationId }),
		title: `${spec.subject.title} / ${spec.title}`,
		slug: spec.slug,
		parentId: spec.subjectId,
		permissions: spec.permissions
	};
}
function toSubjectEntry(subject: Subject & Permissions): ResourceDeleteEntry {
	return {
		kind: "subject",
		id: subject.subjectId,
		key: getResourceSearchEntryKey({ kind: "subject", id: subject.subjectId }),
		title: subject.title,
		slug: subject.slug,
		permissions: subject.permissions
	};
}

function useDeletionBlockers(step: DeleteFlowStep) {
	const { resource, action } = step;
	// do not forget to invalidate blockers in @see invalidate()
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
			const { subject, specializations } = courseQuery.data;
			return [
				...(subject ? [toSubjectEntry(subject)] : []),
				...specializations.map(toSpecializationEntry)
			];
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
	return { blockers, isLoading, isError };
}

/**
 * Joint resolver for resource deletion
 * TODO would be nice just to have single resource management entries in the backend
 * @param step - current deletion step with action and resources in question
 * @returns
 */
function useDeletionActions(step: DeleteFlowStep) {
	// Add required mutations here
	const { mutateAsync: deleteCourse, isPending: deletingCourse } =
		trpc.course.deleteCourse.useMutation();
	const { mutateAsync: deleteLesson, isPending: deletingLesson } =
		trpc.lesson.deleteLesson.useMutation();
	const { mutateAsync: unlinkLesson, isPending: unlinkingLesson } =
		trpc.course.removeLesson.useMutation();
	const { mutateAsync: unlinkSpecializationCourse, isPending: unlinkingSpecializationCourse } =
		trpc.specialization.removeCourse.useMutation();
	const { mutateAsync: unlinkSubjectCourse, isPending: unlinkingSubjectCourse } =
		trpc.subject.removeCourse.useMutation();
	const { mutateAsync: deleteSpecialization, isPending: deletingSpecialization } =
		trpc.specialization.deleteSpecialization.useMutation();
	const { mutateAsync: deleteSubject, isPending: deletingSubject } =
		trpc.subject.deleteSubject.useMutation();
	return {
		// add required pending status here
		isBusy:
			step.action === "delete"
				? deletingCourse || deletingLesson || deletingSpecialization || deletingSubject
				: unlinkingLesson || unlinkingSpecializationCourse || unlinkingSubjectCourse,
		execute: async () => {
			// call mutation here
			if (step.action === "delete") {
				const { resource } = step;
				if (!isDeleteAvailable(resource)) throw new Error(`cannot delete ${resource.kind}`);
				if (resource.kind === "course") {
					await deleteCourse({ slug: resource.slug });
				} else if (resource.kind === "lesson") {
					await deleteLesson({ lessonId: resource.id });
				} else if (resource.kind === "specialization") {
					await deleteSpecialization({ specializationId: resource.id });
				} else if (resource.kind === "subject") {
					await deleteSubject({ subjectId: resource.id });
				} else {
					throw new Error(`cannot delete ${resource.kind}`);
				}
			} else if (step.action === "unlink") {
				const { resource, blocker } = step;
				if (!isUnlinkAvailable(resource, blocker))
					throw new Error(`cannot unlink ${resource.kind}`);
				if (resource.kind === "lesson") {
					await unlinkLesson({ courseId: blocker.id, lessonId: resource.id });
				} else if (resource.kind === "course" && blocker.kind === "specialization") {
					await unlinkSpecializationCourse({
						subjectId: blocker.parentId as string, // guaranteed by canUnlink
						specializationId: blocker.id,
						courseId: resource.id
					});
				} else if (resource.kind === "course" && blocker.kind === "subject") {
					await unlinkSubjectCourse({
						subjectId: blocker.id,
						courseId: resource.id
					});
				} else {
					throw new Error(`cannot unlink ${resource.kind}`);
				}
			}
		}
	};
}

type DeleteFlowStep =
	| { action: "delete"; resource: ResourceDeleteEntry }
	| { action: "unlink"; resource: ResourceDeleteEntry; blocker: ResourceDeleteEntry };

/**
 * recursive delete dialog which holds stack of resource delete request resolution
 * It will gather all dependencies and present options for their resolution
 * @param resource - @see ResourceDeleteEntry
 * @returns
 */
export function ResourceDeleteStackDialog({
	resource,
	onExit
}: {
	resource: ResourceDeleteEntry;
	onExit: () => void;
}) {
	const utils = trpc.useUtils();

	// action stack
	const [steps, setSteps] = useState<DeleteFlowStep[]>([{ action: "delete", resource }]);
	const step = steps[steps.length - 1];
	const goBack = () => (steps.length > 1 ? setSteps(s => s.slice(0, -1)) : onExit());
	const push = (step: DeleteFlowStep) => setSteps(prev => [...prev, step]);
	const invalidate = async () => {
		// invalidate previous step to refresh the list of dependencies
		const previousStep = steps[steps.length - 2];
		if (!previousStep) return;
		if (previousStep.resource.kind === "course") {
			await utils.course.findLinkedEntities.invalidate({
				courseId: previousStep.resource.id
			});
		}
		if (previousStep.resource.kind === "lesson") {
			await utils.lesson.findLinkedLessonEntities.invalidate({
				lessonId: previousStep.resource.id
			});
		}
	};

	const { t } = useTranslation("pages-dashboard");
	const { blockers, isLoading, isError } = useDeletionBlockers(step);
	const { execute, isBusy } = useDeletionActions(step);

	const labels = actionLabels(step);

	const doAction = async () => {
		try {
			await execute();
			await invalidate();
			showToast({
				type: "success",
				title: t(labels.successKey),
				subtitle: ""
			});
			goBack();
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

	// force user to resolve all dependencies first
	// blockers will be empty on unlink step
	if (blockers.length > 0) {
		return (
			<Dialog title={t("Delete_Not_Possible")} onClose={goBack}>
				<p className="mb-2">
					<Trans
						namespace="pages-dashboard"
						i18nKey={t(blockedMessageKey(step.resource.kind))}
						values={{ name: step.resource.title }}
						components={{ strong: <strong className="font-semibold" /> }}
					/>
				</p>
				<p className="mb-4">{t("Used_In_Resources")}</p>
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
		<Dialog title={t(labels.titleKey)} onClose={goBack} style={DEFAULT_DIALOG_STYLE_SIZE}>
			<span>
				<Trans
					namespace="pages-dashboard"
					i18nKey={labels.messageKey}
					values={labels.trData}
					components={{ strong: <strong className="font-semibold" /> }}
				/>
			</span>
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

/**
 * ResourceDeleteOption - red trash icon button which opens deletion dialog
 * @param props - most of the props are just resource info, where id, slug & key are important.
 * If you specify permissions - it will hide the button when user has insufficient access [ full(resource) ]
 * @returns
 */
export function ResourceDeleteOption(props: Omit<ResourceDeleteEntry, "key">) {
	const { t } = useTranslation("pages-dashboard");
	const [open, setOpen] = useState(false);
	const resource: ResourceDeleteEntry = {
		...props,
		key: getResourceSearchEntryKey(props)
	};
	return (
		<ResourceGuard
			requiredAccess={AccessLevel.FULL}
			permittedGroups={props.permissions}
			fallback="hidden"
		>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				title={t("Delete")}
				onClick={() => setOpen(true)}
			/>
			{open && (
				<ResourceDeleteStackDialog resource={resource} onExit={() => setOpen(false)} />
			)}
		</ResourceGuard>
	);
}

/**
 * table display of resources
 * guards delete and unlink actions
 * @param param0
 * @returns
 */
function DeletionBlockersTable({
	blockers,
	resource,
	onDelete,
	onUnlink
}: {
	blockers: ResourceDeleteEntry[];
	resource: ResourceDeleteEntry;
	onDelete: (blocker: ResourceDeleteEntry) => void;
	onUnlink: (blocker: ResourceDeleteEntry) => void;
}) {
	const { t } = useTranslation("pages-dashboard");
	const session = useRequiredSession();
	const user = session.data?.user;

	// Must have full(blocker)
	const canDelete = (blocker: ResourceDeleteEntry) =>
		user &&
		isDeleteAvailable(blocker) &&
		testResourceGuard(user, AccessLevel.FULL, blocker.permissions);

	// TODO unlink rules are inconsistent! (check at least edit access for blocker)
	const canUnlink = (blocker: ResourceDeleteEntry) =>
		user &&
		isUnlinkAvailable(resource, blocker) &&
		testResourceGuard(user, AccessLevel.EDIT, blocker.permissions);

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
						{canUnlink(blocker) && (
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
		case "specialization":
			return "Specialization_Cannot_Be_Deleted";
		case "subject":
			return "Subject_Cannot_Be_Deleted";
		default:
			return "Course_Cannot_Be_Deleted";
	}
}
function confirmDeleteKey(kind: ResourceKind): string {
	switch (kind) {
		case "course":
			return "Confirm_Delete_Course";
		case "lesson":
			return "Confirm_Delete_Lesson";
		case "specialization":
			return "Confirm_Delete_Specialization";
		case "subject":
			return "Confirm_Delete_Subject";
		default:
			return "Confirm_Delete_Course";
	}
}
function confirmUnlinkKey(resource: ResourceDeleteEntry, blocker: ResourceDeleteEntry): string {
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
			trData: { name: step.resource.title, blocker: step.blocker.title },
			buttonKey: "Unlink",
			successKey: "Unlink_Success",
			errorKey: "Unlink_Error"
		};
	}
	return {
		titleKey: "Delete",
		messageKey: confirmDeleteKey(step.resource.kind),
		trData: { name: step.resource.title },
		buttonKey: "Delete",
		successKey: "Delete_Success",
		errorKey: "Delete_Error"
	};
}
