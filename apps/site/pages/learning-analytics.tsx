import { trpc } from "@self-learning/api-client";

import { LoadingCircle } from "@self-learning/ui/common";
import { UnaryLearningAnalyticsDashboard } from "@self-learning/learning-analytics";

/**
 * Renders the learning analytics dashboard:
 * - Loading screen while fetching data
 * - UnaryLearningAnalyticsDashboard if data is available
 * - Error message if no data is available (should not be possible, only fallback)
 * @returns The learning analytics page
 */
export default function Page() {
	const { data: lASession, isLoading } = trpc.learningAnalytics.findUserSpecific.useQuery();

	if (isLoading) {
		// Loading screen, circle centered based on: https://stackoverflow.com/a/55174568
		return (
			<div className="flex h-screen bg-gray-50">
				<div className="m-auto">
					<LoadingCircle />
				</div>
			</div>
		);
	} else if (lASession) {
		return <UnaryLearningAnalyticsDashboard lASession={lASession} />;
	}

	return (
		<div className="bg-gray-50">
			<p>Keine Daten vorhanden</p>
		</div>
	);
}
