import { CheckIcon } from "@heroicons/react/24/solid";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { EXPERIMENT_END_DATE, getExperimentStatus } from "@self-learning/profile";
import { showToast } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useLoginRedirect, withAuth } from "@self-learning/util/auth";
import { formatDateStringFull } from "@self-learning/util/common";
import Link from "next/link";
import { useState } from "react";

interface ExperimentConsentProps {
	hasAlreadyConsented: boolean;
	consentDate?: Date;
	locked: boolean;
}

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<ExperimentConsentProps>(async (_, user) => {
		const data = await getExperimentStatus(user.name);

		return {
			props: {
				hasAlreadyConsented: data.isParticipating,
				consentDate: data.consentDate || undefined,
				locked: data.isParticipating || data.declinedOnce
			}
		};
	})
);

const KURS_TITLE = "Sprachbeschreibung für die Sprachtechnologie (Kursnummer: 4310)";

export default function ExperimentConsentPage({
	hasAlreadyConsented,
	consentDate,
	locked
}: ExperimentConsentProps) {
	const { loginRedirect } = useLoginRedirect();
	const [hasReadFullText, setHasReadFullText] = useState(false);
	const [agreesToParticipate, setAgreesToParticipate] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { mutateAsync: updateProfile } = trpc.me.update.useMutation();
	const { mutateAsync: submitConsent } = trpc.me.submitExperimentConsent.useMutation();

	async function handleSubmitConsent() {
		if (!agreesToParticipate || !hasReadFullText) return;

		setIsSubmitting(true);
		try {
			await submitConsent({ consent: true });
			await updateProfile({ user: { registrationCompleted: true } });
			showToast({
				type: "success",
				title: "Einverständnis gespeichert",
				subtitle: "Vielen Dank für Ihre Teilnahme am Experiment!"
			});
			void loginRedirect("/profile");
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Das Einverständnis konnte nicht gespeichert werden."
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeclineParticipation() {
		setIsSubmitting(true);
		try {
			await submitConsent({ consent: false });
			await updateProfile({
				user: { registrationCompleted: true }
			});
			showToast({
				type: "info",
				title: "Teilnahme abgelehnt",
				subtitle: "Sie können die Plattform normal weiter nutzen."
			});
			void loginRedirect("/dashboard");
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Die Antwort konnte nicht gespeichert werden."
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<CenteredSection>
			<div className="mx-auto max-w-4xl">
				<div className="rounded-lg bg-white p-8 shadow-md">
					<div className="mb-8">
						<h1 className="mb-4 text-3xl font-bold">
							Einverständniserklärung zur Studienteilnahme
						</h1>
						<p className="text-lg text-gray-600">
							Forschungsstudie zur Wirksamkeit von digitalen Lernumgebungen.
						</p>
					</div>

					{hasAlreadyConsented && <ConsentConfirmation consentDate={consentDate} />}

					<ExperimentInformation />
					<BenefitInformation />
					<ResponsiblePersons />

					{!hasAlreadyConsented && (
						<div className="mt-8 space-y-6 border-t pt-8">
							<h2 className="text-xl font-semibold">Ihr Einverständnis</h2>

							{locked && (
								<div className="mb-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
									<p className="text-yellow-800 text-sm">
										Sie haben bereits eine Entscheidung bezüglich der
										Studienteilnahme getroffen. Eine erneute Änderung ist nicht
										möglich.
									</p>
								</div>
							)}

							<div className="space-y-4">
								<label className="flex items-start gap-3">
									<input
										type="checkbox"
										checked={hasReadFullText}
										onChange={e => setHasReadFullText(e.target.checked)}
										disabled={locked}
										className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
									/>
									<span className={`text-sm ${locked ? "text-gray-500" : ""}`}>
										Ich habe die obigen Informationen gelesen und verstanden.
										Mir ist bewusst, dass meine Teilnahme freiwillig ist und ich
										diese jederzeit ohne Angabe von Gründen beenden kann.
									</span>
								</label>

								<label className="flex items-start gap-3">
									<input
										type="checkbox"
										checked={agreesToParticipate}
										onChange={e => setAgreesToParticipate(e.target.checked)}
										disabled={locked}
										className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
									/>
									<span className={`text-sm ${locked ? "text-gray-500" : ""}`}>
										Ich erkläre mich bereit, an dieser Forschungsstudie
										teilzunehmen.
									</span>
								</label>
							</div>
							<div className="flex gap-4 pt-4">
								<button
									onClick={handleSubmitConsent}
									disabled={
										locked ||
										!hasReadFullText ||
										!agreesToParticipate ||
										isSubmitting
									}
									className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting ? (
										"Wird gespeichert..."
									) : (
										<>
											<CheckIcon className="h-5 w-5" />
											An Studie teilnehmen
										</>
									)}
								</button>

								<button
									onClick={handleDeclineParticipation}
									disabled={locked || isSubmitting}
									className="btn-stroked disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Nicht teilnehmen
								</button>
							</div>
						</div>
					)}

					<div className="mt-8 border-t pt-6">
						<div className="text-center">
							<p className="text-xs text-gray-500 mb-2">
								Bei Rückfragen oder Unklarheiten zur Studie können Sie sich
								jederzeit an das Forschungsteam wenden:
								<a
									href="mailto:spark@uni-hildesheim.de"
									className="text-emerald-600 hover:underline ml-1"
								>
									spark@uni-hildesheim.de
								</a>
							</p>
							{hasAlreadyConsented && (
								<Link
									href="/experiment/revoke"
									className="text-sm text-red-600 hover:underline"
								>
									Einverständnis widerrufen
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</CenteredSection>
	);
}

function ConsentConfirmation({ consentDate }: { consentDate?: Date }) {
	return (
		<div className="mb-8 rounded-lg bg-emerald-50 p-6 border border-emerald-200">
			<div className="flex items-center gap-4">
				<CheckIcon className="h-12 w-12 text-emerald-500 flex-shrink-0" />
				<div>
					<h2 className="text-xl font-bold text-emerald-900">
						Einverständnis bereits erteilt
					</h2>
					<p className="text-emerald-800">
						Sie haben am {consentDate?.toLocaleDateString("de-DE")} Ihr Einverständnis
						zur Teilnahme an der Forschungsstudie erteilt.
					</p>
					<p className="mt-2 text-sm text-emerald-700">
						Hier können Sie alle Studiendetails noch einmal einsehen.
					</p>
				</div>
			</div>
		</div>
	);
}

function BenefitInformation() {
	return (
		<div className="mt-8 space-y-4">
			<h2 className="text-xl font-semibold">Vorteile der Teilnahme</h2>
			<div className="rounded-lg bg-green-50 p-6 border border-green-200">
				<h3 className="font-semibold text-green-900 mb-3">
					Bonuspunkte für Ihre Abschlussklausur
				</h3>
				<div className="space-y-2 text-green-800">
					<p>
						<strong>Kurs:</strong> {KURS_TITLE}
					</p>
					<p>
						<strong>Bonus:</strong> 5% der Gesamtpunktzahl
					</p>
				</div>
				<div className="mt-4 p-4 bg-green-100 rounded-md">
					<h4 className="font-medium text-green-900 mb-2">
						Voraussetzungen für den Bonus:
					</h4>
					<ul className="list-disc list-inside text-sm text-green-800 space-y-1">
						<li>
							Mindestens eine Lerneinheit erfolgreich abgeschlossen bis zum Ende der
							Studie.
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

function ResponsiblePersons() {
	return (
		<div className="mt-8 space-y-4">
			<h2 className="text-xl font-semibold">Verantwortliche Personen</h2>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
					<h3 className="font-semibold text-blue-900 mb-2">Versuchsleitung</h3>
					<div className="text-blue-800 text-sm space-y-1">
						<p>
							<strong>Marcel Spark</strong>
						</p>
						<p>Institut für Informatik</p>
						<p>Universität Hildesheim</p>
						<p>
							<a
								href="mailto:spark@uni-hildesheim.de"
								className="text-blue-600 hover:underline"
							>
								spark@uni-hildesheim.de
							</a>
						</p>
					</div>
				</div>

				<div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
					<h3 className="font-semibold text-purple-900 mb-2">Verantwortliche Person</h3>
					<div className="text-purple-800 text-sm space-y-1">
						<p>
							<strong>Prof. Dr. Ulrich Heid</strong>
						</p>
						<p>Lehrstuhl für Computerlinguistik und Sprachtechnologie</p>
						<p>Universität Hildesheim</p>
						<p>
							<a
								href="mailto:beispiel@uni-hildesheim.de"
								className="text-purple-600 hover:underline"
							>
								heidul@uni-hildesheim.de
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function ExperimentInformation() {
	const [showFull, setShowFull] = useState(false);

	const shortText =
		"Die Datenverarbeitung erfolgt auf Grundlage Ihrer freiwilligen Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Alle Daten werden ausschließlich für wissenschaftliche Zwecke verwendet.";

	const fullText = `Die Datenverarbeitung erfolgt auf Grundlage Ihrer freiwilligen Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Alle Daten werden ausschließlich für wissenschaftliche Zwecke verwendet. Zugriff auf Rohdaten haben nur die Versuchsleitung unterstützt durch Prof. Dr. Klaus Schmid und  autorisiertes technisches Personal. Anderes Lehrpersonen erhält ausschließlich pseudoanonymisierte Datensätze, die keine Rückschlüsse auf Ihre Person zulassen. Die Durchführung des Experiments erfolgt im Einklang mit der EU-Datenschutz-Grundverordnung (DSGVO). Die Daten werden auf universitätseigenen Servern gespeichert. Nach Abschluss des Experiments erfolgt eine Pseudonymisierung, bevor die Daten ausgewertet werden. Die Daten werden für maximal 10 Jahre gespeichert und danach gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Ergebnisse werden ausschließlich anonymisiert und in aggregierter Form veröffentlicht. Ausgewählte Aussagen oder Verhaltensdaten können anonymisiert zitiert werden. Eine Identifikation einzelner Personen ist hierbei ausgeschlossen.

Datenschutzbeauftragter der Universität Hildesheim:
Prof. Dr. Thomas Mandl
Institut für Informationswissenschaft und Sprachtechnologie
Universität Hildesheim
E-Mail: mandl@uni-hildesheim.de
Tel.: +49 5121 883-30306
Lübecker Straße 3, 31141 Hildesheim`;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-3 text-xl font-semibold">Worum geht es in dieser Studie?</h2>
				<p className="text-gray-700">
					Diese Forschungsstudie untersucht die Wirksamkeit verschiedener Elemente in
					digitalen Lernumgebungen. Hierbei wird das Verhalten der Teilnehmenden erfasst
					und überprüft, welche Elemente potentiellen Einfluss auf das Verhalten nehmen.
					Das Verhalten der Teilnehmenden hat keinerlei Einfluss auf die Bewertung in
					einer Lehrveranstaltung, ausgenommen Bonuspunkte für eine Teilnahme an der
					Studie selbst.
				</p>
			</div>

			<div>
				<h2 className="mb-3 text-xl font-semibold">Was passiert während der Studie?</h2>
				<ul className="list-inside list-disc space-y-2 text-gray-700">
					<li> Während der Studie werden Sie verschiedene Lernmodule durchlaufen.</li>
					<li>
						{" "}
						Die Plattform passt sich den Versuchsteilnehmenden an, wodurch
						Versuchsteilnehmende möglicherweise unterschiedliche Erfahrungen im Umgang
						mit der Plattform erleben.
					</li>
					<li>
						{" "}
						Die Lerninhalte werden nicht angepasst oder verändert und sind für alle
						Teilnehmende identisch.{" "}
					</li>

					<li> Die Studie läuft bis zum {formatDateStringFull(EXPERIMENT_END_DATE)} </li>
				</ul>
			</div>

			<div>
				<h2 className="mb-3 text-xl font-semibold">Welche Daten werden erhoben?</h2>
				<ul className="list-inside list-disc space-y-2 text-gray-700">
					<li>Ergebnis der Abschlussklausur {KURS_TITLE}</li>
					<li>Lernfortschritte und -zeiten</li>
					<li>Bewertungen und Testergebnisse</li>
					<li>Dein Verhalten auf der Plattform, wie z.&nbsp;B.:</li>
					<ul className="list-inside list-disc ml-6 space-y-1">
						<li>Interaktionen mit Elementen der Plattform</li>
						<li>Aufenthaltsdauer</li>
						<li>Klicks</li>
						<li>Zugriffszeiten</li>
					</ul>
				</ul>
				<p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
					{showFull ? fullText : shortText}
					{!showFull && (
						<button
							type="button"
							className="ml-2 text-emerald-700 underline hover:text-emerald-900"
							onClick={() => setShowFull(true)}
						>
							Mehr anzeigen
						</button>
					)}
				</p>
			</div>

			<div>
				<h2 className="mb-3 text-xl font-semibold">Ihre Rechte</h2>
				<ul className="list-inside list-disc space-y-2 text-gray-700">
					<li>Die Teilnahme ist vollständig freiwillig</li>
					<li>Sie können jederzeit ohne Angabe von Gründen aussteigen</li>
					<li>Ihre bereits erhobenen Daten können auf Wunsch gelöscht werden</li>
					<li>
						Falls an der Studie <strong>nicht</strong> teilgenommen wird, ist die
						Nutzung der Plattform und ihrer Lerninhalte <strong>dennoch</strong>{" "}
						möglich. Teilnehmende erhalten keinen Zugriff auf zusätzliche Lerninhalte
						die für den Kurs {KURS_TITLE} erforderlich sind.
					</li>
				</ul>
			</div>
		</div>
	);
}
