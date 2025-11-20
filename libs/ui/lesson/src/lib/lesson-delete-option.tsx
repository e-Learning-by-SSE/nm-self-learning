import { trpc } from "@self-learning/api-client";
import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Dialog, DialogActions, IconOnlyButton } from "@self-learning/ui/common";
import Link from "next/link";

export function LessonDeleteOption({ lessonId }: { lessonId: string }) {
	const { mutateAsync: deleteLesson } = trpc.lesson.deleteLesson.useMutation();
	const { data: linkedEntities, isLoading } = trpc.lesson.findLinkedLessonEntities.useQuery({
		lessonId
	});
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteLesson({ lessonId: lessonId });
	};

	const handleConfirm = async () => {
		await handleDelete();
		setShowConfirmation(false);
	};

	const handleCancel = () => {
		setShowConfirmation(false);
	};

	// Don't show delete button -> Empty option
	if (isLoading) {
		return null;
	}

	return (
		<>
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				variant="danger"
				onClick={() => setShowConfirmation(true)}
				title={"Lerneinheit löschen"}
			/>
			{showConfirmation && (
				<LessonDeletionDialog
					handleCancel={handleCancel}
					handleConfirm={handleConfirm}
					linkedEntities={linkedEntities}
				/>
			)}
		</>
	);
}

function LessonDeletionDialog({
	handleCancel,
	handleConfirm,
	linkedEntities
}: {
	handleCancel: () => void;
	handleConfirm: () => void;
	linkedEntities?: { slug: string; title: string }[];
}) {
	if (linkedEntities && linkedEntities.length > 0) {
		return (
			<Dialog title={"Löschen nicht möglich"} onClose={handleCancel}>
				Lerneinheit kann nicht gelöscht werden, da sie in den folgenden Kursen Anwendung
				findet:
				<ul className="flex flex-wrap gap-4 list-inside list-disc text-sm font-medium">
					{linkedEntities.map(course => (
						<li key={course.slug}>
							<Link href={`/courses/${course.slug}`} className="hover:text-c-primary">
								{course.title}
							</Link>
						</li>
					))}
				</ul>
				<DialogActions onClose={handleCancel} />
			</Dialog>
		);
	}

	return (
		<Dialog title={"Löschen"} onClose={handleCancel}>
			Möchten Sie diese Lerneinheit wirklich löschen?
			<DialogActions onClose={handleCancel}>
				<button className="btn-primary hover:bg-c-danger" onClick={handleConfirm}>
					Löschen
				</button>
			</DialogActions>
		</Dialog>
	);
}
