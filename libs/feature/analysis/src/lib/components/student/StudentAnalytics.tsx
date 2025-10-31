import { useSession } from "next-auth/react";
import { GeneralHeatmap } from "./GeneralHeatmap";
import { MyLearningPath } from "./MyLearningPath";
import { TimeAllocation } from "./TimeAllocation";
import { Feedback } from "./Feedback";
import { useTranslation } from "next-i18next";

export default function StudentAnalytics() {
	const { data: session } = useSession();
	const { t } = useTranslation("student-analytics");

	// Default name fallback from translation
	const name = session?.user?.name || t("defaultName");

	return (
		<div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
			{/* Responsive heading */}
			<h1
				id="student-analytics-title"
				className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center sm:text-left mt-6 mb-8 leading-snug"
			>
				{t("pageTitle", { name })}
			</h1>

			{/* Grid layout for components (this remains unchanged) */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Top-Left: Mein Lernpfad */}
				<MyLearningPath />

				{/* Top-Right: Personalisierte Empfehlungen */}
				<Feedback />

				{/* Bottom-Left: Studien-Heatmaps */}
				<GeneralHeatmap />

				{/* Bottom-Right: Zeitliche Verteilung */}
				<TimeAllocation />
			</div>
		</div>
	);
}
