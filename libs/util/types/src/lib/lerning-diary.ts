import { LocationType, StrategyType } from "@prisma/client";
import { z } from "zod";

export function getLocationNameByType(type: LocationType) {
	let result = "Keine Angabe";
	switch (type) {
		case "HOME":
			result = "Zuhause";
			break;
		case "ONTHEROAD":
			result = "Unterwegs";
			break;
		case "UNIVERSITY":
			result = "Universität";
			break;
		case "USERSPECIFIC":
			result = "[offenes Eingabefeld]";
			break;
	}
	return result;
}

export const strategySchema = z.object({
	type: z.nativeEnum(StrategyType),
	confidenceRating: z.number(),
	notes: z.string().nullable()
});

export function isUserSpecific(type: StrategyType) {
	let result = false;
	if (
		type === StrategyType.USERSPECIFIC ||
		type === StrategyType.PLANNING_USERSPECIFIC ||
		type === StrategyType.REPEATING_USERSPECIFIC ||
		type === StrategyType.ASSESSMENT_USERSPECIFIC ||
		type === StrategyType.MONITORING_USERSPECIFIC ||
		type === StrategyType.MOTIVATION_USERSPECIFIC ||
		type === StrategyType.ELABORATION_USERSPECIFIC ||
		type === StrategyType.ORGANIZATION_USERSPECIFIC ||
		type === StrategyType.RESOURCEMANAGEMENT_USERSPECIFIC
	)
		result = true;
	return result;
}

export function getUSerSpecificName(type: StrategyType) {
	let result = "";
	switch (type) {
		case StrategyType.PLANNING_USERSPECIFIC:
			result = "Planen: ";
			break;
		case StrategyType.REPEATING_USERSPECIFIC:
			result = "Wiederholen: ";
			break;
		case StrategyType.ASSESSMENT_USERSPECIFIC:
			result = "Bewertung: ";
			break;
		case StrategyType.MONITORING_USERSPECIFIC:
			result = "Überwachung: ";
			break;
		case StrategyType.MOTIVATION_USERSPECIFIC:
			result = "Motivation: ";
			break;
		case StrategyType.ELABORATION_USERSPECIFIC:
			result = "Elaboration: ";
			break;
		case StrategyType.ORGANIZATION_USERSPECIFIC:
			result = "Organisation: ";
			break;
		case StrategyType.RESOURCEMANAGEMENT_USERSPECIFIC:
			result = "Ressourcenmanagement: ";
			break;
	}
	return result;
}

export function getStrategyNameByType(type: StrategyType) {
	let result = "Strategie Auswählen";
	switch (type) {
		case "ASSESSMENT_ANALYZELEARNINGDIARYENTRIES":
			result = "Bewertung: Lerntagebucheinträge analysieren ";
			break;
		case "ASSESSMENT_COMARISONWITHPERSONALLEARNINGOBJECTS":
			result = "Bewertung: Abgleich mit persönlichen Lernzielen";
			break;
		case "ASSESSMENT_COMPARISONWITHEXTERNALREQUIREMENTS":
			result = "Bewertung: Abgleich mit externen Vorgaben (z.B. von Lehrenden)";
			break;
		case "ASSESSMENT_EMOTIONS":
			result = "Bewertung: Emotionen nach dem Lernen";
			break;
		case "ASSESSMENT_FUTURE":
			result = "Bewertung: Bilden von Vorsätzen für die Zukunft";
			break;
		case "ASSESSMENT_LEARNINGQUANTITY":
			result = "Bewertung: Einschätzung des Lernumfangs (Quantität)";
			break;
		case "ASSESSMENT_PERSONALSATISFACTION":
			result = "Bewertung: Einschätzung der persönlichen Zufriedenheit mit dem Erreichten";
			break;
		case "ASSESSMENT_QUALITYOFLEARNING":
			result = "Bewertung: Einschätzung der Lernqualität";
			break;
		case "ASSESSMENT_REFLECTIONQUIZ":
			result = "Bewertung: Reflexion der Ergebnisse der Quiz";
			break;
		case "ASSESSMENT_SELFREFLECTION":
			result = "Bewertung: Selbstreflexion";
			break;
		case "ASSESSMENT_USERSPECIFIC":
			result = "Bewertung: [offenes Eingabefeld]";
			break;
		case "EFFORTMANAGMENT_DESIRABLEDIFFICULTIES":
			result =
				"Anstrengungsmanagement: wünschenswerte Erschwernisse (desirable difficulties) einbauen";
			break;

		case "ELABORATION_EXPLAININOWNWORDS":
			result = "Elaboration: in eigenen Worten erklären";
			break;
		case "ELABORATION_FINDANALOGIES":
			result = "Elaboration: Analogien finden";
			break;
		case "ELABORATION_IDENTIFYOWNEXAMPLES":
			result = "Elaboration: eigene Beispiele finden";
			break;
		case "ELABORATION_MAKENOTES":
			result = "Elaboration: Notizen anfertigen";
			break;
		case "ELABORATION_USERSPECIFIC":
			result = "Elaboration: [offenes Eingabefeld]";
			break;
		case "ELABORATION_WQUESTIONS":
			result = "Elaboration: W-Fragen entwickeln und beantworten";
			break;

		case "MONITORING_ADAPTSTRATEGIE":
			result = "Überwachung: strategisches Vorgehen anpassen";
			break;
		case "MONITORING_EFFORTMANAGMENT":
			result = "Überwachung: Anstrengungsmanagement";
			break;
		case "MONITORING_FOCUSINGATTENTION":
			result = "Überwachung: Aufmerksamkeit fokussieren";
			break;
		case "MONITORING_GOALSASTODOLIST":
			result = "Überwachung: Ziele als to do-Liste verwenden";
			break;
		case "MONITORING_LEARNINGPROGRESS":
			result = "Überwachung: Lernfortschritt dokumentieren";
			break;
		case "MONITORING_PAUSEVIDEO":
			result = "Überwachung: Video anhalten und nachdenken";
			break;
		case "MONITORING_QUESTIONINMIND":
			result = "Überwachung: Fragen im Hinterkopf haben und beantworten";
			break;
		case "MONITORING_REWINDVIDEO":
			result = "Überwachung: Video zurückspulen";
			break;
		case "MONITORING_STOPTHINKING":
			result = "Überwachung: Gedankenstopp";
			break;
		case "MONITORING_USERSPECIFIC":
			result = "Überwachung: [offenes Eingabefeld]";
			break;

		case "MOTIVATION_ATTRIBUTIONPATTERNS":
			result = "Motivation: Günstige Erklärungsmuster (Attributionsmuster) finden";
			break;
		case "MOTIVATION_AUTOSUGGESTION":
			result = "Motivation: Autosuggestion";
			break;
		case "MOTIVATION_DYSFUCTIONALTHOUGHTS":
			result = "Motivation: Umstrukturierung dysfunktionaler Gedanken";
			break;
		case "MOTIVATION_ENTHUSIASMFORTOPICPERSON":
			result = "Motivation: Begeisterung für ein Thema/einen Menschen ausnutzen";
			break;
		case "MOTIVATION_GOODMOOD":
			result = "Motivation: sich in gute Stimmung bringen";
			break;
		case "MOTIVATION_NEGATIVEAFFECTS":
			result = "Motivation: Regulation von negativen Affekten";
			break;
		case "MOTIVATION_REMINDGOALS":
			result = "Motivation: An selbst gesetzte Ziele zurückerinnern";
			break;
		case "MOTIVATION_SELFDETERMINATION":
			result =
				"Motivation: Selbstbestimmung vor Augen halten (Studium und Fach selbst gewählt)";
			break;
		case "MOTIVATION_SELFREWARD":
			result = "Motivation: Selbstbelohnung in Aussicht stellen";
			break;
		case "MOTIVATION_STUDYGROUP":
			result = "Motivation: Motivation durch eine Lerngruppe";
			break;
		case "MOTIVATION_SUBJECTMATTER":
			result = "Motivation: Identifikation mit dem Lernstoff ";
			break;
		case "MOTIVATION_USERSPECIFIC":
			result = "Motivation: [offenes Eingabefeld]";
			break;
		case "MOTIVATION_VOLITIONALSTRATEGIES":
			result = "Motivation: Volitionale Strategien (Durchbeißen und Dranbleiben)";
			break;
		case "MOTIVATION_WORKCOTRACT":
			result = "Motivation: Arbeitskontrakt abschließen";
			break;

		case "ORGANIZATION_CONCEPTMAP":
			result = "Organisation: Concept-Map erstellen";
			break;
		case "ORGANIZATION_DIAGRAMM":
			result = "Organisation: Diagramm erstellen";
			break;
		case "ORGANIZATION_INDIVIDUALVISUALIZATION":
			result = "Organisation: individuelle Visualisierung erstellen";
			break;
		case "ORGANIZATION_MINDMAP":
			result = "Organisation: Mind-Map erstellen";
			break;
		case "ORGANIZATION_SYSTEMATICORDER":
			result = "Organisation: eigene Systematik/Ordnung entwickeln";
			break;
		case "ORGANIZATION_USERSPECIFIC":
			result = "Organisation: [offenes Eingabefeld]";
			break;

		case "PLANNING_USERSPECIFIC":
			result = "Planen: [offenes Eingabefeld]";
			break;
		case "PLANNING_ALPENMETHOD":
			result = "Planen: ALPEN-Methode";
			break;
		case "PLANNING_APPROACH":
			result = "Planen: Vorgehensweise planen";
			break;
		case "PLANNING_EISENHOWERPRINCIPLEGOALS":
			result = "Planen: Ziele priorisieren (Eisenhower-Prinzip)n";
			break;
		case "PLANNING_GANTTCHART":
			result = "Planen: Gantt-Diagramm";
			break;
		case "PLANNING_GOALS":
			result = "Planen: Ziele für das Lernen setzen";
			break;
		case "PLANNING_LEARNINGTIMESLOTS":
			result = "Planen: Zeitfenster zum Lernen identifizieren";
			break;
		case "PLANNING_PENDINGLISTGOALS":
			result = "Planen: Ziele priorisieren (Pendenzenliste)";
			break;
		case "PLANNING_SMARTEGOALS":
			result = "Planen: SMARTE Ziele formulieren";
			break;
		case "PLANNING_TIMEDISTRIBUTEDLEARNING":
			result =
				"Planen: Lernstoff auf mehrere Lerneinheiten verteilen (zeitlich verteiltes Lernen)";
			break;
		case "PLANNING_WEEKLYSCHEDULE":
			result = "Planen: Wochenplan aufstellen";
			break;

		case "REPEATING_ACTIVATIONQUESTION":
			result = "Wiederholen: Aktivierungsfrage beantworten";
			break;
		case "REPEATING_CHANINGFORMSOFEXERCISE":
			result = "Wiederholen: wechselnde Übungsformen";
			break;
		case "REPEATING_MIXUOQUIZQUESTIONS":
			result = "Wiederholen: Quizfragen durchmischt bearbeiten ";
			break;
		case "REPEATING_OVERLEARNING":
			result = "Wiederholen: Überlernen";
			break;
		case "REPEATING_PREKNOWLEDGEACTIVATION":
			result = "Wiederholen: Vorwissensaktivierung";
			break;
		case "REPEATING_QUIZQUESTIONS":
			result = "Wiederholen: Quizfragen bearbeiten";
			break;
		case "REPEATING_RETRIEVALPRACTICE":
			result = "Wiederholen: Abrufübungen (retrieval pactice)";
			break;
		case "REPEATING_SUBJECTCHANGES":
			result = "Wiederholen: Themenwechsel (Themen variieren)";
			break;
		case "REPEATING_USERSPECIFIC":
			result = "Wiederholung: [offenes Eingabefeld ]";
			break;

		case "RESOURCEMANAGEMENT_LEARNINGMATERIALS":
			result = "Ressourcenmanagement: geeignete Lernmaterialien suchen";
			break;
		case "RESOURCEMANAGEMENT_LIMITEDTIME":
			result = "Ressourcenmanagement: Zeit planen, um begrenzte Zeit optimal zu nutzen";
			break;
		case "RESOURCEMANAGEMENT_LOOKINGUPTERMS":
			result = "Ressourcenmanagement: Nachschlagen von Begriffen oder Informationen";
			break;
		case "RESOURCEMANAGEMENT_QUIETLEARNINGENVIRONMENT":
			result = "Ressourcenmanagement: ruhige Lernumgebung aufsuchen";
			break;
		case "RESOURCEMANAGEMENT_STUDYGROUP":
			result = "Ressourcenmanagement: Lernen mit anderen (Lerngruppe besuchen)";
			break;
		case "RESOURCEMANAGEMENT_TIMEMANAGEMENT":
			result = "Ressourcenmanagement: Zeitmanagement anpassen";
			break;
		case "RESOURCEMANAGEMENT_TUTORIAL":
			result = "Ressourcenmanagement: Tutorium besuchen";
			break;
		case "RESOURCEMANAGEMENT_USERSPECIFIC":
			result = "Ressourcenmanagement: [offenes Eingabefeld]";
			break;
		case "RESOURCEMANAGEMENT_WORKSTATION":
			result = "Ressourcenmanagement: Arbeitsplatz einrichten";
			break;
		case "USERSPECIFIC":
			result = "[offenes Eingabefeld]";
			break;
	}
	return result;
}

export type StrategyOverview = {
	type: StrategyType;
	_count: {
		type: number;
	};
	_avg: {
		confidenceRating: number | null;
	};
};
export type UserSpecificStrategyOverview = {
	notes: string | null;
	_count: {
		type: number;
	};
	_avg: {
		confidenceRating: number | null;
	};
};
