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
				text="Erfassung und Speicherung von Sitzungsdaten zur Auswertung des persönlichen Lernverhalten"
				title="Check this for learning statistics"
			>
				Es werden alle Daten zum Lernverhalten werden erfasst und ausschließlich dir
				zugänglich gemacht. Dabei werden nur jene Informationen erhoben, die für die Nutzung
				unserer Plattform erforderlich sind. Dies umfasst unter anderem:
				<ul className="text-md my-2 flex list-inside list-disc flex-col gap-2 px-2">
					<li>Aufgerufene Kurse</li>
					<li>Starten, pausieren und anhalten von Videos</li>
					<li>Abgabeversuche von Lernzielkontrollen</li>
				</ul>
				Diese Funktion dient deiner persönlichen Analyse und unterstützt dich dabei, dein
				Lernverhalten zu optimieren. Sie wird zudem für das Lerntagebuch benötigt, weitere
				Funktionen werden in Zukunft ergänzt. Darüber hinaus werden die Daten in
				aggregierter und/oder anonymisierter Form den Lehrenden zu Forschungszwecken sowie
				zur Verbesserung der Kurse bereitgestellt. Dabei gilt:
				<ul className="text-md my-2 flex list-inside list-disc flex-col gap-2 px-2">
					<li>
						Es werden Daten nur angezeigt, wenn min. 10 Studierende am Kurs teilgenommen
						haben, um die Anonymität zu gewährleisten.
					</li>
					<li>
						Es werden Funktionen angeboten, die Nachfrage und den Umgang mit den
						bereitgestellten Kursinhalten anzeigen.
					</li>
					<li>
						Gegebenenfalls werden aggregierte und anonymisierte Daten für die Forschung
						bereit gestellt.
					</li>
				</ul>
				Es werden keine Daten an Dritte weitergegeben.{" "}
			</ExpandableSettingsSection>
			<div className="mt-4 flex items-center gap-2">
				<Toggle
					value={hasLearningDiary}
					onChange={value => {
						onChange("hasLearningDiary", value);
					}}
					disabled={!learningStatistics}
					label="Lerntagebuch"
				/>
			</div>
			<ExpandableSettingsSection
				text="Lorem ipsum dolor sit amet, consetetur sadipscing elitr"
				title="Check this for learning diary"
			>
				sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
				diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
				kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
				dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt
				ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
				et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
				est Lorem ipsum dolor sit amet.{" "}
			</ExpandableSettingsSection>
		</div>
	);
}

function ExpandableSettingsSection({
	text,
	title,
	children
}: {
	text: string;
	title: string;
	children?: React.ReactNode;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	const btnClass = "mt-2 text-blue-500 hover:underline" + (isExpanded ? "" : " px-2");

	return (
		<section className="mt-5 rounded-lg bg-white p-3.5">
			<span className="h-32 w-full font-medium" title={title}>
				{text}
			</span>

			{isExpanded && <br />}
			{isExpanded && children}
			<button className={btnClass} onClick={toggleExpanded}>
				{isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
			</button>
		</section>
	);
}
