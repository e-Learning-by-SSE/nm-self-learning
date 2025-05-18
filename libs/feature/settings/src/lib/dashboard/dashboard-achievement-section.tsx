import { ChevronRightIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import { LoadingBox } from "@self-learning/ui/common";
import Link from "next/link";
import { AchievementList } from "../achievements/achievement-card";
import { IdSet } from "@self-learning/util/common";

interface DashboardAchievementsSectionProps {
	className?: string;
}

export function DashboardAchievementsSection({ className }: DashboardAchievementsSectionProps) {
	const { data: achievements, isLoading } = trpc.achievement.getOwnAchievements.useQuery();
	const { data: stats } = trpc.achievement.getOverviewStats.useQuery();

	if (isLoading) {
		return <LoadingBox height={200} />;
	}
	const earnedAchievements = new IdSet(
		achievements?.filter(a => a.progressValue >= a.requiredValue).slice(0, 2) || []
	);
	const inProgressAchievements = new IdSet(
		achievements
			?.filter(a => a.progressValue < a.requiredValue && a.progressValue > 0)
			.slice(0, 2) || []
	);

	return (
		<div className={`bg-white rounded-lg shadow p-6 ${className || ""}`}>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2 ">
					<TrophyIcon className="h-6 w-6 text-yellow-500" />
					<h2 className="text-lg font-semibold">Errungenschaften</h2>
				</div>
				<Link
					href="/dashboard/achievements"
					className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
				>
					Alle anzeigen
					<ChevronRightIcon className="h-4 w-4" />
				</Link>
			</div>

			{stats && (
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div className="text-center p-3 bg-green-50 rounded-lg">
						<div className="text-2xl font-bold text-green-600">{stats.unlocked}</div>
						<div className="text-sm text-green-700">Freigeschaltet</div>
					</div>
					<div className="text-center p-3 bg-blue-50 rounded-lg">
						<div className="text-2xl font-bold text-blue-600">{stats.total}</div>
						<div className="text-sm text-blue-700">Insgesamt</div>
					</div>
				</div>
			)}

			<div className="space-y-4">
				{earnedAchievements.size > 0 && (
					<div>
						<h3 className="text-sm font-medium text-gray-700 mb-2">
							Kürzlich freigeschaltet
						</h3>
						<AchievementList
							achievements={earnedAchievements}
							earnedAchievements={earnedAchievements}
							showProgress={false}
						/>
					</div>
				)}

				{inProgressAchievements.size > 0 && (
					<div>
						<h3 className="text-sm font-medium text-gray-700 mb-2">In Bearbeitung</h3>
						<AchievementList
							achievements={inProgressAchievements}
							showProgress={true}
						/>
					</div>
				)}

				{earnedAchievements.size === 0 && inProgressAchievements.size === 0 && (
					<div className="text-center py-8 text-gray-500">
						<TrophyIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
						<p>Noch keine Errungenschaften freigeschaltet</p>
						<p className="text-sm">
							Lerne weiter, um deine ersten Erfolge zu erzielen!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
