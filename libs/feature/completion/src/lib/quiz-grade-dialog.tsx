"use client";
import { PlayIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { AchievementList, useAchievementRedemption } from "@self-learning/achievements";
import { trpc } from "@self-learning/api-client";
import { LessonLayoutProps, loadLessonSessionSafe } from "@self-learning/lesson";
import { useQuiz } from "@self-learning/quiz";
import { AchievementWithProgress, PerformanceGrade } from "@self-learning/types";
import {
	ConfettiRain,
	DialogActions,
	GameifyDialog,
	OnDialogCloseFn
} from "@self-learning/ui/common";
import { IdSet } from "@self-learning/util/common";
import { intervalToDuration } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateAverageQuizScore, scoreToPerformanceGrade } from "./lesson-grading";
import { GradeBadge } from "./lesson-grade-display";

function GradeDisplay({
	grade,
	averageScore,
	totalAttempts,
	learnedSeconds
}: {
	grade: PerformanceGrade;
	averageScore: number;
	totalAttempts: number;
	learnedSeconds: number;
}) {
	const duration = intervalToDuration({ start: 0, end: learnedSeconds * 1000 });
	const durationFormatted = `${duration.minutes ?? "00"}:${String(duration.seconds ?? "00").padStart(2, "0")}`;

	return (
		<div className="flex flex-col items-center gap-6 p-6">
			{/* Header - wie in deiner Zeichnung */}
			<div className="text-center">
				<h2 className="text-2xl font-semibold text-gray-800 mb-2">
					Gratulation toll gemacht!
				</h2>
				<p className="text-gray-600">
					Du hast eine{" "}
					<span className="font-semibold">{Math.round(averageScore * 100)} / 100</span>{" "}
					Bewertung erreicht
				</p>
			</div>

			{/* Haupt-Display mit Zeit und Note - Layout wie in deiner Zeichnung */}
			<div className="flex items-center gap-6">
				{/* Zeit-Box (links) */}
				<div className="bg-white border-2 border-gray-300 rounded-xl px-6 py-4 min-w-[100px] text-center shadow-lg">
					<div className="text-xl font-mono text-gray-700 font-semibold">
						{durationFormatted}
					</div>
					<div className="text-xs text-gray-500 mt-1">Zeit</div>
				</div>

				<GradeBadge rating={averageScore} />
			</div>

			{/* Zusätzliche Info */}
			<div className="text-center text-sm text-gray-600">
				<p>Versuch: {totalAttempts}</p>
				{grade === "PERFECT" && (
					<p className="text-purple-600 font-medium mt-1">
						Fehlerfrei!{" "}
						<span role="img" aria-label="Konfetti">
							🎉
						</span>
					</p>
				)}
				{grade !== "PERFECT" && (
					<p className="mt-2 text-blue-600">
						Du kannst es noch einmal versuchen, um eine bessere Note zu erhalten!
					</p>
				)}
			</div>
		</div>
	);
}

interface QuizGradeDialogProps {
	open: boolean;
	onClose: OnDialogCloseFn<void>;
	lesson: LessonLayoutProps["lesson"];
	course: LessonLayoutProps["course"];
	nextLesson?: { title: string; slug: string } | null;
}

export function QuizGradeDialog({
	open,
	onClose,
	lesson,
	course,
	nextLesson
}: QuizGradeDialogProps) {
	const { attempts, answers, lessonAttemptId: attemptIdControl, reload } = useQuiz();
	const { mutateAsync: earnAchievements } = trpc.achievement.earnAchievements.useMutation();
	const [achievements, setAchievements] = useState<IdSet<AchievementWithProgress>>(new IdSet());
	const { handleRedeem } = useAchievementRedemption();
	const learningSession = loadLessonSessionSafe(lesson.lessonId);

	if (learningSession && attemptIdControl !== learningSession.lessonAttemptId) {
		console.warn(
			"QuizGradeDialog: lessonAttemptId from quiz does not match the one from lesson session."
		);
	}

	const totalAttempts = Object.values(attempts).reduce((acc, attempt) => acc + attempt, 0);
	const averageScore = calculateAverageQuizScore(attempts, answers);
	const grade = scoreToPerformanceGrade(averageScore);

	const handleRedeemWithStateUpdate = async (achievementId: string) => {
		void handleRedeem(achievementId);
		setAchievements(prev => {
			// this is a workaround to show the user the successful redeeming of the achievement invalidates trpc-achievment querys. But
			// this does not affect the mutation query used here. So we use a state and update it manually
			const item = prev.get(achievementId);
			if (!item) return prev;
			item.redeemedAt = new Date();
			const updated = new IdSet(prev);
			updated.add(item);
			return updated;
		});
	};

	useEffect(() => {
		async function fetchAchievements() {
			const achieved = await earnAchievements({ trigger: "lesson_completed" });
			const filteredAchievements = filterAchievementsByLevel(achieved);
			setAchievements(filteredAchievements);
		}
		void fetchAchievements();
	}, [earnAchievements]);

	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		setShowConfetti(true);
		const timer = setTimeout(() => setShowConfetti(false), 200);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<ConfettiRain
				isActive={showConfetti}
				interval={30}
				duration={100}
				gravityBaseValue={3.5}
			/>

			<GameifyDialog
				open={open}
				onClose={onClose}
				title={lesson.title}
				style={{ minWidth: "400px", maxWidth: "600px", maxHeight: "90vh", width: "90vw" }}
			>
				<div className="space-y-6">
					{/* Course Information */}
					<div className="text-center">
						<h2 className="text-xl font-semibold mb-2">{course.title}</h2>
						<p className="text-sm text-gray-600">
							von {lesson.authors.map(a => a.displayName).join(", ")}
						</p>
					</div>

					{/* Grade Display - jetzt mit verbesserter Darstellung */}
					<GradeDisplay
						grade={grade}
						averageScore={averageScore}
						totalAttempts={totalAttempts}
						learnedSeconds={learningSession?.totalDurationSec ?? 0}
					/>

					{/* Achievements Section */}
					{achievements.size > 0 && (
						<GradeAchievementSection
							title="Errungenschaften"
							achievements={achievements}
							onRedeem={handleRedeemWithStateUpdate}
						/>
					)}

					{/* Lesson completion text */}
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
				</div>

				{/* Action buttons - wie in deiner Zeichnung */}
				<DialogActions abortLabel="Close" onClose={onClose}>
					{grade !== "PERFECT" && (
						<button onClick={reload} className="btn-stroked">
							Erneut versuchen
						</button>
					)}
					{nextLesson && (
						<NextLessonButton
							courseSlug={course.slug}
							nextLessonSlug={nextLesson.slug}
						/>
					)}
				</DialogActions>
			</GameifyDialog>
		</>
	);
}

function filterAchievementsByLevel(achievements: AchievementWithProgress[]) {
	const result = new IdSet<AchievementWithProgress>();
	if (achievements.length === 0) return result;

	// Finde alle abgeschlossenen Achievements
	const completedAchievements = achievements.filter(
		achievement => achievement.progressValue === achievement.requiredValue
	);

	// Finde das Achievement mit dem niedrigsten Level
	const lowestLevelAchievement = achievements.reduce((lowest, current) => {
		return (current.meta?.level ?? Infinity) < (lowest.meta?.level ?? Infinity)
			? current
			: lowest;
	});

	result.add(lowestLevelAchievement);
	completedAchievements.forEach(a => result.add(a));

	return result;
}

function GradeAchievementSection({
	title,
	achievements,
	onRedeem
}: {
	title: string;
	achievements: IdSet<AchievementWithProgress>;
	onRedeem?: (achievementId: string) => void;
}) {
	if (achievements.size === 0) return null;

	return (
		<div className="p-4 rounded-lg">
			<h3 className="font-bold text-lg mb-4 flex items-center">
				<TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
				{title}
			</h3>
			<AchievementList achievements={achievements} onRedeem={onRedeem} />
		</div>
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
