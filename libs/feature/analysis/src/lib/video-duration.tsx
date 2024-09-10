import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { sumByDate, sumByMonth, sumByWeek, toInterval } from "./aggregation-functions";
import { useState } from "react";
import { MetricsViewer } from "./metrics-viewer";
import { computeDuration, MetricResult, MetricResultTemp } from "./metrics";

const PreviewTypes = ["Table", "Chart"];

export function VideoDuration() {
	const [previewSelection, setPreviewSelection] = useState("Table");
	const { data, isLoading } = trpc.events.get.useQuery({
		action: [
			"LESSON_VIDEO_PLAY",
			"LESSON_VIDEO_PAUSE",
			"LESSON_VIDEO_JUMP",
			"LESSON_VIDEO_STOP",
			"LESSON_VIDEO_END",
			"LESSON_VIDEO_SPEED"
		]
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No data</div>;
	}
	const computedData = computeDuration(data, [0.5, 0.75, 1, 1.5, 2]);

	// TODO Refactor transformed should be the result of computeDuration, but hard to debug
	const transformed = computedData.map(event => {
		const { createdAt, totalWatchTime, speed, effectivelyWatched, watchedAtSpeed } = event;
		const result: Record<string, number> = {
			totalWatchTime,
			speed,
			effectivelyWatched,
			...watchedAtSpeed
		};
		return { createdAt, values: result };
	});

	const filteredData = transformed.filter((event, index) => {
		if (index < transformed.length - 1) {
			const next = transformed[index + 1];
			// Keep only if next one belongs to a new data series -> watch time is reset
			if (next.values["totalWatchTime"] < event.values["totalWatchTime"]) {
				return true;
			}
		}
		if (index === transformed.length - 1) {
			return true;
		}
		return false;
	});

	const dailyData = sumByDate(filteredData);
	const weeklyData = sumByWeek(filteredData);
	const monthlyData = sumByMonth(filteredData);

	return (
		<>
			<select
				className="px-7 py-2 rounded  bg-rose-100"
				onChange={e => setPreviewSelection(e.target.value)}
				value={previewSelection}
			>
				{PreviewTypes.map(type => (
					<option key={type} className="text-base font-sans" value={type}>
						{type}
					</option>
				))}
			</select>

			{previewSelection === "Table" ? (
				<TableData
					computedData={computedData}
					filteredData={filteredData}
					dailyData={dailyData}
					weeklyData={weeklyData}
					monthlyData={monthlyData}
				/>
			) : null}
			{previewSelection !== "Table" ? (
				<MetricsViewer
					data={filteredData}
					metric="totalWatchTime"
					valueFormatter={toInterval}
				/>
			) : null}
		</>
	);
}

// Only for development / debugging
function TableData({
	computedData,
	filteredData,
	dailyData,
	weeklyData,
	monthlyData
}: {
	computedData: MetricResultTemp[];
	filteredData: MetricResult[];
	dailyData: MetricResult[];
	weeklyData: MetricResult[];
	monthlyData: MetricResult[];
}) {
	return (
		<>
			<h1 className="text-center text-3xl">Video Duration</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>Action</TableHeaderColumn>
						<TableHeaderColumn>ResourceID</TableHeaderColumn>
						<TableHeaderColumn>PayLoad</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
						<TableHeaderColumn>Speed</TableHeaderColumn>
						<TableHeaderColumn>Eff. WatchTime</TableHeaderColumn>
						<TableHeaderColumn>≤ 0,5</TableHeaderColumn>
						<TableHeaderColumn>0,75</TableHeaderColumn>
						<TableHeaderColumn>1</TableHeaderColumn>
						<TableHeaderColumn>1,5</TableHeaderColumn>
						<TableHeaderColumn>≥ 2</TableHeaderColumn>
						<TableHeaderColumn>Andere</TableHeaderColumn>
					</>
				}
			>
				{computedData.map(event => (
					<tr key={event.id}>
						<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>{event.action}</TableDataColumn>
						<TableDataColumn>{event.resourceId}</TableDataColumn>
						<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
						<TableDataColumn>
							{(event.totalWatchTime / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{event.speed}</TableDataColumn>
						<TableDataColumn>
							{(event.effectivelyWatched / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>
							{(event.watchedAtSpeed["0.5"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>
							{(event.watchedAtSpeed["0.75"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>
							{(event.watchedAtSpeed["1"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>
							{(event.watchedAtSpeed["1.5"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>
							{(event.watchedAtSpeed["2"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>
							{(event.watchedAtSpeed["other"] / 1000).toFixed(2)}
						</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Aggregierte Daten (pro Video)</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
						<TableHeaderColumn>Speed</TableHeaderColumn>
						<TableHeaderColumn>Eff. WatchTime</TableHeaderColumn>
						<TableHeaderColumn>≤ 0,5</TableHeaderColumn>
						<TableHeaderColumn>0,75</TableHeaderColumn>
						<TableHeaderColumn>1</TableHeaderColumn>
						<TableHeaderColumn>1,5</TableHeaderColumn>
						<TableHeaderColumn>≥ 2</TableHeaderColumn>
						<TableHeaderColumn>Andere</TableHeaderColumn>
					</>
				}
			>
				{filteredData.map(event => (
					<tr>
						<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>
							{(event.values["totalWatchTime"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{event.values["speed"]}</TableDataColumn>
						<TableDataColumn>
							{(event.values["effectivelyWatched"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{(event.values["0.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>
							{(event.values["0.75"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{(event.values["1"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(event.values["1.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(event.values["2"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>
							{(event.values["other"] / 1000).toFixed(2)}
						</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Tägliche Werte</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
						<TableHeaderColumn>Speed</TableHeaderColumn>
						<TableHeaderColumn>Eff. WatchTime</TableHeaderColumn>
						<TableHeaderColumn>≤ 0,5</TableHeaderColumn>
						<TableHeaderColumn>0,75</TableHeaderColumn>
						<TableHeaderColumn>1</TableHeaderColumn>
						<TableHeaderColumn>1,5</TableHeaderColumn>
						<TableHeaderColumn>≥ 2</TableHeaderColumn>
						<TableHeaderColumn>Andere</TableHeaderColumn>
					</>
				}
			>
				{dailyData.map(day => (
					<tr>
						<TableDataColumn>{day.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>
							{(day.values["totalWatchTime"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{day.values["speed"]}</TableDataColumn>
						<TableDataColumn>
							{(day.values["effectivelyWatched"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{(day.values["0.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(day.values["0.75"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(day.values["1"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(day.values["1.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(day.values["2"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(day.values["other"] / 1000).toFixed(2)}</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Wöchentliche Werte</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
						<TableHeaderColumn>Speed</TableHeaderColumn>
						<TableHeaderColumn>Eff. WatchTime</TableHeaderColumn>
						<TableHeaderColumn>≤ 0,5</TableHeaderColumn>
						<TableHeaderColumn>0,75</TableHeaderColumn>
						<TableHeaderColumn>1</TableHeaderColumn>
						<TableHeaderColumn>1,5</TableHeaderColumn>
						<TableHeaderColumn>≥ 2</TableHeaderColumn>
						<TableHeaderColumn>Andere</TableHeaderColumn>
					</>
				}
			>
				{weeklyData.map(week => (
					<tr>
						<TableDataColumn>{week.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>
							{(week.values["totalWatchTime"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{week.values["speed"]}</TableDataColumn>
						<TableDataColumn>
							{(week.values["effectivelyWatched"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{(week.values["0.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(week.values["0.75"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(week.values["1"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(week.values["1.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(week.values["2"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>
							{(week.values["other"] / 1000).toFixed(2)}
						</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Monatliche Werte</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
						<TableHeaderColumn>Speed</TableHeaderColumn>
						<TableHeaderColumn>Eff. WatchTime</TableHeaderColumn>
						<TableHeaderColumn>≤ 0,5</TableHeaderColumn>
						<TableHeaderColumn>0,75</TableHeaderColumn>
						<TableHeaderColumn>1</TableHeaderColumn>
						<TableHeaderColumn>1,5</TableHeaderColumn>
						<TableHeaderColumn>≥ 2</TableHeaderColumn>
						<TableHeaderColumn>Andere</TableHeaderColumn>
					</>
				}
			>
				{monthlyData.map(month => (
					<tr>
						<TableDataColumn>{month.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>
							{(month.values["totalWatchTime"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{month.values["speed"]}</TableDataColumn>
						<TableDataColumn>
							{(month.values["effectivelyWatched"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{(month.values["0.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>
							{(month.values["0.75"] / 1000).toFixed(2)}
						</TableDataColumn>
						<TableDataColumn>{(month.values["1"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(month.values["1.5"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>{(month.values["2"] / 1000).toFixed(2)}</TableDataColumn>
						<TableDataColumn>
							{(month.values["other"] / 1000).toFixed(2)}
						</TableDataColumn>
					</tr>
				))}
			</Table>
		</>
	);
}
