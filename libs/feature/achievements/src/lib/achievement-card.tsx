import { CheckCircleIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { AchievementWithProgress } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { IdSet } from "@self-learning/util/common";

export function AchievementCard({
	achievement,
	onRedeem
}: {
	achievement: AchievementWithProgress;
	onRedeem?: (achievementId: string) => void;
}) {
	// Calculate progress percentage for the progress bar
	const progressPercentage = Math.min(
		(achievement.progressValue / achievement.requiredValue) * 100,
		100
	);

	// Determine the achievement state
	const isCompleted = achievement.progressValue >= achievement.requiredValue;
	const isRedeemed = achievement.redeemedAt !== null;
	const isRedeemable = isCompleted && !isRedeemed;

	// An achievement is "earned but not redeemed" if it's completed but not redeemed
	const isEarnedNotRedeemed = isCompleted && !isRedeemed;

	// Card styling based on achievement state
	let cardClassName: string;
	if (isRedeemed) {
		cardClassName = "border-green-200 bg-green-50";
	} else if (isEarnedNotRedeemed) {
		cardClassName = "border-purple-200 bg-purple-100";
	} else {
		cardClassName = "border-gray-200 bg-gray-100 opacity-70";
	}
	return (
		<div className={`p-4 rounded-lg border ${cardClassName}`}>
			<div className="flex items-start">
				{isRedeemed ? (
					<CheckCircleIcon className=" w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
				) : isEarnedNotRedeemed ? (
					<TrophyIcon className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" />
				) : (
					<TrophyIcon className="w-6 h-6 text-gray-400 mr-2 flex-shrink-0" />
				)}
				<div className="flex-1">
					<h4 className="font-semibold">{achievement.title}</h4>
					<p className="text-sm text-gray-600">{achievement.description}</p>
				</div>
			</div>

			{/* Show progress bar for in-progress achievements */}
			{!isCompleted && (
				<div className="mt-3">
					<div className="w-full bg-gray-200 rounded-full h-2.5">
						<div
							className="bg-blue-500 h-2.5 rounded-full"
							style={{ width: `${progressPercentage}%` }}
						></div>
					</div>
					<p className="text-xs text-gray-500 mt-1">
						{achievement.progressValue}/{achievement.requiredValue}
					</p>
				</div>
			)}

			{/* Show redeem button for earned but not redeemed achievements */}
			{isRedeemable && onRedeem && (
				<button
					onClick={() => onRedeem(achievement.id)}
					className="btn-gamify animate-highlight-shimmering mt-3 w-full"
					// className="mt-3 w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors duration-200 animate-highlight-shimmering"
				>
					Einlösen
				</button>
			)}
		</div>
	);
}

export function AchievementList({
	achievements,
	onRedeem
}: {
	achievements: IdSet<AchievementWithProgress>;
	onRedeem?: (achievementId: string) => void;
}) {
	if (achievements.size === 0) return null;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{achievements.values().map(achievement => (
				<AchievementCard
					key={achievement.id}
					achievement={achievement}
					onRedeem={onRedeem}
				/>
			))}
		</div>
	);
}

export function AchievementSection({
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

// Hook to handle achievement redemption within a component
export function useAchievementRedemption() {
	const utils = trpc.useUtils();
	const { mutateAsync: redeemAchievement } = trpc.achievement.redeemAchievement.useMutation({
		onSuccess: () => {
			// Invalidate relevant queries to refresh the data
			utils.achievement.getOwnAchievements.invalidate();
			utils.achievement.getOverviewStats.invalidate();
		}
	});

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

	return { handleRedeem };
}
