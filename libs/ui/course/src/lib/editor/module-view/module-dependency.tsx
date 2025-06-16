import { LessonFormModel, useTableSkillDisplay } from "@self-learning/teaching";
import { SkillFormModel } from "@self-learning/types";
import { SkillTree } from "libs/feature/teaching/src/lib/skills/folder-editor/skill-tree";
import { ModuleView } from "./module-view";
import { useState } from "react";
import { Tabs, Tab } from "@self-learning/ui/common";
import { SkillSelectHandler } from "libs/feature/teaching/src/lib/skills/folder-editor/skill-display";

export function ModuleDependency({
	skills,
	authorId,
	isDragging,
    modules,
	onSelectModule,
	onSkillSelect
}: {
	skills: Map<string, SkillFormModel>;
	authorId: number;
	isDragging: boolean;
    modules: Map<string, LessonFormModel>;
	onSelectModule: (id: string) => void;
	onSkillSelect: SkillSelectHandler
}) {
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(skills);
	const tabs = ["Skills", "Module"];
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
						updateSkillDisplay={updateSkillDisplay}
						authorId={authorId}
						isDragging={isDragging}
						onSkillSelect={onSkillSelect}
					/>
				);
			case 1:
				return <ModuleView modules={modules} onSelectModule={onSelectModule}/>;
			default:
				return <div>Tab not found</div>;
		}
	};
	return (
		<>
			<h1 className="text-emerald-500">Abhängigkeiten</h1>
			<p className="text-gray-500">
				Wählen Sie Skills und Module aus um diese per Drag & Drop der Lerneinheit zuzuweisen
			</p>
			<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
				{tabs.map((content, idx) => (
					<Tab key={idx}>{content}</Tab>
				))}
			</Tabs>
			<div className="items-center justify-center w-full">{renderContent(selectedIndex)}</div>
		</>
	);
}
