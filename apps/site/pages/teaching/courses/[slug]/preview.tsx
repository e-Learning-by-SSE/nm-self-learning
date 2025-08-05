import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

export default function CoursePreviewPage() {
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;
	const [selectedIndex, setSelectedIndex] = useState(3);

	const tabs = [
		{ label: "1. Grunddaten", path: "edit" },
		{ label: "2. Skillansicht", path: "skills" },
		{ label: "3. Modulansicht", path: "modules" },
		{ label: "4. Vorschau", path: "preview" }
	];

	async function switchTab(newIndex: number) {
		setSelectedIndex(newIndex);
		const tab = tabs[newIndex];
		if (tab.path) {
			router.push(`/teaching/courses/${slug}/${tab.path}`);
		}
	}
	return (
		<div className="m-3">
			<section>
				<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
			</section>
			<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
				{tabs.map((tab, idx) => (
					<Tab key={idx}>
						<span>{tab.label}</span>
					</Tab>
				))}
			</Tabs>
			<div className="w-full h-[100px] flex items-center justify-center">
				<div className="font-mono whitespace-pre text-sm pt-5">
					{`  ^__^
 (oo)\\_______
(__)\\       )\\/\\
    ||----- |
    ||     ||`}
				</div>
			</div>
		</div>
	);
}
