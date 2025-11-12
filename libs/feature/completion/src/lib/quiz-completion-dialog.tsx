import { ArrowPathIcon, PlayIcon } from "@heroicons/react/24/solid";
import { LessonLayoutProps } from "@self-learning/lesson";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import Link from "next/link";
import { QuizGradeDialog } from "./quiz-grade-dialog";

export function QuizCompletionDialog({
	course,
	lesson,
	nextLesson,
	onClose
}: {
	course: LessonLayoutProps["course"];
	lesson: LessonLayoutProps["lesson"];
	nextLesson: { title: string; slug: string } | null;
	onClose: OnDialogCloseFn<void>;
}) {
	const session = useRequiredSession();

	if (session.data?.user.featureFlags.experimental) {
		return (
			<QuizGradeDialog
				open={true}
				onClose={onClose}
				lesson={lesson}
				course={course}
				nextLesson={nextLesson}
			/>
		);
	} else {
		return (
			<Dialog onClose={onClose} title="Geschafft!" style={{ maxWidth: "600px" }}>
				<div className="flex flex-col text-sm text-light">
					<p>
						Du hast die Lerneinheit{" "}
						<span className="font-semibold text-secondary">{lesson.title}</span>{" "}
						erfolgreich abgeschlossen.
					</p>

					{nextLesson ? (
						<div className="flex flex-col">
							<p>Die nächste Lerneinheit ist ...</p>
							<span className="mt-4 self-center rounded-lg bg-gray-100 px-12 py-4 text-xl font-semibold tracking-tighter text-secondary">
								{nextLesson.title}
							</span>
						</div>
					) : (
						<p>
							Der Kurs{" "}
							<span className="font-semibold text-secondary">{course.title}</span>{" "}
							enthält keine weiteren Lerneinheiten für dich.
						</p>
					)}
				</div>

				<DialogActions onClose={onClose}>
					{nextLesson && (
						<NextLessonButton
							courseSlug={course.slug}
							nextLessonSlug={nextLesson.slug}
						/>
					)}
				</DialogActions>
			</Dialog>
		);
	}
}

export function QuizFailedDialog({
	course,
	lesson,
	nextLesson,
	onClose
}: {
	course: LessonLayoutProps["course"];
	lesson: LessonLayoutProps["lesson"];
	nextLesson: { title: string; slug: string } | null;
	onClose: OnDialogCloseFn<void>;
}) {
	return (
		<Dialog onClose={onClose} title="Nicht Bestanden" style={{ maxWidth: "600px" }}>
			<div className="flex flex-col text-sm text-light">
				<p>
					Du hast leider zu viele Fragen falsch beantwortet, um die Lerneinheit{" "}
					<span className="font-semibold text-secondary">{lesson.title}</span>{" "}
					abzuschließen.
				</p>
			</div>

			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={() => onClose()}>
					<span>Weiter probieren</span>
					<ArrowPathIcon className="h-5 shrink-0" />
				</button>

				{nextLesson && (
					<NextLessonButton courseSlug={course.slug} nextLessonSlug={nextLesson.slug} />
				)}
			</DialogActions>
		</Dialog>
	);
}

function NextLessonButton({
	courseSlug,
	nextLessonSlug
}: {
	courseSlug: string;
	nextLessonSlug: string;
}) {
	return (
		<Link href={`/courses/${courseSlug}/${nextLessonSlug}`} className="btn-primary">
			<span>Zur nächsten Lerneinheit</span>
			<PlayIcon className="h-5 shrink-0" />
		</Link>
	);
}
