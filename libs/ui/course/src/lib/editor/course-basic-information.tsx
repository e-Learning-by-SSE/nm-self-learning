import { useContext } from "react";
import { CourseDataContext, CourseDataProvider } from "@self-learning/ui/course";

export function CourseBasicInformation() {
	const context = useContext(CourseDataContext);
	if (!context) {
		throw new Error("Component CourseBasicInformation must be used within a DataProvider");
	}
	const { data, setData } = context;

	return (
		<CourseDataProvider>
			<div>Basic Course Info</div>
			<p>Data: {JSON.stringify(data)}</p>
		</CourseDataProvider>
	);
}
