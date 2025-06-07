import { trpc } from "@self-learning/api-client";
import { useRouter } from "next/router";

export function ExperimentShortInfo() {
	const { data: experimentStatus } = trpc.me.getExperimentStatus.useQuery();
	const router = useRouter();

	const statusText = () => {
		if (experimentStatus?.isParticipating ?? false) {
			return <span className="text-green-600 font-bold">Teilnehmer*in.</span>;
		}
		return <span className="text-red-600 font-bold">Keine Teilnahme.</span>;
	};

	return (
		<>
			<div className="space-y-4 border-b border-gray-500 pb-4">
				<p>
					Auf der SELF-le@rning Plattform findet eine Forschungsstudie der Universität
					Hildesheim statt, mit dem Ziel die Wirksamkeit der Lernplattform zu untersuchen.
				</p>
				<p>
					Die Teilnahme an der Studie ist freiwillig und kann jederzeit ohne Angabe von
					Gründen abgebrochen werden. Ihre Daten werden ausschließlich zu
					Forschungszwecken verwendet
				</p>
			</div>
			<p> Dein Status: {statusText()} </p>
			<p>
				<button
					className="btn-secondary"
					onClick={() => router.push("/experiment/consent")}
				>
					Informationen & Einstellungen{" "}
				</button>
			</p>
		</>
	);
}
