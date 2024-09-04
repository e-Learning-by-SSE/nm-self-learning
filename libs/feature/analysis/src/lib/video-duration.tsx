import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { sumByDate, sumByMonth, sumByWeek } from "./aggregation-functions";
import { useState } from "react";
import { UserEvent } from "@self-learning/database";
import { MetricsViewer } from "./metrics-viewer";

const PreviewTypes = ["Table", "Chart"];

function computeDuration(events: UserEvent[]) {
	// Filter out cases where the user manually moves the slider
	events = events.filter((event, index) => {
		if (event.action === "VIDEO_JUMP" && index < events.length - 1) {
			const next = events[index + 1];
			// SKIP Jump if next event is also a JUMP (user just moved the slider)
			if (next.action === "VIDEO_JUMP") {
				return false;
			}
		}
		return true;
	});

	let totalWatchTime = 0;
	let start: number | undefined = undefined;
	const data = events.map(event => {
		if (event.action === "VIDEO_PLAY") {
			start = new Date(event.createdAt).getTime();
		}
		if (event.action === "VIDEO_JUMP") {
			if (start) {
				const watchTime = new Date(event.createdAt).getTime() - start;
				totalWatchTime += watchTime;
			}
			start = new Date(event.createdAt).getTime();
			return { ...event, totalWatchTime };
		}
		if (event.action === "VIDEO_PAUSE" || event.action === "VIDEO_STOP") {
			if (!start) {
				return { ...event, totalWatchTime };
			}
			const watchTime = new Date(event.createdAt).getTime() - start;
			totalWatchTime += watchTime;
			start = undefined;
			return { ...event, totalWatchTime };
		}
		if (event.action === "VIDEO_END") {
			// Reset computation
			if (start) {
				const watchTime = new Date(event.createdAt).getTime() - start;
				totalWatchTime += watchTime;
			}
			const result = { ...event, totalWatchTime };
			start = undefined;
			totalWatchTime = 0;
			return result;
		}

		return { ...event, totalWatchTime };
	});
	return data;
}

export function VideoDuration() {
	const [previewSelection, setPreviewSelection] = useState("Table");
	const { data, isLoading } = trpc.events.get.useQuery({
		action: [
			"VIDEO_PLAY",
			"VIDEO_PAUSE",
			"VIDEO_JUMP",
			"VIDEO_STOP",
			"VIDEO_END"
			// "VIDEO_OPENED",
			// "VIDEO_START",
			// "VIDEO_RESOLUTION",
		]
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No data</div>;
	}
	const computedData = computeDuration(data);
	const filteredData = computedData.filter((event, index) => {
		if (index < computedData.length - 1) {
			const next = computedData[index + 1];
			// Keep only if next one belongs to a new data series -> watch time is reset
			if (next.totalWatchTime < event.totalWatchTime) {
				return true;
			}
		}
		if (index === computedData.length - 1) {
			return true;
		}
		return false;
	});

	const dailyData = sumByDate(filteredData, "totalWatchTime");
	const weeklyData = sumByWeek(filteredData, "totalWatchTime");
	const monthlyData = sumByMonth(filteredData, "totalWatchTime");

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
				<MetricsViewer data={filteredData} metric="totalWatchTime" />
			) : null}
		</>
	);
}

type TableDataProps = UserEvent & { totalWatchTime: number };

function TableData({
	computedData,
	filteredData,
	dailyData,
	weeklyData,
	monthlyData
}: {
	computedData: TableDataProps[];
	filteredData: TableDataProps[];
	dailyData: { date: string; value: number }[];
	weeklyData: { date: string; value: number }[];
	monthlyData: { date: string; value: number }[];
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
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Aggregierte Daten</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>Action</TableHeaderColumn>
						<TableHeaderColumn>ResourceID</TableHeaderColumn>
						<TableHeaderColumn>PayLoad</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
					</>
				}
			>
				{filteredData.map(event => (
					<tr key={event.id}>
						<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>{event.action}</TableDataColumn>
						<TableDataColumn>{event.resourceId}</TableDataColumn>
						<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
						<TableDataColumn>
							{(event.totalWatchTime / 1000).toFixed(2)}
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
					</>
				}
			>
				{dailyData.map(day => (
					<tr key={day.date}>
						<TableDataColumn>{day.date}</TableDataColumn>
						<TableDataColumn>{(day.value / 1000).toFixed(2)}</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Wöchentliche Werte</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Week</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
					</>
				}
			>
				{weeklyData.map(week => (
					<tr key={week.date}>
						<TableDataColumn>{week.date}</TableDataColumn>
						<TableDataColumn>{(week.value / 1000).toFixed(2)}</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Monatliche Werte</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Monat</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
					</>
				}
			>
				{monthlyData.map(month => (
					<tr key={month.date}>
						<TableDataColumn>{month.date}</TableDataColumn>
						<TableDataColumn>{(month.value / 1000).toFixed(2)}</TableDataColumn>
					</tr>
				))}
			</Table>
		</>
	);
}
