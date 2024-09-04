import { useState } from "react";
import {
	MetricData,
	NumericProperty,
	sumByDate,
	sumByMonth,
	sumByWeek,
	toInterval
} from "./aggregation-functions";
import { DailyPlot, MonthlyPlot, WeeklyPlot } from "./unary-charts";

const options = ["Täglich", "Wöchentlich", "Monatlich"] as const;
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
	const monthlyData = sumByMonth(data, metric);
	const dailyAverage = toInterval(
		dailyData.reduce((acc, curr) => acc + curr.value, 0) / dailyData.length
	);
	const weeklyAverage = toInterval(
		weeklyData.reduce((acc, curr) => acc + curr.value, 0) / dailyData.length
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
				<Chart
					weeklyData={weeklyData}
					dailyData={dailyData}
					monthlyData={monthlyData}
					option={selectedOption}
				/>

				<div className="absolute top-10 right-10 m-2 p-1 rounded">
					{options.map(option => (
						<button
							key={option}
							onClick={() => setOption(option)}
							className={`px-8 py-2 border rounded text-xs font-semibold ${
								selectedOption === option
									? " bg-emerald-500   text-white"
									: "bg-gray-200 text-gray-600"
							}`}
						>
							{option}
						</button>
					))}
				</div>
			</div>
		</>
	);
}

function Chart({
	dailyData,
	weeklyData,
	monthlyData,
	option
}: {
	dailyData: { date: string; value: number }[];
	weeklyData: { date: string; value: number }[];
	monthlyData: { date: string; value: number }[];
	option: OptionsType;
}) {
	switch (option) {
		case "Täglich":
			return <DailyPlot data={dailyData} label="Tägliche Lernzeit" />;
		case "Wöchentlich":
			return <WeeklyPlot data={weeklyData} label="Wöchentliche Lernzeit" />;
		case "Monatlich":
			return <MonthlyPlot data={monthlyData} label="Monatliche Lernzeit" />;
		default:
			return <p>Fehler: Keine Analyse ausgewählt</p>;
	}
}
