import { TrophyIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import { LoadingBox, showToast } from "@self-learning/ui/common";
import { IdSet } from "@self-learning/util/common";
import { AchievementList } from "../../../../achievements/src/lib/achievement-card";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface DashboardAchievementsSectionProps {
	className?: string;
}

export function DashboardAchievementsSection({ className }: DashboardAchievementsSectionProps) {
	const { data: achievements, isLoading } = trpc.achievement.getOwnAchievements.useQuery();
	const { data: stats } = trpc.achievement.getOverviewStats.useQuery();
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
		return <LoadingBox height={200} />;
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
		<div className={`bg-white rounded-lg shadow p-6 ${className || ""}`}>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<TrophyIcon className="h-6 w-6 text-yellow-500" />
					<h2 className="text-lg font-semibold">Errungenschaften</h2>
				</div>
				<Link
					href="/profile/achievements"
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

			{/* Redeemable Achievements */}
			{redeemable.length > 0 && (
				<div className="mb-4">
					<h3 className="text-sm font-medium text-gray-700 mb-2">Bereit zum Einlösen</h3>
					<AchievementList
						achievements={new IdSet(redeemable.slice(0, 2))}
						onRedeem={handleRedeem}
					/>

					{redeemable.length > 2 && (
						<Link
							href="/profile/achievements"
							className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
						>
							{redeemable.length - 2} weitere einlösen
							<ChevronRightIcon className="h-4 w-4" />
						</Link>
					)}
				</div>
			)}

			{/* Redeemed Achievements */}
			{redeemed.length > 0 && (
				<div className="mb-4">
					<h3 className="text-sm font-medium text-gray-700 mb-2">Freigeschaltet</h3>
					<AchievementList achievements={new IdSet(redeemed.slice(0, 2))} />
				</div>
			)}

			{/* In-Progress Achievements */}
			{inProgress.length > 0 && (
				<div>
					<h3 className="text-sm font-medium text-gray-700 mb-2">In Bearbeitung</h3>
					<AchievementList achievements={new IdSet(inProgress)} />
				</div>
			)}

			{/* Empty state */}
			{redeemable.length === 0 && redeemed.length === 0 && inProgress.length === 0 && (
				<div className="text-center py-8 text-gray-500">
					<TrophyIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
					<p>Noch keine Errungenschaften freigeschaltet</p>
					<p className="text-sm">Lerne weiter, um deine ersten Erfolge zu erzielen!</p>
				</div>
			)}
		</div>
	);
}
