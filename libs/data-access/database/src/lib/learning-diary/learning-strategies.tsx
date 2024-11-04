import { createStrategiesAndTechniques, LearningStrategyCategory } from "../seed-functions";

export async function seedStrategiesAndTechniques() {
	console.log("\x1b[94m%s\x1b[0m", "Strategies and Techniques");
	const data: LearningStrategyCategory[] = [
		{
			strategieName: "Wiederholung (Kognition)",
			strategieDescription: `
Wiederholungsstrategien sind kognitive Lernstrategien, bei denen Inhalte wiederholt und reflektiert werden, um sie langfristig zu speichern.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/wiederholungsstrategien)

- **Wiederholen:** Vorwissensaktivierung
- **Wiederholen:** Aktivierungsfrage beantworten
- **Wiederholen:** Quizfragen bearbeiten
- **Wiederholen:** Quizfragen durchmischt bearbeiten
- **Wiederholen:** wechselnde Übungsformen (z.B. erst Inhalt WG-Mitbewohnerin in eigenen Worten erklären, dann Quizfragen beantworten)
- **Wiederholen:** Abrufübungen (retrieval practice)
- **Wiederholen:** Themenwechsel (Themen variieren)
- **Wiederholen:** Überlernen (das, was man bereits 100%ig beherrscht, nochmals üben)
- **Wiederholen:** [offenes Eingabefeld]
				`,
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
			strategieDescription: `
Elaborationsstrategien sind kognitive Lernstrategien, bei denen man neue Informationen mit bereits bekanntem Wissen verbindet, um sie zu verstehen und zu speichern.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/elaborationsstrategien)

- **Elaboration:** Analogien finden
- **Elaboration:** eigene Beispiele finden
- **Elaboration:** in eigenen Worten erklären
- **Elaboration:** Notizen anfertigen
- **Elaboration:** W-Fragen entwickeln und beantworten
- **Elaboration:** [offenes Eingabefeld]
			`,
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
			strategieDescription: `
Organisationsstrategien sind kognitive Lernstrategien, bei denen man neue Informationen in einem geordneten und strukturierten System speichert, um sie leichter wiederzuerkennen und abrufen zu können.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/organisationsstrategien)

- **Organisation:** Concept-Map erstellen
- **Organisation:** Diagramm erstellen
- **Organisation:** eigene Systematik/Ordnung entwickeln
- **Organisation:** individuelle Visualisierung erstellen
- **Organisation:** Mind-Map erstellen
- **Organisation:** [offenes Eingabefeld]
			`,
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
			strategieDescription: `
Metakognitive Planungsstrategien sind Lernstrategien, bei denen man vor dem Lernen einen Plan erstellt, um Ziele zu setzen, Aufgaben zu priorisieren und den Lernprozess zu organisieren.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/organisationsstrategien)

- **Planen:** ALPEN-Methode  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/alpen-methode)
- **Planen:** Gantt-Diagramm  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/das-gantt-diagramm)
- **Planen:** Lernstoff auf mehrere Lerneinheiten verteilen (zeitlich verteiltes Lernen)  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/verteiltes-versus-massiertes-lernen)
- **Planen:** SMARTE Ziele formulieren  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/smarte-ziele)
- **Planen:** Vorgehensweise planen
- **Planen:** Lang- versus kurzfristige Planung (Wochenplan aufstellen)  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/zeitmanagement-lang-versus-kurzfristige-planung)
- **Planen:** Lernplan erstellen (Zeitfenster zum Lernen identifizieren)  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/zeitmanagement-lernplan-erstellen)
- **Planen:** Ziele für das Lernen setzen  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/smarte-ziele)
- **Planen:** Ziele priorisieren (Eisenhower-Prinzip)  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/ziele-priorisieren)
- **Planen:** Ziele priorisieren (Pendenzenliste)  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/ziele-priorisieren)
- **Planen:** [offenes Eingabefeld]
			`,
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
			strategieDescription: `
Metakognitive Überwachungsstrategien sind Lernstrategien, bei denen man während des Lernens über den eigenen Lernprozess reflektiert, um zu überprüfen, ob Ziele erreicht werden, welche Schwierigkeiten auftreten und wie man sie überwinden kann.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/metakognitive-strategien)

- **Überwachung:** Anstrengungsmanagement  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/anstrengungsmanagement)
- **Überwachung:** Aufmerksamkeit fokussieren  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/aufmerksamkeit)
- **Überwachung:** Video zurückspulen
- **Überwachung:** Video anhalten und nachdenken
- **Überwachung:** Fragen im Hinterkopf haben und beantworten
- **Überwachung:** Gedankenstopp
- **Überwachung:** Lernfortschritt dokumentieren
- **Überwachung:** Ziele als to-do-Liste verwenden
- **Überwachung:** strategisches Vorgehen anpassen
- **Überwachung:** [offenes Eingabefeld]
- **Anstrengungsmanagement:** wünschenswerte Erschwernisse (desirable difficulties) einbauen
`,
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
			strategieDescription: `
Metakognitive Bewertungsstrategien sind Lernstrategien, bei denen man nach dem Lernen über die eigenen Leistungen reflektiert, um zu bewerten, ob Ziele erreicht wurden, welche Stärken und Schwächen vorhanden sind und wie man sich verbessern kann.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-beim-abschluss-des-lernenprozesses-beachten/inhalte-und-ablaeufe-der-postaktionalen-phase-im-detail)

- **Bewertung:** Selbstreflexion
- **Bewertung:** Lerntagebucheinträge analysieren
- **Bewertung:** Abgleich mit externen Vorgaben (z.B. von Lehrenden)
- **Bewertung:** Abgleich mit persönlichen Lernzielen
- **Bewertung:** Reflexion der Ergebnisse der Quiz
- **Bewertung:** Vorsätze für die Zukunft bilden
- **Bewertung:** Einschätzung der Lernqualität
- **Bewertung:** Einschätzung der persönlichen Zufriedenheit mit dem Erreichten
- **Bewertung:** Einschätzung des Lernumfangs (Quantität)
- **Bewertung:** Emotionen nach dem Lernen
- **Bewertung:** [offenes Eingabefeld]`,
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
			strategieDescription: `
Ressourcenmanagementstrategien sind Lernstrategien, bei denen man die eigenen kognitiven, emotionalen und zeitlichen Ressourcen bewusst einsetzt, um den Lernprozess zu optimieren und Hindernisse zu überwinden.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/ressourcenmanagement)

- **Ressourcenmanagement:** Arbeitsplatz einrichten
- **Ressourcenmanagement:** geeignete Lernmaterialien suchen
- **Ressourcenmanagement:** Lernen mit anderen (Lerngruppe besuchen)
- **Ressourcenmanagement:** Nachschlagen von Begriffen oder Informationen
- **Ressourcenmanagement:** ruhige Lernumgebung aufsuchen
- **Ressourcenmanagement:** Tutorium besuchen
- **Ressourcenmanagement:** Zeit planen, um begrenzte Zeit optimal zu nutzen
- **Ressourcenmanagement:** Zeitmanagement anpassen
- **Ressourcenmanagement:** [offenes Eingabefeld]
			`,
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
			strategieDescription: `
Motivationale Strategien sind Lernstrategien, bei denen man sich selbst motiviert, indem man Ziele setzt, sich selbst belohnt, die eigenen Stärken und Schwächen erkennt und sich auf die Herausforderungen des Lernprozesses einstellt.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/selbstmotivation)

- **Motivation:** An selbst gesetzte Ziele zurückerinnern
- **Motivation:** Arbeitskontrakt abschließen
- **Motivation:** Autosuggestion
- **Motivation:** Begeisterung für ein Thema/einen Menschen ausnutzen
- **Motivation:** Günstige Erklärungsmuster (Attributionsmuster) finden
- **Motivation:** sich in gute Stimmung bringen (z.B. Musik hören, an etwas Schönes denken)
- **Motivation:** Identifikation mit dem Lernstoff
- **Motivation:** Motivation durch eine Lerngruppe
- **Motivation:** Regulation von negativen Affekten
- **Motivation:** Selbstbelohnung in Aussicht stellen
- **Motivation:** Selbstbestimmung vor Augen halten (Studium und Fach selbst gewählt)
- **Motivation:** Umstrukturierung dysfunktionaler Gedanken
- **Motivation:** Volitionale Strategien (Durchbeißen und Dranbleiben)
- **Motivation:** Motivation und Prokrastination  
  [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/motivation-und-prokrastination)
- **Motivation:** [offenes Eingabefeld]
			`,
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
