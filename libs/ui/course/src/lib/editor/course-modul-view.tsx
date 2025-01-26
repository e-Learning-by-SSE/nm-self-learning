import React, { ReactNode, useState } from "react";
import { Tab, Tabs } from "@self-learning/ui/common";

export function CourseModulView() {
	const tabs = ["Basis Daten", "Lerninhalt", "Lernkontrolle"];
	const [selectedIndex, setSelectedIndex] = useState(0);

	function switchTab(index: number) {
		setSelectedIndex(index);
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <BasicData />;
			case 1:
				return <LearningContent />;
			case 2:
				return <LearningAssessment />;
			default:
				return null;
		}
	};

	return (
		<>
			<Sidebar
				content={<div>Content</div>}
				footer={<div>footer</div>}
				header={<div>header</div>}
			/>
			<div className="ml-64 m-3">
				<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
					{tabs.map((content, idx) => (
						<Tab key={idx}>{content}</Tab>
					))}
				</Tabs>
				<div>{renderContent(selectedIndex)}</div>
			</div>
		</>
	);
}

function BasicData() {
	return <div>Basis Daten</div>;
}

function LearningContent() {
	return <div>Lerninhalt</div>;
}

function LearningAssessment() {
	return <div>Lernkontrolle</div>;
}

export function Sidebar({
	header,
	content,
	footer
}: {
	header: ReactNode;
	content: ReactNode;
	footer: ReactNode;
}) {
	return (
		<div className="fixed left-0 z-10 flex h-full w-full flex-col overflow-hidden bg-white sm:w-64">
			{header}
			{content}
			{footer}
		</div>
	);
}
