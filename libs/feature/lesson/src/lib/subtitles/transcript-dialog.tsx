import { Dialog, showToast } from "@self-learning/ui/common";
import { useMemo } from "react";
import { webvttToText } from "./webvtt_helper";

export function TranscriptDialog({
	onClose,
	webVTTtranscript
}: {
	onClose: () => void;
	webVTTtranscript: string;
}) {
	const transcript = useMemo(() => {
		return webvttToText(webVTTtranscript);
	}, [webVTTtranscript]);

	const handleCopy = () => {
		navigator.clipboard
			.writeText(transcript)
			.then(() => {
				showToast({
					type: "success",
					title: "Transkript kopiert",
					subtitle: "Das Transkript wurde in die Zwischenablage kopiert."
				});
			})
			.catch(() => {
				showToast({
					type: "error",
					title: "Fehler beim Kopieren",
					subtitle: "Das Transkript konnte nicht in die Zwischenablage kopiert werden."
				});
			});
	};

	return (
		<Dialog onClose={onClose} title="Transcript" style={{ width: "60vw", maxHeight: "80vh" }}>
			<Transcript transcript={transcript} />
			<div className="mt-4 flex place-content-between">
				<button onClick={handleCopy} className="btn btn-primary">
					Kopieren
				</button>
				<button onClick={onClose} className="btn bg-red-500 hover:bg-red-600">
					Schließen
				</button>
			</div>
		</Dialog>
	);
}

function Transcript({ transcript }: { transcript: string }) {
	return (
		<div className="overflow-x-auto">
			{transcript.split("\n").map((line, index) => (
				<p key={index}>{line}</p>
			))}
		</div>
	);
}
