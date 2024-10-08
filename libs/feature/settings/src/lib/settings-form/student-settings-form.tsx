import { Toggle } from "@self-learning/ui/common";
import { useState } from "react";

export function StudentSettingsForm({
	learningStatistics,
	hasLearningDiary,
	onChange
}: {
	learningStatistics: boolean;
	hasLearningDiary: boolean;
	onChange: (checkbox: string, value: boolean) => void;
}) {
	return (
		<div>
			<h2 className="text-lg font-bold">Lernen</h2>
			<div className="mt-6 flex items-center gap-2">
				<Toggle
					value={learningStatistics}
					onChange={value => {
						onChange("learningStatistics", value);
					}}
					label="Lernstatistiken"
				/>
			</div>
			<ExpandableSettingsSection
				text="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
					tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
					vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
					no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
					amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
					labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
					et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet."
				title="Check this for learning statistics"
			/>
			<div className="mt-4 flex items-center gap-2">
				<Toggle
					value={hasLearningDiary}
					onChange={value => {
						onChange("hasLearningDiary", value);
					}}
					label="Lerntagebuch"
				/>
			</div>
			<ExpandableSettingsSection
				text="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
					tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
					vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
					no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
					amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
					labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
					et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet."
				title="Check this for learning diary"
			/>
		</div>
	);
}

function ExpandableSettingsSection({ text, title }: { text: string; title: string }) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	const displayedText = isExpanded ? text : text.substring(0, 150) + "...";

	return (
		<section className="mt-5 rounded-lg bg-white p-3.5">
			<span className="h-32 w-full" title={title}>
				{displayedText}
			</span>
			<button className="mt-2 text-blue-500 hover:underline" onClick={toggleExpanded}>
				{isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
			</button>
		</section>
	);
}
