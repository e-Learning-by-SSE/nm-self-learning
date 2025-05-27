"use client";
import { CheckCircleIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { AchievementWithProgress } from "@self-learning/types";
import { FireworkOnClick, showToast } from "@self-learning/ui/common";
import { IdSet } from "@self-learning/util/common";
import { useEffect, useState } from "react";

export function AchievementCard({
	achievement,
	animateProgress = false,
	onRedeem
}: {
	achievement: AchievementWithProgress;
	animateProgress?: boolean; // Optional prop to control progress bar animation
	onRedeem?: (achievementId: string) => void;
}) {
	// State for progress animation
	const [animatedProgress, setAnimatedProgress] = useState(0);
	const [showProgressText, setShowProgressText] = useState(false);

	// Calculate progress percentage for the progress bar
	const progressPercentage = Math.min(
		(achievement.progressValue / achievement.requiredValue) * 100,
		100
	);

	// Determine the achievement state
	const isCompleted = achievement.progressValue >= achievement.requiredValue;
	const isRedeemed = !!achievement.redeemedAt;
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

	// Animation effect for progress bar
	useEffect(() => {
		if (animateProgress && !isCompleted) {
			// Start from 0 and animate to current progress
			setAnimatedProgress(0);
			setShowProgressText(false);

			// Small delay before starting animation
			const startDelay = setTimeout(() => {
				setAnimatedProgress(progressPercentage);

				// Show progress text after animation starts
				const textDelay = setTimeout(() => {
					setShowProgressText(true);
				}, 200);

				return () => clearTimeout(textDelay);
			}, 100);

			return () => clearTimeout(startDelay);
		} else {
			// No animation - show final state immediately
			setAnimatedProgress(progressPercentage);
			setShowProgressText(true);
		}
	}, [animateProgress, progressPercentage, isCompleted]);

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
					<p className="text-sm text-gray-600">{achievement.description}</p>
				</div>
			</div>

			{/* Show progress bar for in-progress achievements */}
			{!isCompleted && (
				<div className="mt-3">
					<div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
						<div
							className={`h-2.5 rounded-full ${
								animateProgress
									? "bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
									: "bg-blue-500"
							}`}
							style={{
								width: `${animatedProgress}%`,
								transition: animateProgress ? "width 1s ease-out" : "none"
							}}
						/>
						{/* Shimmer effect during animation */}
						{animateProgress && animatedProgress < progressPercentage && (
							<div
								className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-highlight-shimmering"
								style={{ width: `${animatedProgress}%` }}
							/>
						)}
					</div>
					<p
						className={`text-xs text-gray-500 mt-1 transition-opacity duration-300 ${
							showProgressText ? "opacity-100" : "opacity-0"
						}`}
					>
						{achievement.progressValue}/{achievement.requiredValue}
					</p>
				</div>
			)}

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
