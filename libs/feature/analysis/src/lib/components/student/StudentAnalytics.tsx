import { GeneralHeatmap } from "./GeneralHeatmap";

export default function StudentAnalytics() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">Student Learning Analytics</h1>

			<div className="grid grid-cols-2 gap-6">
				<GeneralHeatmap />
			</div>
		</div>
	);
}
