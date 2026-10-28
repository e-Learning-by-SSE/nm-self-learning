import { useTranslation } from "next-i18next";
import { ArrowPathIcon, PlayIcon } from "@heroicons/react/24/solid";
import { LessonLayoutProps } from "@self-learning/lesson";
import { Dialog, DialogActions, OnDialogCloseFn, Trans } from "@self-learning/ui/common";
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
	const { t } = useTranslation("feature-completion");
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
			<Dialog onClose={onClose} title={t("Success_Title")} style={{ maxWidth: "600px" }}>
				<div className="flex flex-col text-sm text-c-text-muted">
					<p>
						<Trans
							namespace="feature-completion"
							i18nKey="Success_Message"
							values={{ lesson: lesson.title }}
							components={{
								strong: <span className="font-semibold text-c-primary" />
							}}
						/>
					</p>

					{nextLesson ? (
						<div className="flex flex-col">
							<p>{t("Next_Lesson_Intro")}</p>
							<span className="mt-4 self-center rounded-lg bg-c-surface-2 px-12 py-4 text-xl font-semibold tracking-tighter text-c-primary">
								{nextLesson.title}
							</span>
						</div>
					) : (
						<p>
							<Trans
								namespace="feature-completion"
								i18nKey="No_More_Lessons"
								values={{ course: course.title }}
								components={{
									strong: <span className="font-semibold text-c-primary" />
								}}
							/>
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
	const { t } = useTranslation("feature-completion");
	return (
		<Dialog onClose={onClose} title={t("Failure_Title")} style={{ maxWidth: "600px" }}>
			<div className="flex flex-col text-sm text-c-text-muted">
				<p>
					<Trans
						namespace="feature-completion"
						i18nKey="Failure_Message"
						values={{ lesson: lesson.title }}
						components={{ strong: <span className="font-semibold text-c-primary" /> }}
					/>
				</p>
			</div>

			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={() => onClose()}>
					<span>{t("Keep_Trying")}</span>
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
	const { t } = useTranslation("feature-completion");
	return (
		<Link href={`/courses/${courseSlug}/${nextLessonSlug}`} className="btn-primary">
			<span>{t("Go_To_Next_Lesson")}</span>
			<PlayIcon className="h-5 shrink-0" />
		</Link>
	);
}
