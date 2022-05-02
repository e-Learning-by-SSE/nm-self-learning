import { useEffect, useState } from "react";
import { ExampleLayout } from "./";

export default function HttpRequest() {
	const [data, setData] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			const response = await fetch("/api/users/potter/courses");
			const data = await response.json();
			setData(data);
		};

		loadData();
	}, []);

	return (
		<ExampleLayout>
			<div className="wrapper">{data && <pre>{JSON.stringify(data, null, 4)}</pre>}</div>
		</ExampleLayout>
	);
}
