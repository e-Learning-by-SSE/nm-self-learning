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
	TableHeaderColumn
} from "@self-learning/ui/common";
import { useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { AccessLevel, Course, Specialization, Subject } from "@prisma/client";
import { ResourceGuard, testResourceGuard, useRequiredSession } from "@self-learning/ui/layouts";

type Permissions = { permissions?: ResourcePermissions };
export type ResourceDeleteEntry = ResourceSearchEntry & Permissions;

/**
 * Defines whether delete is available for a certain resource.
 * If you change it, change also @see useDeletionBlockers
 * @param resource
 * @returns
 */
function isDeleteAvailable(
	resource: ResourceDeleteEntry
): resource is ResourceDeleteEntry & { kind: "course" | "lesson" } {
	return resource.kind === "course" || resource.kind === "lesson";
}
/**
 * Defines whether delete is available for a pair of resources.
 * If you change it, change also @see useDeletionBlockers
 * @param resource - what user wants to delete
 * @param blocker - what user wants to unlink from the resource
 * @returns
 */
function isUnlinkAvailable(resource: ResourceDeleteEntry, blocker: ResourceDeleteEntry): boolean {
	return (
		(resource.kind === "lesson" && blocker.kind === "course") ||
		(resource.kind === "course" && blocker.kind === "specialization" && !!blocker.parentId)
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
				if (!isDeleteAvailable(resource)) throw new Error("invalid delete");
				if (resource.kind === "course") await deleteCourse({ slug: resource.slug });
				else await deleteLesson({ lessonId: resource.id });
			} else if (step.action === "unlink") {
				const { resource, blocker } = step;
				if (!isUnlinkAvailable(resource, blocker)) throw new Error("invalid unlink");
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
				<p className="mb-2">{t(blockedMessageKey(step.resource.kind))}</p>
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
