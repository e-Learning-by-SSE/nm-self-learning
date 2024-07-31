import { useContext } from "react";
import { CourseDataContext, CourseDataProvider } from "@self-learning/ui/course";

export function CourseModulView() {
	const context = useContext(CourseDataContext);
	if (!context) {
		throw new Error("Component CourseSkillView must be used within a DataProvider");
	}
	const { data, setData } = context;

	return (
		<CourseDataProvider>
			<div>Modul View</div>
			<p>Data: {JSON.stringify(data)}</p>
		</CourseDataProvider>
	);
}
