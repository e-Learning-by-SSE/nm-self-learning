import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";

export function CourseView() {
	const { data, isLoading } = trpc.events.get.useQuery({
		action: ["COURSE_COMPLETE", "COURSE_START", "COURSE_STOP", "COURSE_RESUME"]
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No data</div>;
	}

	return (
		<>
			<h1 className="text-center text-3xl">Course Participation</h1>
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
				{data.map(event => (
					<tr key={event.id}>
						<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>{event.action}</TableDataColumn>
						<TableDataColumn>{event.resourceId}</TableDataColumn>
						<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
					</tr>
				))}
			</Table>
		</>
	);
}
