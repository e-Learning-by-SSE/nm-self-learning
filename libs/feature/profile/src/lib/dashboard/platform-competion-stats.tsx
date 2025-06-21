import { FolderIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon, ClockIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { AchievementCard } from "@self-learning/achievements";
import { trpc } from "@self-learning/api-client";
import { SmallGradeBadge, scoreToPerformanceGrade } from "@self-learning/completion";
import { PerformanceGrade } from "@self-learning/types";
import {
	GameifyDialog,
	LoadingBox,
	ProgressBar,
	SectionCard,
	showToast
} from "@self-learning/ui/common";
import { formatTimeIntervalToString } from "@self-learning/util/common";
import { compareDesc, secondsToMilliseconds } from "date-fns";
import Link from "next/link";
import { useState } from "react";

export interface PlatformStats {
	topUser: {
		currentStreak: number;
		achievementCount: number;
		averageRating: number;
		isCurrentUser?: boolean;
	};
	today: {
		newAchievements: Array<{
			id: string;
			title: string;
		}>;
		longestLearningSession: number;
		mostLessonsCompleted: number;
	};
	own: {
		currentStreak: number;
		averageRating: number;
	};
}

interface PlatformStatsAchievementsSectionProps {
	stats: PlatformStats;
	completedLessons: { lessonId: string; performanceScore: number }[];
	className?: string;
}

function getGradeBreakdown(
	completedLessons: { lessonId: string; performanceScore: number }[]
): Record<PerformanceGrade, number> {
	const map = new Map<string, number>();
	for (const entry of completedLessons) {
		if (!map.has(entry.lessonId)) {
			map.set(entry.lessonId, entry.performanceScore);
		}
	}
	const highestScores = Array.from(map.values());

	const breakdown: Record<PerformanceGrade, number> = {
		PERFECT: 0,
		VERY_GOOD: 0,
		GOOD: 0,
		SATISFACTORY: 0,
		SUFFICIENT: 0
	};

	for (const score of highestScores) {
		const grade = scoreToPerformanceGrade(score);
		breakdown[grade]++;
	}

	return breakdown;
}

interface GradeBreakdownDialogProps {
	open: boolean;
	onClose: () => void;
	gradeBreakdown: Record<PerformanceGrade, number>;
	totalLessons: number;
	averageScore: number;
}

function GradeBreakdownDialog({
	open,
	onClose,
	gradeBreakdown,
	totalLessons,
	averageScore
}: GradeBreakdownDialogProps) {
	return (
		<GameifyDialog
			open={open}
			onClose={onClose}
			title={
				<div className="flex items-center gap-3">
					<SmallGradeBadge rating={averageScore} />
					<span>Bewertungsverteilung</span>
				</div>
			}
			style={{ minWidth: 500, maxHeight: "70vh", maxWidth: 600 }}
		>
			<div className="space-y-4">
				<div className="text-sm text-gray-600 mb-6">
					Hier siehst du, wie sich deine {totalLessons} abgeschlossenen Lerneinheiten auf
					die verschiedenen Bewertungen verteilen.
				</div>

				<div className="space-y-4">
					{Object.entries(gradeBreakdown).map(([grade, count]) => {
						const percentage = totalLessons > 0 ? (count / totalLessons) * 100 : 0;

						return (
							<div
								key={grade}
								className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
							>
								<div className="flex items-center gap-3">
									<SmallGradeBadge rating={grade as PerformanceGrade} />
									<div className="text-sm font-medium text-gray-700">
										{getGradeDisplayName(grade as PerformanceGrade)}
									</div>
								</div>

								<div className="flex items-center gap-4">
									{/* Progress Bar */}
									<div className="w-24 bg-gray-200 rounded-full h-3">
										<div
											className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
											style={{ width: `${percentage}%` }}
										></div>
									</div>

									{/* Count and Percentage */}
									<div className="text-right min-w-[4rem]">
										<div className="text-lg font-bold text-gray-900">
											{count}
										</div>
										<div className="text-xs text-gray-500">
											{percentage.toFixed(1)}%
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Summary Stats */}
				<div className="mt-6 pt-4 border-t border-gray-200">
					<div className="grid grid-cols-2 gap-4 text-center">
						<div className="p-3 bg-blue-50 rounded-lg">
							<div className="text-2xl font-bold text-blue-600">{totalLessons}</div>
							<div className="text-sm text-blue-700">Gesamt abgeschlossen</div>
						</div>
						<div className="p-3 bg-green-50 rounded-lg">
							<div className="text-2xl font-bold text-green-600">
								<SmallGradeBadge rating={averageScore} />
							</div>
							<div className="text-sm text-green-700">Durchschnittsbewertung</div>
						</div>
					</div>
				</div>
			</div>
		</GameifyDialog>
	);
}

function getGradeDisplayName(grade: PerformanceGrade): string {
	const gradeNames: Record<PerformanceGrade, string> = {
		PERFECT: "Perfekt",
		VERY_GOOD: "Sehr gut",
		GOOD: "Gut",
		SATISFACTORY: "Befriedigend",
		SUFFICIENT: "Ausreichend"
	};
	return gradeNames[grade];
}

export function InlineProgressBar({ value, max }: { value: number; max: number }) {
	return (
		<div className="inline-block font-mono text-sm w-fit min-w-[180px]">
			<div className="flex items-center gap-2">
				<span className="text-gray-500">
					{value}/{max}
				</span>
				<div className="ml-2 w-32">
					<ProgressBar progressPercentage={(value / max) * 100} bgColor="bg-blue-500" />
				</div>
			</div>
		</div>
	);
}

export function PlatformStatsAchievementsSection({
	stats,
	completedLessons,
	className
}: PlatformStatsAchievementsSectionProps) {
	const { data: achievements, isLoading } = trpc.achievement.getOwnAchievements.useQuery();
	const { data: achievementStats } = trpc.achievement.getOverviewStats.useQuery();
	const utils = trpc.useUtils();

	// Grade breakdown state and calculation
	const [showGradeDialog, setShowGradeDialog] = useState(false);
	const gradeBreakdown = getGradeBreakdown(completedLessons);
	const totalCompletedLessons = Object.values(gradeBreakdown).reduce(
		(sum, count) => sum + count,
		0
	);

	// Redemption mutation
	const { mutateAsync: redeemAchievement } = trpc.achievement.redeemAchievement.useMutation({
		onSuccess: () => {
			utils.achievement.getOwnAchievements.invalidate();
			utils.achievement.getOverviewStats.invalidate();
		}
	});

	// Redemption handler
	const handleRedeem = async function (achievementId: string): Promise<void> {
		try {
			await redeemAchievement({ achievementId });
			showToast({
				type: "success",
				title: "Errungenschaft eingelöst!",
				subtitle: "Glückwunsch zu deiner Errungenschaft!"
			});
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Errungenschaft konnte nicht eingelöst werden."
			});
		}
	};

	if (isLoading) {
		return <LoadingBox height={400} />;
	}

	// Sort achievements by status
	const redeemable =
		achievements?.filter(a => a.progressValue >= a.requiredValue && !a.redeemedAt) || [];

	const redeemed = achievements?.filter(a => a.redeemedAt !== null) || [];

	const inProgress =
		achievements
			?.filter(a => a.progressValue < a.requiredValue && a.progressValue > 0)
			.slice(0, 2) || [];

	return (
		<>
			<SectionCard className={`p-6 ${className || ""}`}>
				{/* Header mit beiden Titeln */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<TrophyIcon className="h-6 w-6 text-yellow-500" />
							<h2 className="text-lg font-semibold">
								Plattform-Stats & Errungenschaften
							</h2>
						</div>
					</div>
					<Link
						href="/profile/achievements"
						className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
					>
						Alle anzeigen
						<ChevronRightIcon className="h-4 w-4" />
					</Link>
				</div>

				{/* Main content layout */}
				<div className="space-y-6">
					{/* Deine Stats */}
					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
							<TrophyIcon className="h-5 w-5 text-blue-500" />
							Deine Erfolge
						</h3>

						<div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-4">
							<div className="grid grid-cols-3 divide-x divide-gray-200">
								{/* Streak */}
								<div className="text-center">
									<div className="text-3xl font-bold text-blue-600 mb-1">
										{stats.own.currentStreak}
									</div>
									<div className="text-sm text-gray-600">Tage-Streak</div>
								</div>

								{/* Achievements */}
								<div className="text-center">
									<div className="text-3xl font-bold mb-1">
										<span className="text-blue-600">{redeemed.length}</span>
										<span className="text-gray-400 text-lg">
											{" "}
											/ {achievementStats?.total || 0}
										</span>
									</div>
									<div className="text-sm text-gray-600">Erfolge</div>
								</div>

								{/* Rating - now clickable */}
								<div
									className="text-center relative group cursor-pointer"
									onClick={() => setShowGradeDialog(true)}
								>
									{/* Invisible clickable overlay */}
									<div
										className="absolute inset-0 hover:bg-blue-50 rounded-lg transition-colors"
										title="Klicken für detaillierte Bewertungsverteilung"
									/>

									{/* Content - same structure as other columns */}
									<div className="text-3xl font-bold text-blue-600 mb-1 group-hover:scale-105 transition-transform relative z-10">
										<SmallGradeBadge rating={stats.own.averageRating} />
									</div>
									<div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors flex items-center justify-center gap-1 relative z-10">
										<span>Ø Bewertung</span>
										<FolderIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors hidden sm:inline" />
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Spitzenreiter Stats - mit goldenem Schimmer */}
					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
							<TrophyIcon className="h-5 w-5 text-yellow-500" />
							{stats.topUser.isCurrentUser ? (
								<span className="text-red-400">
									Du bist aktueller Spitzenreiter! 🎉
								</span>
							) : (
								"Aktueller Spitzenreiter"
							)}
						</h3>

						{stats.topUser.isCurrentUser && (
							<div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
								<p className="text-sm text-emerald-700">
									🔒 Andere Nutzer sehen nur deine Erfolge, aber keine
									persönlichen Informationen von dir.
								</p>
							</div>
						)}

						{/* Container mit goldenem Rand */}
						<div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-yellow-300 shadow-lg shadow-yellow-100 p-4">
							<div className="grid grid-cols-3 divide-x divide-gray-200">
								{/* Streak */}
								<div className="text-center">
									<div className="text-3xl font-bold text-emerald-600 mb-1">
										{stats.topUser.currentStreak}
									</div>
									<div className="text-sm text-gray-600">Tage-Streak</div>
								</div>

								{/* Achievements */}
								<div className="text-center">
									<div className="text-3xl font-bold text-emerald-600 mb-1">
										{stats.topUser.achievementCount}
									</div>
									<div className="text-sm text-gray-600">Erfolge</div>
								</div>

								{/* Rating */}
								<div className="text-center">
									<div className="text-3xl font-bold text-emerald-600 mb-1">
										<SmallGradeBadge rating={stats.topUser.averageRating} />
									</div>
									<div className="text-sm text-gray-600">Ø Bewertung</div>
								</div>
							</div>
						</div>
					</div>

					{/* Achievement Feed */}
					<div className="bg-white rounded-lg border border-gray-200 p-2">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
								<TrophyIcon className="h-5 w-5 text-purple-600" />
								Letzte Fortschritte
							</h3>
							<Link
								href="/profile/achievements"
								className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
							>
								Alle Errungenschaften
								<ChevronRightIcon className="h-4 w-4" />
							</Link>
						</div>

						<div className="space-y-3 max-h-64 overflow-y-auto">
							{/* Sortiert nach Datum - Mix aus erreichten und in Bearbeitung */}
							{achievements
								?.sort((a, b) =>
									compareDesc(
										new Date(a.lastProgressUpdate ?? 0),
										new Date(b.lastProgressUpdate ?? 0)
									)
								)
								.slice(0, 5)
								.map(achievement =>
									inProgress.some(a => a.id === achievement.id) ? (
										<AchievementCard
											key={achievement.id}
											showDescription
											achievement={achievement}
											progressBar={
												<InlineProgressBar
													max={achievement.requiredValue}
													value={achievement.progressValue}
												/>
											}
										/>
									) : (
										<AchievementCard
											key={achievement.id}
											onRedeem={handleRedeem}
											achievement={achievement}
											showDescription={true}
											progressBar={
												<InlineProgressBar
													max={achievement.requiredValue}
													value={achievement.progressValue}
												/>
											}
										/>
									)
								)}
						</div>
					</div>

					{/* Heutige Rekorde - unten nebeneinander */}
					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
							<ClockIcon className="h-5 w-5 text-blue-500" />
							Heutige Plattform Rekorde
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Longest Learning Session */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<div className="flex items-center gap-3">
									<ClockIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
									<div>
										<div className="text-xl font-bold text-blue-900">
											{formatTimeIntervalToString(
												secondsToMilliseconds(
													stats.today.longestLearningSession
												)
											)}
										</div>
										<div className="text-sm text-blue-700">
											Längste Lernzeit heute
										</div>
									</div>
								</div>
							</div>

							{/* Most Lessons Completed */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<div className="flex items-center gap-3">
									<TrophyIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
									<div>
										<div className="text-xl font-bold text-blue-900">
											{stats.today.mostLessonsCompleted}
										</div>
										<div className="text-sm text-blue-700">
											Meiste Lerneinheiten heute
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</SectionCard>

			{/* Grade Breakdown Dialog */}
			<GradeBreakdownDialog
				open={showGradeDialog}
				onClose={() => setShowGradeDialog(false)}
				gradeBreakdown={gradeBreakdown}
				totalLessons={totalCompletedLessons}
				averageScore={stats.own.averageRating}
			/>
		</>
	);
}
