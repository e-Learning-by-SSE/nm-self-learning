import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { Tab, Tabs } from "./tabs";

export default {
	title: "Common/Tabs"
};

export const Default = () => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	return (
		<CenteredContainer className="flex flex-col gap-8">
			<Tabs selectedIndex={selectedIndex} onChange={index => setSelectedIndex(index)}>
				{[1, 2, 3, 4, 5].map(i => (
					<Tab>Tab {i}</Tab>
				))}
			</Tabs>

			<p className="card bg-gray-50">Selected Tab: {selectedIndex + 1}</p>
		</CenteredContainer>
	);
};
