import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import {
	CourseDataProvider,
	CourseBasicInformation,
	CourseSkillView,
	CourseModulView,
	CoursePreview
} from "@self-learning/ui/course";
import { useState } from "react";

export default function CourseCreationEditor() {
	// TODO: limit access to this page
	const tabs = ["1. BasicCourseInfo", "2. Skillview", "3. Modulview", "4. Preview"];
	const [selectedIndex, setSelectedIndex] = useState(0);

	function switchTab(index: number) {
		setSelectedIndex(index);
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <CourseBasicInformation />;
			case 1:
				return <CourseSkillView />;
			case 2:
				return <CourseModulView />;
			case 3:
				return <CoursePreview />;
			default:
				return null;
		}
	};

	return (
		<>
			<CourseDataProvider>
				<div className="m-3">
					<section>
						<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
					</section>
					<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
						{tabs.map((content, idx) => (
							<Tab key={idx}>{content}</Tab>
						))}
					</Tabs>
					<div>{renderContent(selectedIndex)}</div>
				</div>
			</CourseDataProvider>
		</>
	);
}
