import { useState } from "react";
import { sumByDate, sumByMonth, sumByWeek } from "../aggregation-functions";
import { DailyPlot, MonthlyPlot, WeeklyPlot } from "./unary-charts";
import { MetricResult } from "../metrics/types";

const options = ["Täglich", "Wöchentlich", "Monatlich"] as const;
type OptionsType = (typeof options)[number];

export function MetricsViewer({
	data,
	metric,
	valueFormatter
}: {
	data: MetricResult[];
	metric: string;
	valueFormatter?: (value: number) => string;
}) {
	const [selectedOption, setOption] = useState<OptionsType>("Täglich");

	// TODO refactor
	const dailyData = sumByDate(data);
	const weeklyData = sumByWeek(data);
	const monthlyData = sumByMonth(data);
	const dailyAverageValue =
		dailyData.reduce((acc, curr) => acc + curr.values[metric], 0) / dailyData.length;
	const dailyAverage = valueFormatter
		? valueFormatter(dailyAverageValue)
		: dailyAverageValue.toString();

	const weeklyAverageValue =
		weeklyData.reduce((acc, curr) => acc + curr.values[metric], 0) / weeklyData.length;
	const weeklyAverage = valueFormatter
		? valueFormatter(weeklyAverageValue)
		: weeklyAverageValue.toString();

	return (
		<>
			<p>
				Deine durchschnittliche Lernzeit beträgt{" "}
				<span className="font-italic font-medium">{dailyAverage}</span> pro Tag, bzw.
				wöchentlich lernst du{" "}
				<span className="font-italic font-medium">{weeklyAverage}</span> auf der Plattform.
			</p>

			<div className="relative w-full">
				<Chart
					weeklyData={weeklyData}
					dailyData={dailyData}
					monthlyData={monthlyData}
					metric={metric}
					option={selectedOption}
				/>

				<div className="absolute top-10 right-10 m-2 p-1 rounded">
					{options.map(option => (
						<button
							key={option}
							onClick={() => setOption(option)}
							className={`px-8 py-2 border rounded text-xs font-semibold ${
								selectedOption === option
									? " bg-c-primary   text-white"
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
	metric,
	option
}: {
	dailyData: MetricResult[];
	weeklyData: MetricResult[];
	monthlyData: MetricResult[];
	metric: string;
	option: OptionsType;
}) {
	switch (option) {
		case "Täglich":
			return <DailyPlot data={dailyData} label="Tägliche Lernzeit" metric={metric} />;
		case "Wöchentlich":
			return <WeeklyPlot data={weeklyData} label="Wöchentliche Lernzeit" metric={metric} />;
		case "Monatlich":
			return <MonthlyPlot data={monthlyData} label="Monatliche Lernzeit" metric={metric} />;
		default:
			return <p>Fehler: Keine Analyse ausgewählt</p>;
	}
}
