import { createStrategiesAndTechniques, LearningStrategyCategory } from "../seed-functions";

export async function seedStrategiesAndTechniques() {
	console.log("\x1b[94m%s\x1b[0m", "Strategies and Techniques");
	const data: LearningStrategyCategory[] = [
		{
			strategieName: "Wiederholung (Kognition)",
			techniques: [
				"Vorwissensaktivierung",
				"Aktivierungsfrage beantworten",
				"Quizfragen bearbeiten",
				"Quizfragen durchmischt bearbeiten",
				"Wechselnde Übungsformen",
				"Abrufübungen",
				"Themenwechsel",
				"Überlernen"
			]
		},
		{
			strategieName: "Elaboration (Kognition)",
			techniques: [
				"Analogien finden",
				"Eigene Beispiele finden",
				"In eigenen Worten erklären",
				"Notizen anfertigen",
				"W-Fragen entwickeln und beantworten"
			]
		},
		{
			strategieName: "Organisation (Kognition)",
			techniques: [
				"Concept-Map erstellen",
				"Diagramm erstellen",
				"Eigene Systematik/Ordnung entwickeln",
				"Individuelle Visualisierung erstellen",
				"Mind-Map erstellen"
			]
		},
		{
			strategieName: "Planung (Metakognition)",
			techniques: [
				"ALPEN-Methode",
				"Gantt-Diagramm",
				"Lernstoff auf mehrere Lerneinheiten verteilen (zeitlich verteiltes Lernen)",
				"SMARTE Ziele formulieren",
				"Vorgehensweise planen",
				"Wochenplan aufstellen",
				"Zeitfenster zum Lernen identifizieren",
				"Ziele für das Lernen setzen",
				"Ziele priorisieren (Eisenhower-Prinzip)",
				"Ziele priorisieren (Pendenzenliste)"
			]
		},
		{
			strategieName: "Überwachung (Metakognition)",
			techniques: [
				"Anstrengungsmanagement",
				"Aufmerksamkeit fokussieren",
				"Video zurückspulen",
				"Video anhalten und nachdenken",
				"Fragen im Hinterkopf haben und beantworten",
				"Gedankenstopp",
				"Lernfortschritt dokumentieren",
				"Ziele als To-Do Listen verwenden",
				"Strategisches Vorgehen anpassen"
			]
		},
		{
			strategieName: "Bewertung (Metakognition)",
			techniques: [
				"Selbstreflexion",
				"Lerntagebucheinträge analysieren",
				"Abgleich mit externen Vorgaben (z.B. von Lehrenden)",
				"Abgleich mit persönlichen Lernzielen",
				"Reflexion der Ergebnisse der Quiz",
				"Bilden von Vorsätzen für die Zukunft",
				"Einschätzung der Lernqualität",
				"Einschätzung der persönlichen Zufriedenheit mit dem Erreichten",
				"Einschätzung des Lernumfangs (Quantität)",
				"Emotionen nach dem Lernen"
			]
		},
		{
			strategieName: "Ressourcenmanagement",
			techniques: [
				"Arbeitsplatz einrichten",
				"geeignete Lernmaterialien suchen",
				"Lernen mit anderen (Lerngruppe besuchen)",
				"Nachschlagen von Begriffen oder Informationen",
				"ruhige Lernumgebung aufsuchen",
				"Tutorium besuchen",
				"Zeit planen, um begrenzte Zeit optimal zu nutzen",
				"Zeitmanagement anpassen"
			]
		},
		{
			strategieName: "Motivation",
			techniques: [
				"An selbst gesetzte Ziele zurückerinnern",
				"Arbeitskontrakt abschließen",
				"Autosuggestion",
				"Begeisterung für ein Thema/einen Menschen ausnutzen",
				"Günstige Erklärungsmuster (Attributionsmuster) finden",
				"sich in gute Stimmung bringen (z.B. Musik hören, an etwas Schönes denken)",
				"Identifikation mit dem Lernstoff",
				"Motivation durch eine Lerngruppe",
				"Regulation von negativen Affekten",
				"Selbstbelohnung in Aussicht stellen",
				"Selbstbestimmung vor Augen halten (Studium und Fach selbst gewählt)",
				"Umstrukturierung dysfunktionaler Gedanken",
				"Volitionale Strategien (Durchbeißen und Dranbleiben)"
			]
		}
	];

	createStrategiesAndTechniques(data);
}
