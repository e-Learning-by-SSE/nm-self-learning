import { trpc } from "@self-learning/api-client";
import { AppRouter } from "@self-learning/api";
import { inferProcedureOutput } from "@trpc/server";
import { PermissionFormModel } from "../editors/group-permission";
import { useState } from "react";
import {
	Chip,
	Dialog,
	DialogActions,
	IconOnlyButton,
	LoadingBox,
	showToast
} from "@self-learning/ui/common";
import { TrashIcon } from "@heroicons/react/24/solid";

type EffectiveAccessType = inferProcedureOutput<
	AppRouter["permission"]["getEffectiveResourceAccesses"]
>[number];

/**
 * GroupPermissionRelationsDialog - Modal showing all users with access to a resource via group permissions.
 *
 * Usage: Use to review who can access a permission-protected resource.
 * Displays a dialog listing effective permissions (users who can access a course/lesson).
 * Shows each user's access level and the group granting that access. Allows revoking group permissions,
 * which removes all group members' access to that resource.
 *
 * UI: List of users with chips showing access level and group, trash icon to revoke; confirmation dialog
 * Related: GroupPermissionRow, PermissionFormModel, Dialog
 *
 * @param permission - The course or lesson permission object being reviewed
 * @param isOpen - Controls dialog visibility
 * @param onClose - Callback when dialog is dismissed
 */
export function GroupPermissionRelationsDialog({
	permission,
	isOpen,
	onClose
}: {
	permission: PermissionFormModel;
	isOpen: boolean;
	onClose: () => void;
}) {
	const q = permission.course
		? { courseId: permission.course.courseId }
		: { lessonId: permission.lesson?.lessonId };
	const query = trpc.permission.getEffectiveResourceAccesses.useQuery(
		{ ...q },
		{
			enabled: isOpen
		}
	);
	const [revokeCandidate, setRevokeCandidate] = useState<EffectiveAccessType | undefined>(
		undefined
	);
	async function onRevokePermission(isRevoke?: boolean) {
		if (isRevoke && revokeCandidate) {
			try {
				await revokePermission({
					permissionId: revokeCandidate.id
				});
			} catch (error) {
				console.log(error);
			}
		}
		setRevokeCandidate(undefined);
	}
	const { mutateAsync: revokePermission } = trpc.permission.revokeGroupPermission.useMutation({
		onSuccess: () => {
			showToast({
				type: "success",
				title: "Berechtigung entfernt",
				subtitle: `Die Gruppenberechtigung für „${revokeCandidate?.group.name}“ wurde erfolgreich entfernt.`
			});
		},
		onError: () => {
			showToast({
				type: "error",
				title: "Fehler beim Entfernen",
				subtitle: `Die Berechtigung der Gruppe „${revokeCandidate?.group.name}“ konnte nicht entfernt werden.`
			});
		}
	});
	const title = permission.course
		? `Kurs ${permission.course.title}`
		: `Lerneinheit ${permission.lesson?.title}`;

	return (
		<Dialog title={"Effektive Berechtigungen"} onClose={onClose}>
			<div className="flex flex-col gap-4 overflow-auto">
				<p>
					Folgende Benutzer haben Zugriff auf{" "}
				<span className="font-semibold">&quot;{title}&quot;</span>:
			</p>
			{query.isLoading && <LoadingBox />}
			{query.data?.length === 0 && <p>Keine Benutzer gefunden</p>}
			{query.data?.map(entry => (
				<Chip key={entry.user.id} displayImage={true} imgUrl={entry.user.image}>
					<div className="flex gap-1 justify-between">
						{entry.user.name} ({entry.accessLevel} über {entry.group.name})
						<IconOnlyButton
							icon={<TrashIcon className="h-4 w-4" />}
							className="btn-x-mark"
							onClick={() => setRevokeCandidate(entry)}
						/>
					</div>
				</Chip>
			))}
			<DialogActions onClose={onClose} abortLabel="OK" />
		</div>
		{revokeCandidate && (
			<Dialog title={"Berechtigung entfernen?"} onClose={onRevokePermission}>
				<div className="flex flex-col gap-2 overflow-auto">
					<span>
						Möchten Sie die Berechtigung für{" "}
						<span className="font-semibold">&quot;{title}&quot;</span> wirklich entfernen?
					</span>
					<span className="text-red-500">
						Hinweis: Alle Benutzer der Gruppe{" "}
						<span className="font-semibold">{revokeCandidate.group.name}</span>{" "}
						verlieren ihren Zugriff für{" "}
						<span className="font-semibold">&quot;{title}&quot;</span>:
						</span>
						{revokeCandidate.group.members.map(m => (
							<Chip key={m.id} displayImage={true} imgUrl={m.image}>
								<div className="flex gap-1 justify-between">{m.name}</div>
							</Chip>
						))}
						<DialogActions onClose={onRevokePermission}>
							<button
								className="btn-primary hover:bg-c-danger"
								onClick={() => onRevokePermission(true)}
							>
								Löschen
							</button>
						</DialogActions>
					</div>
				</Dialog>
			)}
		</Dialog>
	);
}
