"use client";
import { TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Specialization, Subject } from "@self-learning/types";
import { Dialog, DialogActions, IconOnlyButton } from "@self-learning/ui/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "next-i18next";

export function CourseDeleteOption({ slug }: { slug: string }) {
	const { mutateAsync: deleteCourse } = trpc.course.deleteCourse.useMutation();
	const { data: linkedEntities, refetch } = trpc.course.findLinkedEntities.useQuery(
		{ slug },
		{ enabled: false }
	);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const { reload } = useRouter();

	const handleDelete = async () => {
		await deleteCourse({ slug });
		reload();
	};

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				onClick={async () => {
					await refetch();
					setShowConfirmation(true);
				}}
			/>
			{showConfirmation && (
				<CourseDeletionDialog
					onCancel={() => setShowConfirmation(false)}
					onSubmit={() => {
						handleDelete();
						setShowConfirmation(false);
					}}
					linkedEntities={linkedEntities}
				/>
			)}
		</>
	);
}

type CourseLinkedEntities = {
	subject: Omit<Subject, "permissions"> | null;
	specializations: (Omit<Specialization, "permissions"> & {
		subject: Omit<Subject, "permissions">;
	})[];
};

function CourseDeletionDialog({
	onCancel,
	onSubmit,
	linkedEntities
}: {
	onCancel: () => void;
	onSubmit: () => void;
	linkedEntities?: CourseLinkedEntities | null;
}) {
	const { t } = useTranslation("feature-teaching");

	if (linkedEntities && (linkedEntities.subject || linkedEntities.specializations.length > 0)) {
		return (
			<Dialog title={t("Delete_Not_Possible")} onClose={onCancel}>
				{t("Course_Cannot_Be_Deleted")}
				{linkedEntities.subject && (
					<>
						<br />
						{t("Used_In_Subject")}{" "}
						<Link
							href={`/subjects/${linkedEntities.subject.slug}`}
							className="hover:text-c-primary"
						>
							{linkedEntities.subject.title}
						</Link>
					</>
				)}
				<br />
				{t("Used_In_Subjects")}
				<ul className="flex flex-wrap gap-4 list-inside list-disc text-sm font-medium">
					{linkedEntities.specializations.map(specialization => (
						<li key={specialization.slug}>
							<Link
								href={`/subjects/${specialization.subject.slug}/${specialization.slug}`}
								className="hover:text-c-primary"
							>
								{specialization.subject.title} / {specialization.title}
							</Link>
						</li>
					))}
				</ul>
				<DialogActions onClose={onCancel} />
			</Dialog>
		);
	}

	return (
		<Dialog title={t("Delete")} onClose={onCancel}>
			{t("Confirm_Delete_Course")}
			<DialogActions onClose={onCancel}>
				<button type="button" className="btn-primary hover:bg-c-danger" onClick={onSubmit}>
					{t("Delete")}
				</button>
			</DialogActions>
		</Dialog>
	);
}
