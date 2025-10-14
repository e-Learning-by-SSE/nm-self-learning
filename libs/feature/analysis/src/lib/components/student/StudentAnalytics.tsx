import { useSession } from "next-auth/react";
import { GeneralHeatmap } from "./GeneralHeatmap";

export default function StudentAnalytics() {
	const { data: session } = useSession();
	const name = session?.user?.name || "Lerner";

	return (
		<div className="p-6">
			<h1 className="text-3xl font-bold text-gray-900 mb-6">
				Willkommen zurück, {name}! Schau dir deinen Lernfortschritt an.
			</h1>

			<div className="grid grid-cols-2 gap-6 mt-4">
				<GeneralHeatmap />
			</div>
		</div>
	);
}
