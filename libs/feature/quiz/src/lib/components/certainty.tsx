import { useMemo, useState } from "react";

export function Certainty() {
	const { certainty, certaintyPhrase, setCertainty } = useCertainty(100);
	return (
		<div className="grid items-start gap-4">
			<span className="text-xl tracking-tighter">Wie sicher bist du dir ?</span>

			<div className="mt-2 flex flex-col">
				<input
					type="range"
					min={0}
					max={100}
					step={25}
					value={certainty}
					onChange={e => setCertainty(e.target.valueAsNumber)}
					className="w-full"
				/>
				<span className="mt-1 text-right text-slate-400">
					Ich bin mir{" "}
					<span className="font-semibold text-slate-700">{certaintyPhrase}</span>.
				</span>
			</div>
		</div>
	);
}

function useCertainty(initialCertainty: number) {
	const [certainty, setCertainty] = useState(initialCertainty);

	const certaintyPhrase = useMemo(() => {
		return mapCertainty(certainty);
	}, [certainty]);

	return { certainty, setCertainty, certaintyPhrase };
}

function mapCertainty(certainty: number): string {
	if (certainty < 25) {
		return "überhaupt nicht sicher";
	}
	if (certainty < 50) {
		return "leicht unsicher";
	}
	if (certainty < 75) {
		return "leicht sicher";
	}
	if (certainty < 100) {
		return "sehr sicher";
	}
	if (certainty >= 100) {
		return "absolut sicher";
	}

	return "";
}
