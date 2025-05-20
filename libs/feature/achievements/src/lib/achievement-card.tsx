import { CheckCircleIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { AchievementWithProgress } from "@self-learning/types";
import { IdSet } from "@self-learning/util/common";

// export function AchievementCard({
// 	achievement,
// 	isUnlocked,
// 	isJustEarned = false
// }: {
// 	achievement: AchievementDb;
// 	isUnlocked: boolean;
// 	isJustEarned?: boolean;
// }) {
// 	return (
// 		<div
// 			className={`p-3 rounded-lg border ${
// 				isUnlocked
// 					? "border-green-200 bg-green-50"
// 					: "border-gray-200 bg-gray-100 opacity-70"
// 			} ${isJustEarned ? "ring-2 ring-yellow-400 animate-pulse" : ""}`}
// 		>
// 			<div className="flex items-start">
// 				{isUnlocked ? (
// 					<CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
// 				) : (
// 					<TrophyIcon className="w-6 h-6 text-gray-400 mr-2 flex-shrink-0" />
// 				)}
// 				<div>
// 					<h4 className="font-semibold">{achievement.title}</h4>
// 					<p className="text-sm text-gray-600">{achievement.description}</p>
// 					{isJustEarned && (
// 						<span className="text-xs text-yellow-600 font-semibold">
// 							Neu freigeschaltet!
// 						</span>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	);
// }

export function AchievementCard({
	achievement,
	isUnlocked,
	isJustEarned = false,
	showProgress = false
}: {
	achievement: AchievementWithProgress;
	isUnlocked: boolean;
	isJustEarned?: boolean;
	showProgress?: boolean;
}) {
	const progressPercentage = Math.min(
		(achievement.progressValue / achievement.requiredValue) * 100,
		100
	);

	return (
		<div
			className={`p-4 rounded-lg border ${
				isUnlocked
					? "border-green-200 bg-green-50"
					: "border-gray-200 bg-gray-100 opacity-70"
			} ${isJustEarned ? "ring-2 ring-yellow-400 animate-pulse" : ""}`}
		>
			<div className="flex items-start">
				{isUnlocked ? (
					<CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
				) : (
					<TrophyIcon className="w-6 h-6 text-gray-400 mr-2 flex-shrink-0" />
				)}
				<div>
					<h4 className="font-semibold">{achievement.title}</h4>
					<p className="text-sm text-gray-600">{achievement.description}</p>
					{isJustEarned && (
						<span className="text-xs text-yellow-600 font-semibold">
							Neu freigeschaltet!
						</span>
					)}
				</div>
			</div>
			{showProgress && !isUnlocked && (
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
		</div>
	);
}

export function AchievementList({
	achievements,
	earnedAchievements = new IdSet(),
	newlyEarnedAchievements = new IdSet(),
	showProgress = false
}: {
	achievements: IdSet<AchievementWithProgress>;
	earnedAchievements?: IdSet;
	newlyEarnedAchievements?: IdSet;
	showProgress?: boolean;
}) {
	if (achievements.size === 0) return null;

	return (
		<div className="grid grid-cols-1 gap-4">
			{achievements.values().map(achievement => (
				<AchievementCard
					key={achievement.id}
					achievement={achievement}
					isUnlocked={earnedAchievements.has(achievement)}
					isJustEarned={newlyEarnedAchievements.has(achievement)}
					showProgress={showProgress}
				/>
			))}
		</div>
	);
}

export function AchievementSection({
	achievements,
	earnedAchievements,
	newlyEarnedAchievements
}: {
	achievements: IdSet<AchievementWithProgress>;
	earnedAchievements?: IdSet;
	newlyEarnedAchievements?: IdSet;
}) {
	if (achievements.size === 0) return null;

	return (
		<div className="bg-gray-50 p-4 rounded-lg">
			<h3 className="font-bold text-lg mb-4 flex items-center">
				<TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
				Errungenschaften
			</h3>
			<AchievementList
				achievements={achievements}
				earnedAchievements={earnedAchievements}
				newlyEarnedAchievements={newlyEarnedAchievements}
				showProgress={true}
			/>
		</div>
	);
}
