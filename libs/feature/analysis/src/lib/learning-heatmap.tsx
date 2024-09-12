import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { UserEvent } from "@self-learning/database";
import { useState } from "react";
import { HeatMap } from "./components/learning-heatmap";
import {
	isEventType,
	HeatmapEntry,
	Interval,
	eventsToIntervalls,
	computeHeatmapData
} from "./metrics";

const PreviewTypes = ["Table", "Chart"];

export function LearningHeatmap() {
	const [previewSelection, setPreviewSelection] = useState("Table");
	const { data, isLoading } = trpc.events.get.useQuery({});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No data</div>;
	}

	const learningIntervalls = eventsToIntervalls(data, 1000 * 60 * 10);
	const heatmapData = computeHeatmapData(learningIntervalls);
	const filteredData = data.filter(e => isEventType(e, "LESSON_VIDEO_PLAY"));

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
				<EventTable
					data={data}
					learningIntervalls={learningIntervalls}
					heatmapData={heatmapData}
					filteredData={filteredData}
				/>
			) : (
				<div className="h-3/5">
					<HeatMap data={heatmapData} />
				</div>
			)}
		</>
	);
}

function EventTable({
	data,
	learningIntervalls,
	heatmapData,
	filteredData
}: {
	data: UserEvent[];
	learningIntervalls: Interval[];
	heatmapData: HeatmapEntry[];
	filteredData?: UserEvent[];
}) {
	return (
		<div>
			{filteredData && (
				<>
					<h1 className="text-center text-3xl">Filtered</h1>
					<Table
						head={
							<>
								<TableHeaderColumn>Date</TableHeaderColumn>
								<TableHeaderColumn>Action</TableHeaderColumn>
								<TableHeaderColumn>ResourceID</TableHeaderColumn>
								<TableHeaderColumn>PayLoad</TableHeaderColumn>
							</>
						}
					>
						{filteredData.map(event => (
							<tr key={event.id}>
								<TableDataColumn>
									{event.createdAt.toLocaleString()}
								</TableDataColumn>
								<TableDataColumn>{event.type}</TableDataColumn>
								<TableDataColumn>{event.resourceId}</TableDataColumn>
								<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
							</tr>
						))}
					</Table>
				</>
			)}

			<h1 className="text-center text-3xl">All User Events</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>Action</TableHeaderColumn>
						<TableHeaderColumn>ResourceID</TableHeaderColumn>
						<TableHeaderColumn>PayLoad</TableHeaderColumn>
					</>
				}
			>
				{data.map(event => (
					<tr key={event.id}>
						<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>{event.type}</TableDataColumn>
						<TableDataColumn>{event.resourceId}</TableDataColumn>
						<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Intervalls</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Start</TableHeaderColumn>
						<TableHeaderColumn>End</TableHeaderColumn>
					</>
				}
			>
				{learningIntervalls.map((interval, index) => (
					<tr key={index}>
						<TableDataColumn>{interval.start.toLocaleString()}</TableDataColumn>
						<TableDataColumn>{interval.end.toLocaleString()}</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Heatmap Data</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Day</TableHeaderColumn>
						<TableHeaderColumn>Time</TableHeaderColumn>
						<TableHeaderColumn>Value</TableHeaderColumn>
					</>
				}
			>
				{heatmapData.map((data, index) => (
					<tr key={index}>
						<TableDataColumn>{data.time}</TableDataColumn>
						<TableDataColumn>{data.day}</TableDataColumn>
						<TableDataColumn>{data.v}</TableDataColumn>
					</tr>
				))}
			</Table>
		</div>
	);
}
