"use client";
import { PlayIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { AchievementList, useAchievementRedemption } from "@self-learning/achievements";
import { trpc } from "@self-learning/api-client";
import { LessonLayoutProps } from "@self-learning/lesson";
import { useQuiz } from "@self-learning/quiz";
import { AchievementWithProgress, PerformanceGrade } from "@self-learning/types";
import { DialogActions, GameifyDialog, OnDialogCloseFn } from "@self-learning/ui/common";
import { IdSet } from "@self-learning/util/common";
import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateAverageScore, calculateQuizGrade } from "./lesson-grading";

function GradeDisplay({ grade }: { grade: PerformanceGrade }) {
	const getGradeData = (grade: PerformanceGrade) => {
		switch (grade) {
			case "PERFECT":
				return {
					color: "text-purple-700 bg-gradient-to-br from-purple-100 to-amber-100 border-2 border-purple-300",
					text: "Perfekt",
					display: "1**"
				};
			case "VERY_GOOD":
				return {
					color: "text-green-700 bg-green-100 border-2 border-green-300",
					text: "Sehr gut",
					display: "1"
				};
			case "GOOD":
				return {
					color: "text-blue-700 bg-blue-100 border-2 border-blue-300",
					text: "Gut",
					display: "2"
				};
			case "SATISFACTORY":
				return {
					color: "text-orange-700 bg-orange-100 border-2 border-orange-300",
					text: "Befriedigend",
					display: "3"
				};
			case "SUFFICIENT":
				return {
					color: "text-red-700 bg-red-100 border-2 border-red-300",
					text: "Ausreichend",
					display: "4"
				};
			default:
				return {
					color: "text-gray-700 bg-gray-100 border-2 border-gray-300",
					text: "Unbekannt",
					display: "?"
				};
		}
	};

	const gradeData = getGradeData(grade);

	return (
		<div className="text-center mb-6">
			<div
				className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${gradeData.color} mb-3 shadow-lg`}
			>
				<span className="text-3xl font-bold">{gradeData.display}</span>
			</div>
			<p className="text-xl font-semibold text-gray-800">{gradeData.text}</p>
			{grade === "PERFECT" && <p className="text-sm text-purple-600 mt-1">Fehlerfrei!</p>}
		</div>
	);
}

interface QuizCompletedGradeDialogProps {
	open: boolean;
	onClose: OnDialogCloseFn<void>;
	lesson: LessonLayoutProps["lesson"];
	course: LessonLayoutProps["course"];
	nextLesson?: { title: string; slug: string } | null;
}

export function QuizCompletedGradeDialog({
	open,
	onClose,
	lesson,
	course,
	nextLesson
}: QuizCompletedGradeDialogProps) {
	const { attempts, answers } = useQuiz();
	const { mutateAsync: earnAchievements } = trpc.achievement.earnAchievements.useMutation();
	const [achievements, setAchievements] = useState<IdSet<AchievementWithProgress>>(new IdSet());
	const { handleRedeem } = useAchievementRedemption();

	const totalAttempts = Object.values(attempts).reduce((acc, attempt) => acc + attempt, 0);
	const averageScore = calculateAverageScore(attempts, answers);
	const grade = calculateQuizGrade(averageScore);

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

	return (
		<GameifyDialog
			open={open}
			onClose={onClose}
			title={lesson.title}
			style={{ minWidth: "300px", maxWidth: "600px", maxHeight: "90vh", width: "90vw" }}
		>
			<div className="space-y-6">
				{/* Course Information */}
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">{course.title}</h2>
					<p className="text-sm text-gray-600">
						von {lesson.authors.map(a => a.displayName).join(", ")}
					</p>
				</div>
				{/* Grade Display */}
				<GradeDisplay grade={grade} />
				{/* Attempts Information */}
				<div className="text-center text-sm text-gray-600">
					<p>Versuch: {totalAttempts}</p>
					{grade !== "PERFECT" && (
						<p className="mt-2 text-blue-600">
							Du kannst es noch einmal versuchen, um eine bessere Note zu erhalten!
						</p>
					)}
				</div>
				{/* Achievements Section `*/}
				{achievements.size > 0 && (
					<GradeAchievementSection
						title="Errungenschaften"
						achievements={achievements}
						onRedeem={handleRedeemWithStateUpdate}
					/>
				)}
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

			<DialogActions abortLabel="Schließen" onClose={onClose}>
				{grade !== "PERFECT" && <button className="btn-stroked">Erneut versuchen</button>}
				{nextLesson && (
					<NextLessonButton courseSlug={course.slug} nextLessonSlug={nextLesson.slug} />
				)}
			</DialogActions>
		</GameifyDialog>
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
		<div className="bg-gray-50 p-4 rounded-lg">
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
