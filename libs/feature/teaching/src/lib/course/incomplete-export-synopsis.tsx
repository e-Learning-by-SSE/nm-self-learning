import { IncompleteNanoModuleExport, MissedElement } from "@self-learning/lia-exporter";
import Link from "next/link";
import { CourseFormModel } from "./course-form-model";

function QuestionLink({
	path,
	index,
	children
}: {
	path: string;
	index: number;
	children: React.ReactNode;
}) {
	return (
		<Link href={`${path}/quiz?index=${index}`} target="_blank">
			{children}
		</Link>
	);
}

function ReportItem({ path, missedItem }: { path: string; missedItem: MissedElement }) {
	switch (missedItem.type) {
		case "programming":
			switch (missedItem.cause) {
				case "unsupportedLanguage":
					return (
						<>
							<QuestionLink path={path} index={missedItem.index}>
								Programmieraufgabe {missedItem.index}
							</QuestionLink>{" "}
							konnte nicht ausführbar gemacht werden, da für{" "}
							<span className="font-mono">{missedItem.language}</span> keine
							Laufzeitumgebung zur Verfügung steht.
						</>
					);
			}
			break;
		case "programmingUnspecific":
			switch (missedItem.cause) {
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
			if (missedItem.cause === "unsupportedAnswerType") {
				return (
					<>
						Für den{" "}
						<QuestionLink path={path} index={missedItem.index}>
							Lückentext {missedItem.index}
						</QuestionLink>{" "}
						konnten eine oder mehrere Lücken nicht korrekt exportiert werden. Es ist
						nicht möglich Lücken mit mehreren Antworten zu exportieren, diese Lücken
						werden als Einzelantwort behandelt. Die korrekte Antwort entspricht dabei
						der ersten Antwort alle Möglichen.
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

export function IncompleteExportSynopsis({
	report,
	course
}: {
	report: IncompleteNanoModuleExport[];
	course: CourseFormModel;
}) {
	return (
		<div>
			{report.map(item => (
				<div>
					<Link href={`/courses/${course.slug}/${item.nanomodule.slug}`} target="_blank">
						<h2 className="mb-2 mt-2 text-lg">{`${item.nanomodule.name} (${item.nanomodule.id})`}</h2>
					</Link>

					<ul className="ml-4 list-disc space-y-1">
						{item.missedElements.map(missed => (
							<li>
								<ReportItem
									missedItem={missed}
									path={`/courses/${course.slug}/${item.nanomodule.slug}`}
								/>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}
