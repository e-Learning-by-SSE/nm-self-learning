import { ClockIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { SmallGradeBadge } from "@self-learning/completion";
import { SectionCard, SectionCardHeader } from "@self-learning/ui/common";
import { formatTimeIntervalToString } from "@self-learning/util/common";
import { secondsToMilliseconds } from "date-fns";
import { useRouter } from "next/router";

// Mock data types - replace with your actual API types
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
}

function AchievementBadge({ achievement }: { achievement: { title: string; icon?: string } }) {
	const router = useRouter();

	return (
		<div
			className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-purple-100 transition-colors"
			onClick={() => router.push(`/profile/achievements`)}
		>
			<TrophyIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
			<span className="text-sm font-medium text-purple-800 truncate">
				{achievement.title}
			</span>
		</div>
	);
}

export function PlatformStatsComponent({ stats }: { stats: PlatformStats }) {
	// In a real implementation, you would fetch this data using tRPC:
	// const { data: stats, isLoading } = trpc.platform.getStats.useQuery();

	return (
		<SectionCard className="p-6">
			<SectionCardHeader
				title="Beste Nutzer der Plattform"
				subtitle="Anonyme Statistiken der erfolgreichsten Lernenden"
			/>

			<div className="space-y-6">
				{/* Today's Highlights */}
				<div>
					<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
						<ClockIcon className="h-5 w-5 text-blue-500" />
						Heutige Rekorde
					</h3>

					<div className="space-y-4">
						{/* Daily Records */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Longest Learning Session */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-900 mb-2">
										{formatTimeIntervalToString(
											secondsToMilliseconds(
												stats.today.longestLearningSession
											)
										)}
									</div>
									<div className="text-sm text-blue-700">Längste Lernzeit</div>
								</div>
							</div>

							{/* Most Lessons Completed */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-900 mb-2">
										{stats.today.mostLessonsCompleted}
									</div>
									<div className="text-sm text-blue-700">
										Meiste Lerneinheiten absolviert
									</div>
								</div>
							</div>
						</div>

						{/* New Achievements */}
						{stats.today.newAchievements.length > 0 && (
							<div>
								<h4 className="text-sm font-medium text-gray-600 mb-2">
									Andere Nutzer haben heute neue Errungenschaften freigeschaltet:
								</h4>
								{/* Changed from grid to flex flex-col for vertical layout */}
								<div className="flex flex-col gap-2">
									{stats.today.newAchievements.map(achievement => (
										<AchievementBadge
											key={achievement.id}
											achievement={achievement}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Top User Section */}
				<div>
					<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
						<TrophyIcon className="h-5 w-5 text-yellow-500" />
						{stats.topUser.isCurrentUser ? (
							<span className="text-emerald-600">
								Du bist aktueller Spitzenreiter!{" "}
								<span role="img" aria-label="Party-Emoji">
									🎉
								</span>
							</span>
						) : (
							"Aktueller Spitzenreiter"
						)}
					</h3>

					{stats.topUser.isCurrentUser && (
						<div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
							<p className="text-sm text-emerald-700">
								<span role="img" aria-label="Schloss-Symbol">
									🔒
								</span>{" "}
								Nur du siehst, dass du der Spitzenreiter bist. Andere Nutzer sehen
								deinen Namen nicht.
							</p>
						</div>
					)}

					{/* Single container with three metrics in horizontal layout */}
					<div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6">
						<div className="grid grid-cols-3 divide-x divide-gray-200">
							{/* Streak */}
							<div className="text-center">
								<div className="text-3xl font-boldmb-1 text-emerald-600 ">
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
			</div>
		</SectionCard>
	);
}
