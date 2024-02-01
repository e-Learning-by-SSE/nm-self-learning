import { IncompleteNanoModuleExport, MissedElement } from "@self-learning/lia-exporter";
function generateReport(missedItem: MissedElement) {
	switch (missedItem.type) {
		case "programming":
			switch (missedItem.cause) {
				case "unsupportedLanguage":
					return (
						<>
							Programmieraufgabe <span className="font-mono">{missedItem.id}</span>{" "}
							konnte nicht ausführbar gemacht werden, da für{" "}
							<span className="font-mono">{missedItem.language}</span> keine
							Laufzeitumgebung zur Verfügung steht.
						</>
					);
				case "unsupportedSolution":
					return (
						<>
							Für Programmieraufgaben können keine automatische Überprüfung der Lösung
							exportiert werden.
						</>
					);
				case "hintsUnsupported":
					return <>Für Programmieraufgaben können keine Hints erstellt werden.</>;
			}
			break;
		case "clozeText":
			switch (missedItem.cause) {
				case "unsupportedAnswerType":
					return (
						<>
							Für den Lückentext <span className="font-mono">{missedItem.id}</span>{" "}
							konnten eine oder mehrere Lücken nicht korrekt exportiert werden. Es ist
							nicht möglich Lücken mit mehreren Antworten zu exportieren, diese Lücken
							werden als Einzelantwort behandelt. Die korrekte Antwort entspricht
							dabei der ersten Antwort alle Möglichen.
						</>
					);
			}
			break;
		case "article": {
			const element =
				missedItem.cause.length > 1
					? "folgende Elemente nicht unterstützt werden"
					: "folgendes Element nicht unterstützt wird";
			return (
				<>
					`Der Artikel konnte nicht vollständig exportiert werden, da ${element}: $
					{missedItem.cause.join(", ")})`
				</>
			);
		}
	}
}

export function IncompleteExportSynopsis({ report }: { report: IncompleteNanoModuleExport[] }) {
	return (
		<div>
			{report.map(item => (
				<div>
					<h2 className="mb-2 mt-2 text-lg">{`${item.nanomodule.name} (${item.nanomodule.id})`}</h2>
					<ul className="ml-4 list-disc space-y-1">
						{item.missedElements.map(missed => (
							<li>{generateReport(missed)}</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}
