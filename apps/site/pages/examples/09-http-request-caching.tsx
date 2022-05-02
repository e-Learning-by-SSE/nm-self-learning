import { useApi } from "@self-learning/api";
import { ExampleLayout } from ".";

export default function HttpRequestCaching() {
	const { data, error, isLoading, refetch, isStale } = useApi<any>(["users/potter/courses"]);

	return (
		<ExampleLayout>
			<div className="wrapper">
				<button className="btn-primary" onClick={() => refetch()}>
					{isLoading ? "Loading..." : "Reload Data"}
					{isStale ? " (Data is stale)" : ""}
				</button>
				{data && <pre className="overflow-hidden">{JSON.stringify(data, null, 4)}</pre>}
				{error && <span>Something went wrong.</span>}
			</div>
		</ExampleLayout>
	);
}
