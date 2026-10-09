import { useTranslation } from "next-i18next";
import Link from "next/link";
import { Dialog, DialogActions, IconOnlyButton, LoadingBox } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import styles from "./folder-editor/folder-table.module.css";

type SkillDeleteButtonProps = {
	skillId: string;
	variant?: "row" | "default";
	sharedSkillName?: string;
	onDeleteSuccess?: () => void | PromiseLike<void>;
};

export function SkillDeleteButton({
	skillId,
	variant = "row",
	sharedSkillName,
	onDeleteSuccess
}: SkillDeleteButtonProps) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const { mutateAsync: deleteSkill, isPending: isDeleting } =
		trpc.skill.deleteSkills.useMutation();
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [deleteError, setDeleteError] = useState(false);
	const usageQuery = trpc.skill.getDeleteUsage.useQuery(
		{ skillId },
		{ enabled: showConfirmation }
	);
	const utils = trpc.useUtils();

	const handleDelete = async () => {
		await deleteSkill({ ids: [skillId] });
		await Promise.all([
			utils.skill.getSkills.invalidate(),
			utils.skill.getParentSkillsByAuthorId.invalidate()
		]);
		await onDeleteSuccess?.();
	};

	const handleConfirm = async () => {
		setDeleteError(false);
		try {
			await handleDelete();
			setShowConfirmation(false);
		} catch {
			setDeleteError(true);
		}
	};

	const handleOpen = () => {
		setDeleteError(false);
		setShowConfirmation(true);
	};

	const handleCancel = () => {
		setShowConfirmation(false);
	};

	const isRow = variant === "row";
	const usage = usageQuery.data;
	const isCheckingUsage = usageQuery.isFetching || usageQuery.isPending;
	const hasUsage = !!usage && (usage.courses.length > 0 || usage.lessons.length > 0);

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className={isRow ? "h-4 w-4 text-red-500" : "h-5 w-5"} />}
				className={
					isRow
						? `${styles["skill-row-add"]} invisible group-hover:visible !p-1`
						: "btn-danger"
				}
				onClick={event => {
					event.preventDefault();
					event.stopPropagation();
					handleOpen();
				}}
				title={t("common:delete")}
			/>
			{showConfirmation && (
				<Dialog title={t("common:delete")} onClose={handleCancel}>
					{isCheckingUsage ? (
						<LoadingBox />
					) : usageQuery.isError || deleteError ? (
						<>
							<p className="text-red-600">{t("Skills_Delete_Check_Failed")}</p>
							<DialogActions onClose={handleCancel} />
						</>
					) : hasUsage ? (
						<>
							<p className="mb-4">{t("Skills_Delete_Used_In")}</p>
							<SkillUsageList
								title={t("Skills_Delete_Used_In_Courses")}
								items={usage.courses}
								hrefPrefix="/courses/"
							/>
							<SkillUsageList
								title={t("Skills_Delete_Used_In_Lessons")}
								items={usage.lessons}
								hrefPrefix="/lessons/"
							/>
							<DialogActions onClose={handleCancel} />
						</>
					) : (
						<>
							{t("Skills_Delete_Confirm")}
							{sharedSkillName && (
								<div className="mt-2 text-sm text-red-600">
									{t("Skills_Delete_Shared_Warning", { name: sharedSkillName })}
								</div>
							)}
							<DialogActions onClose={handleCancel}>
								<button
									className="btn-primary hover:bg-c-danger"
									disabled={isDeleting}
									onClick={() => void handleConfirm()}
								>
									{t("common:delete")}
								</button>
							</DialogActions>
						</>
					)}
				</Dialog>
			)}
		</>
	);
}

export const SkillRowDeleteButton = SkillDeleteButton;

function SkillUsageList({
	title,
	items,
	hrefPrefix
}: {
	title: string;
	items: { id: string; slug: string; title: string; skills: string[] }[];
	hrefPrefix: string;
}) {
	if (items.length === 0) return null;

	return (
		<section className="mb-3">
			<h3 className="font-semibold">{title}</h3>
			<ul className="list-disc pl-5">
				{items.map(item => (
					<li key={item.id}>
						<Link
							href={`${hrefPrefix}${item.slug}`}
							className="text-secondary hover:underline"
						>
							{item.title}
						</Link>
						{item.skills.length > 0 && (
							<span className="text-sm text-light">
								{` (${item.skills.join(", ")})`}
							</span>
						)}
					</li>
				))}
			</ul>
		</section>
	);
}
