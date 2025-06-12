import { LessonFormModel, useTableSkillDisplay } from "@self-learning/teaching";
import { Lesson, SkillFormModel } from "@self-learning/types";
import { SkillTree } from "libs/feature/teaching/src/lib/skills/folder-editor/skill-tree";
import { ModuleView } from "./module-view";
import { useState } from "react";
import { Tabs, Tab } from "@self-learning/ui/common";

export function ModuleDependency({
	skills,
	authorId,
	isDragging,
    modules,
	onSelectModule
}: {
	skills: Map<string, SkillFormModel>;
	authorId: number;
	isDragging: boolean;
    modules: Map<string, LessonFormModel>;
	onSelectModule: (id: string) => void;
}) {
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(skills);
	const tabs = ["Skills", "Module"];
	const handleSelect = () => {};
	const [selectedIndex, setSelectedIndex] = useState(0);
	function switchTab(index: number) {
		setSelectedIndex(index);
	}
	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return (
					<SkillTree
						skillDisplayData={skillDisplayData}
						onSkillSelect={handleSelect}
						updateSkillDisplay={updateSkillDisplay}
						authorId={authorId}
						isDragging={isDragging}
					/>
				);
			case 1:
				return <ModuleView modules={modules} authorId={authorId} onSelectModule={onSelectModule}/>;
		}
	};
	return (
		<>
			<h1>Abhängigkeiten</h1>
			<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
				{tabs.map((content, idx) => (
					<Tab key={idx}>{content}</Tab>
				))}
			</Tabs>
			<div className="items-center justify-center w-full">{renderContent(selectedIndex)}</div>
		</>
	);
}
