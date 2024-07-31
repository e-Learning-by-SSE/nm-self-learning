import { useContext } from "react";
import { CourseDataContext, CourseDataProvider } from "@self-learning/ui/course";

export function CourseSkillView() {
	const context = useContext(CourseDataContext);
	if (!context) {
		throw new Error("Component CourseSkillView must be used within a DataProvider");
	}
	const { data, setData } = context;

	return (
		<CourseDataProvider>
			<div>Skill View</div>
			<p>Data: {JSON.stringify(data)}</p>
		</CourseDataProvider>
	);
}
