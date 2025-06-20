import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon, ClockIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { AchievementCard } from "@self-learning/achievements";
import { trpc } from "@self-learning/api-client";
import { SmallGradeBadge } from "@self-learning/completion";
import { LoadingBox, ProgressBar, SectionCard, showToast } from "@self-learning/ui/common";
import { formatTimeIntervalToString } from "@self-learning/util/common";
import { compareDesc, isBefore, secondsToMilliseconds } from "date-fns";
import Link from "next/link";

export interface PlatformStats {
	topUser: {
		currentStreak: number;
		achievementCount: number;
		averageRating: number;
		isCurrentUser?: boolean; // Whether the current user is the top performer
	};
	today: {
		newAchievements: Array<{
			id: string;
			title: string;
		}>;
		longestLearningSession: number; // in milliseconds
		mostLessonsCompleted: number; // number of lessons
	};
	own: {
		currentStreak: number;
		averageRating: number;
	};
}
interface PlatformStatsAchievementsSectionProps {
	stats: PlatformStats;
	className?: string;
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
	className
}: PlatformStatsAchievementsSectionProps) {
	const { data: achievements, isLoading } = trpc.achievement.getOwnAchievements.useQuery();
	const { data: achievementStats } = trpc.achievement.getOverviewStats.useQuery();
	const utils = trpc.useUtils();

	// Redemption mutation
	const { mutateAsync: redeemAchievement } = trpc.achievement.redeemAchievement.useMutation({
		onSuccess: () => {
			utils.achievement.getOwnAchievements.invalidate();
			utils.achievement.getOverviewStats.invalidate();
		}
	});

	// Redemption handler
	const handleRedeem = async (achievementId: string) => {
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
								<div className="text-sm text-gray-600">Errungenschaften</div>
							</div>

							{/* Rating */}
							<div className="text-center">
								<div className="text-3xl font-bold text-blue-600 mb-1">
									<SmallGradeBadge rating={stats.own.averageRating} />
								</div>
								<div className="text-sm text-gray-600">Ø Bewertung</div>
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
								🔒 Andere Nutzer sehen nur deine Erfolge, aber keine persönlichen
								Informationen von dir.
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
								<div className="text-sm text-gray-600">Errungenschaften</div>
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
	);
}
