import { TrophyIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import { AchievementMeta, AchievementWithProgress } from "@self-learning/types";
import { LoadingBox, SectionHeader, showToast } from "@self-learning/ui/common";
import { useMemo } from "react";
import { AchievementCard, AchievementList, useAchievementRedemption } from "./achievement-card";
import { IdSet } from "@self-learning/util/common";

interface AchievementOverviewProps {
	className?: string;
}

// Semantic clustering strategies for different groups
type SemanticClusterKey = string;

interface ClusterStrategy {
	getClusterKey: (meta: AchievementMeta) => SemanticClusterKey;
}

// Define clustering strategies for each group
const CLUSTER_STRATEGIES: Record<string, ClusterStrategy> = {
	grade_lessons_total: {
		getClusterKey: meta => {
			if (meta.group === "grade_lessons_total") {
				return meta.grade; // Cluster by PERFECT, VERY_GOOD, etc.
			}
			return "default";
		}
	},
	perfect_lessons_serial: {
		getClusterKey: () => "default" // No clustering yet, but extensible for future grade field
	},
	streak: {
		getClusterKey: () => "default"
	},
	focus: {
		getClusterKey: () => "default"
	}
};

// Define the nested structure: Category -> Group -> Cluster -> Achievements
interface NestedAchievements {
	[category: string]: {
		[group: string]: {
			[cluster: SemanticClusterKey]: AchievementWithProgress[];
		};
	};
}

export function AchievementOverview({ className }: AchievementOverviewProps) {
	const { data: achievements, isLoading } = trpc.achievement.getOwnAchievements.useQuery();
	const { handleRedeem } = useAchievementRedemption();

	const nestedAchievements = useMemo(() => {
		if (!achievements) return null;

		// Group by category -> group -> semantic cluster
		const nested = achievements.reduce<NestedAchievements>((acc, achievement) => {
			const category = achievement.category;
			const group = achievement.meta?.group || "default";

			// Get the semantic cluster using the strategy
			const strategy = CLUSTER_STRATEGIES[group] || { getClusterKey: () => "default" };
			const clusterKey = achievement.meta
				? strategy.getClusterKey(achievement.meta)
				: "default";

			// Initialize nested structure
			if (!acc[category]) acc[category] = {};
			if (!acc[category][group]) acc[category][group] = {};
			if (!acc[category][group][clusterKey]) acc[category][group][clusterKey] = [];

			acc[category][group][clusterKey].push({
				...achievement,
				meta: achievement.meta ?? undefined
			});

			return acc;
		}, {});

		// Sort within each cluster
		Object.keys(nested).forEach(category => {
			Object.keys(nested[category]).forEach(group => {
				Object.keys(nested[category][group]).forEach(cluster => {
					nested[category][group][cluster].sort((a, b) => {
						// First sort by state: redeemed > earned > in-progress
						if (a.redeemedAt && !b.redeemedAt) return -1;
						if (!a.redeemedAt && b.redeemedAt) return 1;

						const aCompleted = a.progressValue >= a.requiredValue;
						const bCompleted = b.progressValue >= b.requiredValue;

						if (aCompleted && !bCompleted) return -1;
						if (!aCompleted && bCompleted) return 1;

						// If same state, sort by progress percentage (highest first)
						const aProgress = a.progressValue / a.requiredValue;
						const bProgress = b.progressValue / b.requiredValue;
						return bProgress - aProgress;
					});
				});
			});
		});

		return nested;
	}, [achievements]);

	if (isLoading) {
		return <LoadingBox />;
	}

	if (!nestedAchievements) {
		return (
			<div className={`text-center py-8 ${className || ""}`}>
				<p className="text-gray-500">Keine Errungenschaften gefunden.</p>
			</div>
		);
	}

	return (
		<div className={className}>
			<SectionHeader
				title="Errungenschaften"
				subtitle="Deine Fortschritte und freigeschalteten Erfolge"
			/>

			<div className="space-y-8">
				{Object.entries(nestedAchievements).map(([category, groups]) => (
					<AchievementCategory
						key={category}
						category={category}
						groups={groups}
						onRedeem={handleRedeem}
					/>
				))}
			</div>
		</div>
	);
}

function AchievementCategory({
	category,
	groups,
	onRedeem
}: {
	category: string;
	groups: { [group: string]: { [cluster: string]: AchievementWithProgress[] } };
	onRedeem?: (achievementId: string) => void;
}) {
	// Calculate totals across all groups and clusters in this category
	const allAchievements = Object.values(groups)
		.flatMap(clusters => Object.values(clusters))
		.flat();

	const unlockedCount = allAchievements.filter(a => a.redeemedAt).length;
	const totalCount = allAchievements.length;

	const categoryDisplayName = getCategoryDisplayName(category);

	return (
		<div className="bg-white rounded-lg border border-light-border p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-xl font-semibold flex items-center gap-2">
					<TrophyIcon className="h-6 w-6 text-yellow-500" />
					{categoryDisplayName}
				</h3>
				<div className="text-sm text-gray-500">
					{unlockedCount} von {totalCount} freigeschaltet
				</div>
			</div>

			<div className="space-y-6">
				{Object.entries(groups).map(([groupKey, clusters]) => (
					<AchievementGroup
						key={`${category}-${groupKey}`}
						groupKey={groupKey}
						clusters={clusters}
						onRedeem={onRedeem}
					/>
				))}
			</div>
		</div>
	);
}

function AchievementGroup({
	groupKey,
	clusters,
	onRedeem
}: {
	groupKey: string;
	clusters: { [cluster: string]: AchievementWithProgress[] };
	onRedeem?: (achievementId: string) => void;
}) {
	return (
		<div className="space-y-4">
			{Object.entries(clusters).map(([clusterKey, achievements]) => (
				<AchievementList
					key={`${groupKey}-${clusterKey}`}
					achievements={new IdSet(achievements)}
					onRedeem={onRedeem}
				/>
			))}
		</div>
	);
}

// Helper function to convert category keys to display names
function getCategoryDisplayName(category: string): string {
	const categoryMap: Record<string, string> = {
		streak: "Lernstreak",
		lessons: "Lerneinheiten",
		courses: "Kurse",
		focus: "Fokussiertes Lernen",
		grade_lessons_total: "Leistungsabzeichen",
		perfect_lessons_serial: "Perfektion in Folge",
		general: "Allgemein",
		learning: "Lernen",
		completion: "Abschlüsse"
	};

	return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}
