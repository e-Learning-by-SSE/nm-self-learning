import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { eventsToIntervalls, computeHeatmapData } from "./metrics/learning-intervalls";

export function LearningHeatmap() {
	const { data, isLoading } = trpc.events.get.useQuery({});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No data</div>;
	}

	const learningIntervalls = eventsToIntervalls(data, 1000 * 60 * 10);
	const heatmapData = computeHeatmapData(learningIntervalls);

	return (
		<div>
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
						<TableDataColumn>{event.action}</TableDataColumn>
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
						<TableDataColumn>{data.day}</TableDataColumn>
						<TableDataColumn>{data.time}</TableDataColumn>
						<TableDataColumn>{data.value}</TableDataColumn>
					</tr>
				))}
			</Table>
		</div>
	);
}
