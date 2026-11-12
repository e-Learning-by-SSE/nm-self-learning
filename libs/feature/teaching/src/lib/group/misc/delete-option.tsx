import { TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Dialog, DialogActions, IconOnlyButton, showToast } from "@self-learning/ui/common";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "libs/data-access/api/src/lib/trpc/app.router";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AccessLevel } from "@self-learning/database";
import { normalizeFormResourceAccess } from "@self-learning/types";
import { useTranslation } from "next-i18next";
import { resourceKindTranslationKey } from "../resource-i18n";

type SingleOwnedResources = inferProcedureOutput<
	AppRouter["permission"]["getSingleOwnedResources"]
>;

export function GroupDeleteOption({
	group
}: {
	group: { id: number; name: string; children: { id: number; name: string }[] };
}) {
	const { t } = useTranslation("feature-teaching");
	const router = useRouter();
	const query = trpc.permission.getSingleOwnedResources.useQuery(
		{ groupId: group.id },
		{
			enabled: false
		}
	);
	const { mutateAsync: deleteGroup } = trpc.permission.deleteGroup.useMutation({
		onSuccess: () => {
			showToast({
				type: "success",
				title: t("Group_Deleted"),
				subtitle: t("Group_Deleted_Message", { group: group.name })
			});
			router.back();
		},
		onError: () => {
			showToast({
				type: "error",
				title: t("Group_Delete_Error_Title"),
				subtitle: t("Group_Delete_Error_Message", { group: group.name })
			});
		}
	});
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteGroup({ groupId: group.id });
	};

	async function onClose(isDelete?: boolean) {
		if (isDelete) {
			await handleDelete();
		}
		setShowConfirmation(false);
	}

	async function handleClick() {
		const { data } = await query.refetch();
		if (!data) return; // handle error / empty case
		setShowConfirmation(true);
	}

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				title={t("Delete_Group")}
				onClick={handleClick}
			/>
			{showConfirmation && (
				<GroupDeleteDialog onClose={onClose} group={group} data={query.data} />
			)}
		</>
	);
}

function GroupDeleteDialog({
	group,
	data,
	onClose
}: {
	group: { id: number; name: string; children: { id: number; name: string }[] };
	data: SingleOwnedResources | undefined;
	onClose: (isDelete?: boolean) => void;
}) {
	const { t } = useTranslation("feature-teaching");
	const { t: t_common } = useTranslation("common");
	if (group.children && group.children.length > 0) {
		return (
			<Dialog title={t("Delete_Not_Possible_Title")} onClose={onClose}>
				{t("Group_Is_Parent_Of_These_Groups")}
				{group.children.map(child => (
					<Link
						key={child.id}
						href={`/groups/${child.id}`}
						className="hover:text-c-primary"
					>
						{child.name}
					</Link>
				))}
				<DialogActions onClose={onClose} />
			</Dialog>
		);
	}
	if (data && data.length > 0) {
		return (
			<Dialog title={t("Delete_Not_Possible_Title")} onClose={onClose}>
				<div className="overflow-auto">
					<p className="mb-4">{t("Group_Has_Exclusive_Access_To_Resources")}</p>

					<div className="flex flex-col gap-2">
						{data?.map((resource, idx) => {
							const p = normalizeFormResourceAccess({
								...resource,
								accessLevel: AccessLevel.VIEW
							});
							return (
								<div
									key={idx}
									className="flex flex-col gap-1 p-2 border rounded bg-gray-50"
								>
									{resource.lesson && (
										<div className="flex items-center gap-2">
											<span className="font-semibold">
												{t_common(resourceKindTranslationKey(p.kind))}
											</span>
											<Link
												href={`/teaching/lessons/edit/${resource.lesson.lessonId}`}
												className="text-c-primary hover:underline"
											>
												{p.title}
											</Link>
										</div>
									)}
									{resource.course && (
										<div className="flex items-center gap-2">
											<span className="font-semibold">
												{t_common(resourceKindTranslationKey(p.kind))}
											</span>
											<Link
												href={`/teaching/courses/edit/${resource.course.courseId}`}
												className="text-c-primary hover:underline"
											>
												{p.title}
											</Link>
										</div>
									)}
									{resource.specialization && (
										<div className="flex items-center gap-2">
											<span className="font-semibold">
												{t_common(resourceKindTranslationKey(p.kind))}
											</span>
											<Link
												href={`/teaching/subjects/${resource.specialization.subjectId}/${resource.specialization.specializationId}/edit`}
												className="text-c-primary hover:underline"
											>
												{p.title}
											</Link>
										</div>
									)}
									{resource.subject && (
										<div className="flex items-center gap-2">
											<span className="font-semibold">
												{t_common(resourceKindTranslationKey(p.kind))}
											</span>
											<Link
												href={`/teaching/subjects/${resource.subject.subjectId}/edit`}
												className="text-c-primary hover:underline"
											>
												{p.title}
											</Link>
										</div>
									)}
									{resource.skill && (
										<div className="flex items-center gap-2">
											<span className="font-semibold">
												{t_common(resourceKindTranslationKey(p.kind))}
											</span>
											<Link
												href={`/skills/${resource.skill.skillId}`}
												className="text-c-primary hover:underline"
											>
												{p.title}
											</Link>
										</div>
									)}
								</div>
							);
						})}
					</div>

					<DialogActions onClose={onClose} />
				</div>
			</Dialog>
		);
	}

	return (
		<Dialog title={t("Delete_Action")} onClose={onClose}>
			{t("Confirm_Delete_Group")}
			<DialogActions onClose={onClose}>
				<button className="btn-primary hover:bg-c-danger" onClick={() => onClose(true)}>
					{t("Delete_Action")}
				</button>
			</DialogActions>
		</Dialog>
	);
}
