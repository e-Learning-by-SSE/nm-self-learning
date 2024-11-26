import { zodResolver } from "@hookform/resolvers/zod";
import {
	EditFeatureSettings,
	EditPersonalSettings,
	editPersonalSettingSchema
} from "@self-learning/types";
import { OnDialogCloseFn, Toggle } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function PersonalSettingsForm({
	personalSettings,
	onSubmit
}: {
	personalSettings: EditPersonalSettings;
	onSubmit: OnDialogCloseFn<EditPersonalSettings>;
}) {
	const form = useForm({
		defaultValues: personalSettings,
		resolver: zodResolver(editPersonalSettingSchema)
	});

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
			<LabeledField label="Name" error={form.formState.errors.displayName?.message}>
				<input {...form.register("displayName")} type="text" className="textfield" />
			</LabeledField>

			<button className="btn-primary" disabled={!form.formState.isValid}>
				Profile Speichern
			</button>
		</form>
	);
}

export function FeatureSettingsForm({
	featureSettings,
	onChange
}: {
	featureSettings: EditFeatureSettings;
	onChange: OnDialogCloseFn<Partial<EditFeatureSettings>>;
}) {
	const { enabledFeatureLearningDiary, enabledLearningStatistics } = featureSettings;

	const onChangeLtb = (value: boolean) => {
		if (value) {
			onChange({ enabledFeatureLearningDiary: true, enabledLearningStatistics: true });
		}
		onChange({ enabledFeatureLearningDiary: value });
	};

	const onChangeStatistics = (value: boolean) => {
		if (!value) {
			onChange({ enabledLearningStatistics: false, enabledFeatureLearningDiary: false });
		}
		onChange({ enabledLearningStatistics: value });
	};

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<ToggleSetting
					value={enabledLearningStatistics}
					onChange={onChangeStatistics}
					label="Lernstatistiken"
				/>

				<ExpandableSettingsSection
					text="Erfassung und Speicherung von Sitzungsdaten zur Auswertung des persönlichen Lernverhalten"
					title="Check this for learning statistics"
				>
					<p>
						Es werden alle Daten zum Lernverhalten erfasst und ausschließlich dir
						zugänglich gemacht. Dabei werden nur jene Informationen erhoben, die für die
						Nutzung unserer Plattform erforderlich sind. Dies umfasst unter anderem:
					</p>
					<ul className="list-disc list-inside space-y-2">
						<li>
							Aufgerufene Kurse/Nanomodule und die damit verbundenen Verweildauern
						</li>
						<li>Starten, pausieren und anhalten von Videos</li>
						<li>Abgabeversuche von Lernzielkontrollen</li>
					</ul>
					<p>
						Diese Funktion dient deiner persönlichen Analyse und unterstützt dich dabei,
						dein Lernverhalten zu optimieren. Sie wird zudem für das Lerntagebuch
						benötigt, weitere Funktionen werden in Zukunft ergänzt. Darüber hinaus
						werden die Daten in aggregierter und/oder anonymisierter Form den Lehrenden
						zu Forschungszwecken sowie zur Verbesserung der Kurse bereitgestellt. Dabei
						gilt:
					</p>
					<ul className="list-disc list-inside space-y-2">
						<li>
							Es werden Daten nur angezeigt wenn min. 10 Studierende am Kurs
							teilgenommen haben, um die Anonymität zu gewährleisten.
						</li>
						<li>
							Es werden Funktionen angeboten, die Nachfrage und den Umgang mit den
							bereitgestellten Kursinhalten anzeigen.
						</li>
						<li>
							Gegebenenfalls werden aggregierte und anonymisierte Daten für die
							Forschung bereitgestellt.
						</li>
					</ul>
					<p>
						Es werden keine Daten an Dritte weitergegeben und du kannst jederzeit die
						gesammelten Daten löschen.
					</p>
				</ExpandableSettingsSection>
			</div>
			<div className="space-y-2">
				<ToggleSetting
					value={enabledFeatureLearningDiary}
					onChange={onChangeLtb}
					label="Lerntagebuch"
				/>

				<ExpandableSettingsSection
					text="Lernaktivitäten und Lernstrategien dokumentieren"
					title="Check this for learning diary"
				>
					<p>
						Werde mit dem interaktiven Lerntagebuch zur Expert*in deines eigenen
						Lernens! Setze individuelle Ziele und dokumentiere deine Lernaktivitäten
						sowie die Lernstrategien, die du zur Bearbeitung angewendet hast. Verfolge
						deinen Fortschritt anschaulich: Durch die Auswertung deiner Lernstatistiken
						erkennst du schnell, wo deine Stärken liegen und in welchen Bereichen du
						dich optimieren oder verbessern kannst. Basierend auf den Lernstatistiken
						werden dir neue, individuelle Lernpfade vorgeschlagen. Es werden keine Daten
						an Dritte weitergegeben und du kannst die gesammelten Daten jederzeit
						löschen.
					</p>
				</ExpandableSettingsSection>
			</div>
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

function ToggleSetting({
	value,
	onChange,
	label
}: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<Toggle value={value} onChange={onChange} label={label} />
		</div>
	);
}
