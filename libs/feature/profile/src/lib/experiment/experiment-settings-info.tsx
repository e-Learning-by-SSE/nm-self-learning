import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { inferRouterOutputs } from "@trpc/server";
import { useRouter } from "next/router";
import { z } from "zod";

type ExperimentShortInfoProps = inferRouterOutputs<AppRouter>["me"]["getExperimentStatus"];

export function ExperimentShortInfo(props: ExperimentShortInfoProps) {
	const router = useRouter();

	const statusText = () => {
		if (props.isParticipating) {
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
