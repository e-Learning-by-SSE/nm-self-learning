import { trpc } from "@self-learning/api-client";
import { LessonDraft } from "@self-learning/types";
import { Dialog, DialogActions } from "@self-learning/ui/common";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useRouter } from "next/router";

export function DraftsDialog({ onClose, drafts }: { onClose: () => void; drafts: LessonDraft[] }) {
	const { mutateAsync: deleteDraft } = trpc.lessonDraft.delete.useMutation();
	const router = useRouter();

	const handleClick = () => {
		const draftId = drafts[0].id;
		router.push(`/teaching/lessons/edit/draft/${draftId}`);
	};

	const handleCancel = () => {
		const draftId = drafts[0].id;

		if (draftId) {
			deleteDraft({ draftId: draftId });
		}

		onClose();
	};

	return (
		<Dialog onClose={onClose} title={"Nicht gespeicherte Veränderungen"}>
			<span className="text-sm text-light">
				Wir haben nicht gespeicherte Änderungen von Ihrer letzten Sitzung festgestellt.
				<div className="py-3">
					{drafts[0].title && (
						<div>
							<strong>Lerneinheit:</strong> {drafts[0].title}
						</div>
					)}

					{drafts[0].updatedAt && (
						<div>
							<strong>Letzte Aktualisierung: </strong>
							{format(new Date(drafts[0].updatedAt), "dd. MMMM yyyy, HH:mm", {
								locale: de
							})}
						</div>
					)}
				</div>
				Möchten Sie diese wiederherstellen? Nicht gespeicherte Änderungen gehen verloren!
			</span>
			<div className="flex gap-2 pt-3 justify-end">
				<DialogActions onClose={handleCancel}>
					<button className="btn-primary" onClick={handleClick}>
						Wiederherstellen
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
