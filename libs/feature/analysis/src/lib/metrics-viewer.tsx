import { useState } from "react";
import {
	MetricData,
	NumericProperty,
	sumByDate,
	sumByWeek,
	toInterval
} from "./aggregation-functions";
import { DailyPlot, WeeklyPlot } from "./unary-charts";

const options = ["Täglich", "Wöchentlich"] as const;
type OptionsType = (typeof options)[number];

export function MetricsViewer<T extends MetricData>({
	data,
	metric
}: {
	data: T[];
	metric: NumericProperty<T>;
}) {
	const [selectedOption, setOption] = useState<OptionsType>("Täglich");

	// TODO refactor
	const dailyData = sumByDate(data, metric);
	const weeklyData = sumByWeek(data, metric);
	const dailyAverage = toInterval(
		Object.values(dailyData).reduce((acc, curr) => acc + curr, 0) /
			Object.keys(dailyData).length
	);
	const weeklyAverage = toInterval(
		Object.values(weeklyData).reduce((acc, curr) => acc + curr, 0) /
			Object.keys(weeklyData).length
	);

	return (
		<>
			<p>
				Deine durchschnittliche Lernzeit beträgt{" "}
				<span className="font-italic font-medium">{dailyAverage}</span> pro Tag, bzw.
				wöchentlich lernst du{" "}
				<span className="font-italic font-medium">{weeklyAverage}</span> auf der Plattform.
			</p>

			<div className="relative w-full h-screen">
				<Chart weeklyData={weeklyData} dailyData={dailyData} option={selectedOption} />

				<select
					className="absolute top-0 right-5 m-2 p-1 bg-white border border-gray-300 rounded shadow-md"
					onChange={e => setOption(e.target.value as OptionsType)}
				>
					{options.map(option => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</div>
		</>
	);
}

function Chart({
	dailyData,
	weeklyData,
	option
}: {
	dailyData: Record<string, number>;
	weeklyData: Record<string, number>;
	option: OptionsType;
}) {
	switch (option) {
		case "Täglich":
			return <DailyPlot data={dailyData} label="Tägliche Lernzeit" />;
		case "Wöchentlich":
			return <WeeklyPlot data={weeklyData} label="Wöchentliche Lernzeit" />;
		default:
			return <p>Fehler: Keine Analyse ausgewählt</p>;
	}
}
