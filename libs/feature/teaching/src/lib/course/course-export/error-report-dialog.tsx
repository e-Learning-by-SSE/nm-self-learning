import { DialogWithReactNodeTitle, CollapsibleBox } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { IncompleteNanoModuleExport, MissedElement } from "@self-learning/lia-exporter";
import Link from "next/link";
import { CourseFormModel } from "../course-form-model";

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
			if (missedItem.cause === "unsupportedLanguage") {
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
			if (missedItem.cause === "unsupportedSolution") {
				return (
					<>
						Für Programmieraufgaben können keine automatische Überprüfung der Lösung
						exportiert werden.
					</>
				);
			} else if (missedItem.cause === "hintsUnsupported") {
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
					{missedItem.cause.join(", ")}`
				</>
			);
		}
	}
	return <>Unbekannter Fehler</>;
}

/**
 * Creates a section title for a incomplete nanomodule export
 * @param slug The slug referring (link) to the course
 * @param item The report of the incomplete nanomodule export
 * @returns A section title including a link to visit the nanomodule, which can be used as title for a collapsible box
 */
function SectionTitle({ slug, item }: { slug: string; item: IncompleteNanoModuleExport }) {
	return (
		<div className="flex">
			<Link href={`/courses/${slug}/${item.nanomodule.slug}`} target="_blank">
				<div className="mt-2 mb-2 text-lg text-secondary">{item.nanomodule.name}</div>
			</Link>
			<p className="ml-2 mt-2 mb-2 text-lg font-normal">{`(${item.missedElements.length} unvollständige Elemente)`}</p>
		</div>
	);
}

export function ErrorReportDialog({
	report,
	course,
	onClose
}: {
	report: IncompleteNanoModuleExport[];
	course: CourseFormModel;
	onClose: () => void;
}) {
	const element = report.length > 1 ? "Einige Elemente werden" : "Ein Element wird";

	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "80vh", width: "80vw", overflow: "auto" }}
				title={`${course.title} erfolgreich exportiert`}
				onClose={onClose}
			>
				<div className="mt-[-1rem] mb-4">{`${element} nicht vollständig in LiaScript unterstützt:`}</div>
				<div className="scroll flex-grow overflow-auto">
					{report.map(item => (
						<div className="mb-2">
							<CollapsibleBox title={<SectionTitle slug={course.slug} item={item} />}>
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
							</CollapsibleBox>
						</div>
					))}
				</div>
				<div className="mt-2 grid justify-items-end">
					<button
						className="btn-primary"
						type="button"
						onClick={() => {
							onClose();
						}}
					>
						Schließen
					</button>
				</div>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}
