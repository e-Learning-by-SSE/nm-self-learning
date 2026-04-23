import { Dialog, showToast } from "@self-learning/ui/common";
import { useMemo, useState } from "react";
import { webvttToText } from "./webvtt_helper";

export function ShowTranskript({ webvttTranscript }: { webvttTranscript: string }) {
	const [showTranscript, setShowTranscript] = useState(false);

	return (
		<>
			<button
				type="button"
				className="text-lg text-center text-gray-500 hover:text-secondary"
				onClick={() => setShowTranscript(true)}
			>
				Video Transkript anzeigen
			</button>
			{showTranscript && (
				<TranscriptDialog
					onClose={() => setShowTranscript(false)}
					webvttTranscript={webvttTranscript}
				/>
			)}
		</>
	);
}

export function TranscriptDialog({
	onClose,
	webvttTranscript
}: {
	onClose: () => void;
	webvttTranscript: string;
}) {
	const transcript = useMemo(() => {
		return webvttToText(webvttTranscript);
	}, [webvttTranscript]);

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
				<button onClick={onClose} className="btn bg-red-500 hover:bg-red-600 text-white">
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
