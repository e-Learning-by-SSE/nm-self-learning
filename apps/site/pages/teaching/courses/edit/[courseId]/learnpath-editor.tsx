import "reactflow/dist/style.css";
import { SkillFormModel } from "@self-learning/types";
import { LearnpathEditor } from "libs/feature/teaching/src/lib/course/course-learnpath-editor/learnpath-editor";

// TODO remove dummies later
const repositoryId = "1";
const controlStruc: SkillFormModel = {
	id: "1009",
	name: "Control Structures",
	repositoryId: "1",
	description: "if, switch case, loops",
	parents: [],
	children: ["1006", "1008"]
};
const teachingGoals = [controlStruc];
const lessonPoolId = "1";

export default function CourseLearnpathEditor() {
	return (
		<>
			<LearnpathEditor
				repositoryId={repositoryId}
				teachingGoals={teachingGoals}
				lessonPoolId={lessonPoolId}
			/>
		</>
	);
}
