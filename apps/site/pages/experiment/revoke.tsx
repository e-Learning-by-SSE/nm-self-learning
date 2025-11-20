import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { getExperimentStatus } from "@self-learning/profile";
import { showToast } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useLoginRedirect, withAuth } from "@self-learning/util/auth";
import { useState } from "react";
import Link from "next/link";

interface ExperimentRevokeProps {
	hasConsented: boolean;
	consentDate?: Date;
}

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<ExperimentRevokeProps>(async (_, user) => {
		const data = await getExperimentStatus(user.name);

		return {
			props: {
				hasConsented: data.isParticipating,
				consentDate: data.consentDate || undefined
			}
		};
	})
);

export default function ExperimentRevokePage({ hasConsented, consentDate }: ExperimentRevokeProps) {
	const { loginRedirect } = useLoginRedirect();
	const [hasUnderstoodConsequences, setHasUnderstoodConsequences] = useState(false);
	const [wantsDataDeletion, setWantsDataDeletion] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { mutateAsync: updateConsent } = trpc.me.submitExperimentConsent.useMutation();

	async function handleRevokeConsent() {
		if (!hasUnderstoodConsequences) return;

		setIsSubmitting(true);
		try {
			await updateConsent({
				consent: false
			});
			showToast({
				type: "success",
				title: "Einverständnis widerrufen",
				subtitle: "Ihre Teilnahme an der Studie wurde beendet."
			});
			loginRedirect("/profile");
		} catch (error) {
			console.log("Error revoking consent:", error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Der Widerruf konnte nicht verarbeitet werden."
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	if (!hasConsented) {
		return (
			<CenteredSection>
				<div className="mx-auto max-w-4xl">
					<NoConsentFound />
				</div>
			</CenteredSection>
		);
	}

	return (
		<CenteredSection>
			<div className="mx-auto max-w-4xl">
				<div className="rounded-lg bg-white p-8 shadow-md">
					<div className="mb-8">
						<div className="flex items-center gap-4 mb-4">
							<ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
							<h1 className="text-3xl font-bold">
								Einverständnis zur Studienteilnahme widerrufen
							</h1>
						</div>
						<p className="text-lg text-gray-600">
							Sie können Ihr Einverständnis zur Teilnahme an der Forschungsstudie
							jederzeit ohne Angabe von Gründen widerrufen.
						</p>
					</div>

					<CurrentConsentStatus consentDate={consentDate} />
					<ConsequencesInformation />
					<DataDeletionOptions
						wantsDataDeletion={wantsDataDeletion}
						setWantsDataDeletion={setWantsDataDeletion}
					/>

					<div className="mt-8 space-y-6 border-t pt-8">
						<h2 className="text-xl font-semibold">Bestätigung des Widerrufs</h2>

						<div className="space-y-4">
							<label className="flex items-start gap-3">
								<input
									type="checkbox"
									checked={hasUnderstoodConsequences}
									onChange={e => setHasUnderstoodConsequences(e.target.checked)}
									className="mt-1 h-4 w-4 rounded border-c-border-strong text-c-danger focus:ring-c-danger"
								/>
								<span className="text-sm">
									Ich habe die Konsequenzen des Widerrufs verstanden und möchte
									meine Teilnahme an der Forschungsstudie beenden. Mir ist
									bewusst, dass ich dadurch keine Bonuspunkte für die
									Abschlussklausur erhalte.
								</span>
							</label>
						</div>

						<div className="flex gap-4 pt-4">
							<button
								onClick={handleRevokeConsent}
								disabled={!hasUnderstoodConsequences || isSubmitting}
								className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 flex items-center gap-2"
							>
								{isSubmitting ? (
									"Wird verarbeitet..."
								) : (
									<>
										<XMarkIcon className="h-5 w-5" />
										Einverständnis widerrufen
									</>
								)}
							</button>

							<Link
								href="/experiment/consent"
								className="btn-stroked inline-flex items-center"
							>
								Zurück zur Übersicht
							</Link>
						</div>
					</div>

					<div className="mt-8 border-t pt-6 text-center">
						<p className="text-xs text-gray-500">
							Bei Fragen zum Widerruf können Sie sich jederzeit an das Forschungsteam
							wenden:
							<a
								href="mailto:spark@uni-hildesheim.de"
								className="text-emerald-600 hover:underline ml-1"
							>
								spark@uni-hildesheim.de
							</a>
						</p>
					</div>
				</div>
			</div>
		</CenteredSection>
	);
}

function NoConsentFound() {
	return (
		<div className="rounded-lg bg-white p-8 shadow-md">
			<div className="text-center">
				<XMarkIcon className="mx-auto h-16 w-16 text-gray-400" />
				<h1 className="mt-4 text-2xl font-bold">Kein aktives Einverständnis</h1>
				<p className="mt-2 text-gray-600">
					Sie haben derzeit kein aktives Einverständnis zur Studienteilnahme.
				</p>
				<div className="mt-6">
					<Link href="/experiment/consent" className="btn-primary">
						Zur Einverständniserklärung
					</Link>
				</div>
			</div>
		</div>
	);
}

function CurrentConsentStatus({ consentDate }: { consentDate?: Date }) {
	return (
		<div className="mb-8 rounded-lg bg-blue-50 p-6 border border-blue-200">
			<h2 className="text-xl font-semibold text-blue-900 mb-3">Aktueller Status</h2>
			<div className="text-blue-800">
				<p>
					<strong>Einverständnis erteilt am:</strong>{" "}
					{consentDate?.toLocaleDateString("de-DE")}
				</p>
				<p className="mt-2">
					<strong>Aktueller Status:</strong> Aktive Teilnahme an der Forschungsstudie
				</p>
			</div>
		</div>
	);
}

function ConsequencesInformation() {
	return (
		<div className="mb-8 space-y-4">
			<h2 className="text-xl font-semibold">Konsequenzen des Widerrufs</h2>

			<div className="rounded-lg bg-amber-50 p-6 border border-amber-200">
				<h3 className="font-semibold text-amber-900 mb-3">Verlust der Bonuspunkte</h3>
				<div className="text-amber-800 space-y-2">
					<p>Bei einem Widerruf verlieren Sie:</p>
					<ul className="list-disc list-inside ml-4 space-y-1">
						<li>
							<strong>5% Bonuspunkte</strong> für die Abschlussklausur im Kurs{" "}
							{'"Dummy Kurs"'} (1234)
						</li>
						<li>
							Die Möglichkeit, diese Bonuspunkte zu einem späteren Zeitpunkt zu
							erhalten
						</li>
					</ul>
				</div>
			</div>

			<div className="rounded-lg bg-c-surface-1 p-4 border border-c-border">
				<h3 className="font-semibold text-gray-900 mb-2">
					Was passiert nach dem Widerruf?
				</h3>
				<ul className="list-disc list-inside text-sm text-c-text space-y-1">
					<li>Sie können die Lernplattform weiterhin normal nutzen</li>
					<li>Ihre Lernfortschritte bleiben erhalten</li>
					<li>Sie werden aus der Studiengruppe entfernt</li>
					<li>Keine weiteren Daten werden für die Studie erfasst</li>
				</ul>
			</div>
		</div>
	);
}

function DataDeletionOptions({
	wantsDataDeletion,
	setWantsDataDeletion
}: {
	wantsDataDeletion: boolean;
	setWantsDataDeletion: (value: boolean) => void;
}) {
	return (
		<div className="mb-8 space-y-4">
			<h2 className="text-xl font-semibold">Umgang mit bereits erhobenen Daten</h2>

			<div className="space-y-4">
				<div className="rounded-lg border border-c-border p-4">
					<label className="flex items-start gap-3 cursor-pointer">
						<input
							type="radio"
							name="dataHandling"
							checked={!wantsDataDeletion}
							onChange={() => setWantsDataDeletion(false)}
							className="mt-1 h-4 w-4 text-c-primary focus:ring-c-primary"
						/>
						<div>
							<span className="font-medium">Daten für die Forschung belassen</span>
							<p className="text-sm text-gray-600 mt-1">
								Ihre bis zum Widerruf erhobenen Daten verbleiben anonymisiert in der
								Studie. Dies unterstützt die wissenschaftliche Forschung, ohne dass
								ein Bezug zu Ihrer Person möglich ist.
							</p>
						</div>
					</label>
				</div>

				<div className="rounded-lg border border-c-border p-4">
					<label className="flex items-start gap-3 cursor-pointer">
						<input
							type="radio"
							name="dataHandling"
							checked={wantsDataDeletion}
							onChange={() => setWantsDataDeletion(true)}
							className="mt-1 h-4 w-4 text-c-danger focus:ring-c-danger"
						/>
						<div>
							<span className="font-medium">Vollständige Datenlöschung</span>
							<p className="text-sm text-gray-600 mt-1">
								Alle Ihre bisher erhobenen Studiendaten werden vollständig gelöscht.
								Dies kann die Aussagekraft der Forschungsergebnisse beeinträchtigen.
							</p>
						</div>
					</label>
				</div>
			</div>

			<div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
				<p className="text-sm text-blue-800">
					<strong>Hinweis:</strong> Ihre regulären Lernplattform-Daten (Fortschritte,
					Bewertungen, etc.) sind von dieser Entscheidung nicht betroffen und bleiben in
					jedem Fall erhalten.
				</p>
			</div>
		</div>
	);
}
