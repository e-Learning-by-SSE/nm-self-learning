import { createStrategiesAndTechniques, LearningStrategyCategory } from "../seed-functions";

export async function seedStrategiesAndTechniques() {
	console.log("\x1b[94m%s\x1b[0m", "Strategies and Techniques");

	const data: LearningStrategyCategory[] = [
		{
			strategieName: "Wiederholung (Kognition)",
			strategieDescription: `
Wiederholungsstrategien sind kognitive Lernstrategien, bei denen Inhalte wiederholt und reflektiert werden, um sie langfristig zu speichern.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/wiederholungsstrategien)
            `,
			techniques: [
				{
					name: "Vorwissensaktivierung",
					description: "**Wiederholen:** Vorwissensaktivierung"
				},
				{
					name: "Aktivierungsfrage beantworten",
					description: "**Wiederholen:** Aktivierungsfrage beantworten"
				},
				{
					name: "Quizfragen bearbeiten",
					description: "**Wiederholen:** Quizfragen bearbeiten"
				},
				{
					name: "Quizfragen durchmischt bearbeiten",
					description: "**Wiederholen:** Quizfragen durchmischt bearbeiten"
				},
				{
					name: "Wechselnde Übungsformen",
					description:
						"**Wiederholen:** wechselnde Übungsformen (z.B. erst Inhalt WG-Mitbewohnerin in eigenen Worten erklären, dann Quizfragen beantworten)"
				},
				{
					name: "Abrufübungen",
					description: "**Wiederholen:** Abrufübungen (retrieval practice)"
				},
				{
					name: "Themenwechsel",
					description: "**Wiederholen:** Themenwechsel (Themen variieren)"
				},
				{
					name: "Überlernen",
					description:
						"**Wiederholen:** Überlernen (das, was man bereits 100%ig beherrscht, nochmals üben)"
				},
				{
					name: "[offenes Eingabefeld]",
					description: "**Wiederholen:** [offenes Eingabefeld]"
				}
			]
		},
		{
			strategieName: "Elaboration (Kognition)",
			strategieDescription: `
Elaborationsstrategien sind kognitive Lernstrategien, bei denen man neue Informationen mit bereits bekanntem Wissen verbindet, um sie zu verstehen und zu speichern.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/elaborationsstrategien)`,
			techniques: [
				{ name: "Analogien finden", description: "**Elaboration:** Analogien finden" },
				{
					name: "Eigene Beispiele finden",
					description: "**Elaboration:** eigene Beispiele finden"
				},
				{
					name: "In eigenen Worten erklären",
					description: "**Elaboration:** in eigenen Worten erklären"
				},
				{ name: "Notizen anfertigen", description: "**Elaboration:** Notizen anfertigen" },
				{
					name: "W-Fragen entwickeln und beantworten",
					description: "**Elaboration:** W-Fragen entwickeln und beantworten"
				},
				{
					name: "[offenes Eingabefeld]",
					description: "**Elaboration:** [offenes Eingabefeld]"
				}
			]
		},
		{
			strategieName: "Organisation (Kognition)",
			strategieDescription: `Organisationsstrategien sind kognitive Lernstrategien, bei denen man neue Informationen in einem geordneten und strukturierten System speichert, um sie leichter wiederzuerkennen und abrufen zu können.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/organisationsstrategien)`,
			techniques: [
				{
					name: "Concept-Map erstellen",
					description: "**Organisation:** Concept-Map erstellen"
				},
				{ name: "Diagramm erstellen", description: "**Organisation:** Diagramm erstellen" },
				{
					name: "Eigene Systematik/Ordnung entwickeln",
					description: "**Organisation:** eigene Systematik/Ordnung entwickeln"
				},
				{
					name: "Individuelle Visualisierung erstellen",
					description: "**Organisation:** individuelle Visualisierung erstellen"
				},
				{ name: "Mind-Map erstellen", description: "**Organisation:** Mind-Map erstellen" },
				{
					name: "[offenes Eingabefeld]",
					description: "**Organisation:** [offenes Eingabefeld]"
				}
			]
		},
		{
			strategieName: "Planung (Metakognition)",
			strategieDescription: `Metakognitive Planungsstrategien sind Lernstrategien, bei denen man vor dem Lernen einen Plan erstellt, um Ziele zu setzen, Aufgaben zu priorisieren und den Lernprozess zu organisieren.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/organisationsstrategien)`,
			techniques: [
				{
					name: "ALPEN-Methode",
					description:
						"**Planen:** ALPEN-Methode \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/das-gantt-diagramm)"
				},
				{
					name: "Gantt-Diagramm",
					description:
						"**Planen:** Gantt-Diagramm \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/das-gantt-diagramm)"
				},
				{
					name: "Lernstoff auf mehrere Lerneinheiten verteilen (zeitlich verteiltes Lernen)",
					description:
						"**Planen:** Lernstoff auf mehrere Lerneinheiten verteilen (zeitlich verteiltes Lernen) \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/verteiltes-versus-massiertes-lernen)"
				},
				{
					name: "SMARTE Ziele formulieren",
					description:
						"**Planen:** SMARTE Ziele formulieren \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/smarte-ziele)"
				},
				{ name: "Vorgehensweise planen", description: "**Planen:** Vorgehensweise planen" },
				{
					name: "Lang- versus kurzfristige Planung (Wochenplan aufstellen)",
					description:
						"**Planen:** Lang- versus kurzfristige Planung (Wochenplan aufstellen) \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/zeitmanagement-lang-versus-kurzfristige-planung)"
				},
				{
					name: "Lernplan erstellen (Zeitfenster zum Lernen identifizieren)",
					description:
						"**Planen:** Lernplan erstellen (Zeitfenster zum Lernen identifizieren) \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/zeitmanagement-lernplan-erstellen)"
				},
				{
					name: "Ziele für das Lernen setzen",
					description:
						"**Planen:** Ziele für das Lernen setzen \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/smarte-ziele)"
				},
				{
					name: "Ziele priorisieren (Eisenhower-Prinzip)",
					description:
						"**Planen:** Ziele priorisieren (Eisenhower-Prinzip) \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/ziele-priorisieren)"
				},
				{
					name: "Ziele priorisieren (Pendenzenliste)",
					description:
						"**Planen:** Ziele priorisieren (Pendenzenliste) \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/ziele-priorisieren)"
				},
				{ name: "[offenes Eingabefeld]", description: "**Planen:** [offenes Eingabefeld]" }
			]
		},
		{
			strategieName: "Überwachung (Metakognition)",
			strategieDescription: `Metakognitive Überwachungsstrategien sind Lernstrategien, bei denen man während des Lernens über den eigenen Lernprozess reflektiert, um zu überprüfen, ob Ziele erreicht werden, welche Schwierigkeiten auftreten und wie man sie überwinden kann.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/metakognitive-strategien)`,
			techniques: [
				{
					name: "Anstrengungsmanagement",
					description:
						"**Überwachung:** Anstrengungsmanagement \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/anstrengungsmanagement)"
				},
				{
					name: "Aufmerksamkeit fokussieren",
					description:
						"**Überwachung:** Aufmerksamkeit fokussieren \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/aufmerksamkeit)"
				},
				{ name: "Video zurückspulen", description: "**Überwachung:** Video zurückspulen" },
				{
					name: "Video anhalten und nachdenken",
					description: "**Überwachung:** Video anhalten und nachdenken"
				},
				{
					name: "Fragen im Hinterkopf haben und beantworten",
					description: "**Überwachung:** Fragen im Hinterkopf haben und beantworten"
				},
				{ name: "Gedankenstopp", description: "**Überwachung:** Gedankenstopp" },
				{
					name: "Lernfortschritt dokumentieren",
					description: "**Überwachung:** Lernfortschritt dokumentieren"
				},
				{
					name: "Ziele als To-Do Listen verwenden",
					description: "**Überwachung:** Ziele als To-Do Listen verwenden"
				},
				{
					name: "Strategisches Vorgehen anpassen",
					description: "**Überwachung:** Strategisches Vorgehen anpassen"
				},
				{
					name: "[offenes Eingabefeld]",
					description: "**Überwachung:** [offenes Eingabefeld]"
				}
			]
		},
		{
			strategieName: "Bewertung (Metakognition)",
			strategieDescription: `Metakognitive Bewertungsstrategien sind Lernstrategien, bei denen man nach dem Lernen über die eigenen Leistungen reflektiert, um zu bewerten, ob Ziele erreicht wurden, welche Stärken und Schwächen vorhanden sind und wie man sich verbessern kann.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-beim-abschluss-des-lernenprozesses-beachten/inhalte-und-ablaeufe-der-postaktionalen-phase-im-detail)`,
			techniques: [
				{ name: "Selbstreflexion", description: "**Bewertung:** Selbstreflexion" },
				{
					name: "Lerntagebucheinträge analysieren",
					description: "**Bewertung:** Lerntagebucheinträge analysieren"
				},
				{
					name: "Abgleich mit externen Vorgaben (z.B. von Lehrenden)",
					description:
						"**Bewertung:** Abgleich mit externen Vorgaben (z.B. von Lehrenden)"
				},
				{
					name: "Abgleich mit persönlichen Lernzielen",
					description: "**Bewertung:** Abgleich mit persönlichen Lernzielen"
				},
				{
					name: "Reflexion der Ergebnisse der Quiz",
					description: "**Bewertung:** Reflexion der Ergebnisse der Quiz"
				},
				{
					name: "Vorsätze für die Zukunft bilden",
					description: "**Bewertung:** Vorsätze für die Zukunft bilden"
				},
				{
					name: "Einschätzung der Lernqualität",
					description: "**Bewertung:** Einschätzung der Lernqualität"
				},
				{
					name: "Einschätzung der persönlichen Zufriedenheit mit dem Erreichten",
					description:
						"**Bewertung:** Einschätzung der persönlichen Zufriedenheit mit dem Erreichten"
				},
				{
					name: "Einschätzung des Lernumfangs (Quantität)",
					description: "**Bewertung:** Einschätzung des Lernumfangs (Quantität)"
				},
				{
					name: "Emotionen nach dem Lernen",
					description: "**Bewertung:** Emotionen nach dem Lernen"
				},
				{
					name: "[offenes Eingabefeld]",
					description: "**Bewertung:** [offenes Eingabefeld]"
				}
			]
		},
		{
			strategieName: "Ressourcenmanagement",
			strategieDescription: `Ressourcenmanagementstrategien sind Lernstrategien, bei denen man die eigenen kognitiven, emotionalen und zeitlichen Ressourcen bewusst einsetzt, um den Lernprozess zu optimieren und Hindernisse zu überwinden.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/was-sollte-man-waehrend-des-lernens-beachten/ressourcenmanagement)`,
			techniques: [
				{
					name: "Arbeitsplatz einrichten",
					description: "**Ressourcenmanagement:** Arbeitsplatz einrichten"
				},
				{
					name: "geeignete Lernmaterialien suchen",
					description: "**Ressourcenmanagement:** geeignete Lernmaterialien suchen"
				},
				{
					name: "Lernen mit anderen (Lerngruppe besuchen)",
					description:
						"**Ressourcenmanagement:** Lernen mit anderen (Lerngruppe besuchen)"
				},
				{
					name: "Nachschlagen von Begriffen oder Informationen",
					description:
						"**Ressourcenmanagement:** Nachschlagen von Begriffen oder Informationen"
				},
				{
					name: "ruhige Lernumgebung aufsuchen",
					description: "**Ressourcenmanagement:** ruhige Lernumgebung aufsuchen"
				},
				{
					name: "Tutorium besuchen",
					description: "**Ressourcenmanagement:** Tutorium besuchen"
				},
				{
					name: "Zeit planen, um begrenzte Zeit optimal zu nutzen",
					description:
						"**Ressourcenmanagement:** Zeit planen, um begrenzte Zeit optimal zu nutzen"
				},
				{
					name: "Zeitmanagement anpassen",
					description: "**Ressourcenmanagement:** Zeitmanagement anpassen"
				},
				{
					name: "[offenes Eingabefeld]",
					description: "**Ressourcenmanagement:** [offenes Eingabefeld]"
				}
			]
		},
		{
			strategieName: "Motivation",
			strategieDescription: `Motivationale Strategien sind Lernstrategien, bei denen man sich selbst motiviert, indem man Ziele setzt, sich selbst belohnt, die eigenen Stärken und Schwächen erkennt und sich auf die Herausforderungen des Lernprozesses einstellt.  
[Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/selbstmotivation)`,
			techniques: [
				{
					name: "An selbst gesetzte Ziele zurückerinnern",
					description: "**Motivation:** An selbst gesetzte Ziele zurückerinnern"
				},
				{
					name: "Arbeitskontrakt abschließen",
					description: "**Motivation:** Arbeitskontrakt abschließen"
				},
				{ name: "Autosuggestion", description: "**Motivation:** Autosuggestion" },
				{
					name: "Begeisterung für ein Thema/einen Menschen ausnutzen",
					description:
						"**Motivation:** Begeisterung für ein Thema/einen Menschen ausnutzen"
				},
				{
					name: "Günstige Erklärungsmuster (Attributionsmuster) finden",
					description:
						"**Motivation:** Günstige Erklärungsmuster (Attributionsmuster) finden"
				},
				{
					name: "sich in gute Stimmung bringen (z.B. Musik hören, an etwas Schönes denken)",
					description:
						"**Motivation:** sich in gute Stimmung bringen (z.B. Musik hören, an etwas Schönes denken)"
				},
				{
					name: "Identifikation mit dem Lernstoff",
					description: "**Motivation:** Identifikation mit dem Lernstoff"
				},
				{
					name: "Motivation durch eine Lerngruppe",
					description: "**Motivation:** Motivation durch eine Lerngruppe"
				},
				{
					name: "Regulation von negativen Affekten",
					description: "**Motivation:** Regulation von negativen Affekten"
				},
				{
					name: "Selbstbelohnung in Aussicht stellen",
					description: "**Motivation:** Selbstbelohnung in Aussicht stellen"
				},
				{
					name: "Selbstbestimmung vor Augen halten (Studium und Fach selbst gewählt)",
					description:
						"**Motivation:** Selbstbestimmung vor Augen halten (Studium und Fach selbst gewählt)"
				},
				{
					name: "Umstrukturierung dysfunktionaler Gedanken",
					description: "**Motivation:** Umstrukturierung dysfunktionaler Gedanken"
				},
				{
					name: "Volitionale Strategien (Durchbeißen und Dranbleiben)",
					description:
						"**Motivation:** Volitionale Strategien (Durchbeißen und Dranbleiben)"
				},
				{
					name: "Motivation und Prokrastination",
					description:
						"****Motivation:** Motivation und Prokrastination  \n [Weitere Informationen](https://www.uni-hildesheim.de/selflearn/courses/wie-sollte-der-lernprozess-vorbereitet-werden/motivation-und-prokrastination)"
				},
				{
					name: "[offenes Eingabefeld]",
					description: "**Motivation:** [offenes Eingabefeld]"
				}
			]
		}
	];

	createStrategiesAndTechniques(data);
}
