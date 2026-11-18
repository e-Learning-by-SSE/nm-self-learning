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
import { normalizeFormResourceAccess, stripFormResourceAccess } from "@self-learning/types";
import { useTranslation } from "next-i18next";
import { resourceKindTranslationKey } from "../resource-i18n";

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
	const { t } = useTranslation("feature-teaching");
	const { t: t_common } = useTranslation("common");
	const q = stripFormResourceAccess(permission);
	const query = trpc.permission.getEffectiveResourceAccesses.useQuery(q, {
		enabled: isOpen
	});
	const [revokeCandidate, setRevokeCandidate] = useState<EffectiveAccessType | undefined>(
		undefined
	);
	async function onRevokePermission(isRevoke?: boolean) {
		if (isRevoke && revokeCandidate) {
			try {
				await revokePermission({
					permissionId: revokeCandidate.permissionId
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
				title: t("Group_Permission_Removed"),
				subtitle: t("Group_Permission_Removed_Message", {
					group: revokeCandidate?.group.name ?? ""
				})
			});
		},
		onError: () => {
			showToast({
				type: "error",
				title: t("Group_Permission_Remove_Error"),
				subtitle: t("Group_Permission_Remove_Error_Message", {
					group: revokeCandidate?.group.name ?? ""
				})
			});
		}
	});
	const perm = normalizeFormResourceAccess(permission);

	return (
		<Dialog title={t("Effective_Permissions_Title")} onClose={onClose}>
			<div className="flex flex-col gap-4 overflow-auto">
				<p>
					{t("Users_With_Access_To", {
						resourceType: t_common(resourceKindTranslationKey(perm.kind)),
						title: perm.title
					})}
				</p>
				{query.isLoading && <LoadingBox />}
				{query.data?.length === 0 && <p>{t("No_Users_Found")}</p>}
				{query.data?.map(entry => (
					<Chip key={entry.user.id} displayImage={true} imgUrl={entry.user.image}>
						<div className="flex gap-1 justify-between">
							{t("User_Access_Through_Group", {
								name: entry.user.name,
								accessLevel: t_common(`Access_${entry.accessLevel}`),
								group: entry.group.name
							})}
							<IconOnlyButton
								icon={<TrashIcon className="h-4 w-4" />}
								className="btn-x-mark"
								title={t("Remove_Permission")}
								onClick={() => setRevokeCandidate(entry)}
							/>
						</div>
					</Chip>
				))}
				{query.error && (
					<span className="text-red-500">{t("Insufficient_Permissions_To_View")}</span>
				)}
				<DialogActions onClose={onClose} abortLabel={t("OK_Action")} />
			</div>
			{revokeCandidate && (
				<Dialog title={t("Remove_Permission_Confirm_Title")} onClose={onRevokePermission}>
					<div className="flex flex-col gap-2 overflow-auto">
						<span>
							{t("Remove_Permission_Confirm_Message", {
								resourceType: t_common(resourceKindTranslationKey(perm.kind)),
								title: perm.title
							})}
						</span>
						<span className="text-red-500">
							{t("Remove_Permission_Impact_Message", {
								group: revokeCandidate.group.name,
								resourceType: t_common(resourceKindTranslationKey(perm.kind)),
								title: perm.title
							})}
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
								{t("Delete_Action")}
							</button>
						</DialogActions>
					</div>
				</Dialog>
			)}
		</Dialog>
	);
}
