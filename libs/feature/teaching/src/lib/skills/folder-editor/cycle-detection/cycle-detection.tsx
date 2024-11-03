import { SkillFormModel } from "@self-learning/types";
import { Alert, SimpleDialog } from "@self-learning/ui/common";
import { useState } from "react";

export function ShowCyclesDialog({ cycleParticipants }: { cycleParticipants: SkillFormModel[] }) {
	const [openExplanation, setShowDialog] = useState<boolean>(false);

	if (cycleParticipants.length > 0) {
		return (
			<>
				<Alert
					type={{
						severity: "ERROR",
						message: (
							<div>
								<button
									onClick={() => setShowDialog(true)}
									className="text-left hover:cursor-pointer hover:text-red-700"
								>
									<span>
										Warnung: In Ihrer Modellierung der Lernziele ist ein Zyklus
										vorhanden. Aufgrund dessen kann der Algorithmus keinen
										gültigen Lernpfad mit den im Zyklus beteiligten Lernzielen
										finden. Die angegebenen Pfadziele sind nicht erreichbar und
										können nur privat gespeichert werden. Die betroffenen Skills
										können durch Klicken auf diesen Text angezeigt werden.
									</span>
								</button>
							</div>
						)
					}}
				/>
				{openExplanation && (
					<SimpleDialog
						style={{ height: "50vh", width: "50vw", overflow: "auto" }}
						name={"Zyklen - Darstellung"}
						onClose={() => setShowDialog(false)}
					>
							<CycleComponents cycles={cycleParticipants} />
					</SimpleDialog>
				)}
			</>
		);
	}

	return null;
}

function CycleComponents<S extends { id: string, name: string, children: string[], parents: string[] }>(
	{ cycles }: { cycles: S[] }
) {
	const first = cycles[0];
	const last = cycles[cycles.length - 1];
	const isCycle = last.children.includes(first.id);

	return (
		<div className="flex flex-col items-center space-y-4 p-5 bg-gray-50 rounded-lg shadow-lg">
			{cycles.map((cycle, index) => (
				<div key={cycle.id} className="flex items-center space-x-2">
					<div
						className={`p-4 rounded-lg text-lg font-semibold ${
							index === 0 ? 'bg-blue-200' : index === cycles.length - 1 && isCycle ? 'bg-red-200' : 'bg-gray-200'
						}`}
					>
						{cycle.name}
					</div>
					{index < cycles.length - 1 && (
						<span className="text-gray-400 text-2xl">→</span>
					)}
					{index === cycles.length - 1 && isCycle && (
						<span className="text-red-500">
							<span className="text-2xl">→</span>
							<span className="text-xl">↻</span>
						</span>
					)}
				</div>
			))}
		</div>
	);
}

export type SkillProps = { repoId: string; skills: SkillFormModel[] };
