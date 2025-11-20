"use client";
import { CheckCircleIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { AchievementWithProgress } from "@self-learning/types";
import { FireworkOnClick, ProgressBar, showToast } from "@self-learning/ui/common";
import { IdSet } from "@self-learning/util/common";
import { ReactElement } from "react";

function DefaultAchievementProgressBar({
	progressPercentage,
	achievement
}: {
	progressPercentage: number;
	achievement: AchievementWithProgress;
}) {
	return (
		<div className="mt-3">
			<ProgressBar
				progressPercentage={Math.round(progressPercentage)}
				// text={`${achievement.progressValue}/${achievement.requiredValue}`}
				bgColor="bg-blue-500"
			/>
			<p className="text-xs text-gray-500 mt-1">
				{achievement.progressValue}/{achievement.requiredValue}
			</p>
		</div>
	);
}

export function AchievementCard({
	achievement,
	showDescription = true,
	progressBar,
	onRedeem
}: {
	achievement: AchievementWithProgress;
	showDescription?: boolean;
	progressBar?: ReactElement | null;
	onRedeem?: (achievementId: string) => void;
}) {
	// Calculate progress percentage for the progress bar
	const progressPercentage = Math.min(
		(achievement.progressValue / achievement.requiredValue) * 100,
		100
	);

	// Determine the achievement state
	const isCompleted = achievement.progressValue >= achievement.requiredValue;
	const isRedeemed = !!achievement.redeemedAt;
	const isRedeemable = isCompleted && !isRedeemed;
	const isEarnedNotRedeemed = isCompleted && !isRedeemed;

	// Card styling based on achievement state
	let cardClassName: string;
	if (isRedeemed) {
		cardClassName = "border-green-200 bg-green-50";
	} else if (isEarnedNotRedeemed) {
		cardClassName = "border-purple-200 bg-purple-100";
	} else {
		cardClassName = "border-c-border bg-c-surface-2 opacity-70";
	}

	// Use custom progress bar if provided, otherwise use default
	const ProgressBarComponent = progressBar || (
		<DefaultAchievementProgressBar
			progressPercentage={progressPercentage}
			achievement={achievement}
		/>
	);

	return (
		<div className={`p-4 rounded-lg border ${cardClassName}`}>
			<div className="flex items-start">
				{isRedeemed ? (
					<CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
				) : isEarnedNotRedeemed ? (
					<TrophyIcon className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" />
				) : (
					<TrophyIcon className="w-6 h-6 text-gray-400 mr-2 flex-shrink-0" />
				)}
				<div className="flex-1">
					<h4 className="font-semibold">{achievement.title}</h4>
					{showDescription && (
						<p className="text-sm text-gray-600">{achievement.description}</p>
					)}
				</div>
			</div>

			{/* Show progress bar for in-progress achievements */}
			{!isCompleted && ProgressBarComponent}

			{/* Show redeem button for earned but not redeemed achievements */}
			<FireworkOnClick>
				{isRedeemable && onRedeem && (
					<button
						onClick={() => onRedeem(achievement.id)}
						className="btn-gamify animate-highlight-shimmering mt-3 w-full"
					>
						Einlösen
					</button>
				)}
			</FireworkOnClick>
		</div>
	);
}

export function AchievementList({
	achievements,
	onRedeem
}: {
	achievements:
		| IdSet<AchievementWithProgress>
		| AchievementWithProgress[] /* for sorted arrays */;
	onRedeem?: (achievementId: string) => void;
}) {
	// Support both IdSet and array input using a union
	const achievementsArray = Array.isArray(achievements)
		? achievements
		: Array.from(achievements.values());

	if (achievementsArray.length === 0) return null;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{achievementsArray.map(achievement => (
				<AchievementCard
					key={achievement.id}
					achievement={achievement}
					onRedeem={onRedeem}
				/>
			))}
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
