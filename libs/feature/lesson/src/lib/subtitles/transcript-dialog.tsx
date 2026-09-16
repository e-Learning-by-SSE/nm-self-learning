import { Dialog, showToast } from "@self-learning/ui/common";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { webvttToText } from "./webvtt_helper";

export function ShowTranskript({ webvttTranscript }: { webvttTranscript: string }) {
	const { t } = useTranslation("feature-lesson");
	const [showTranscript, setShowTranscript] = useState(false);

	return (
		<>
			<button
				type="button"
				className="text-lg text-center text-gray-500 hover:text-secondary"
				onClick={() => setShowTranscript(true)}
			>
				{t("show_transcript")}
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
	const { t } = useTranslation("feature-lesson");
	const transcript = useMemo(() => {
		return webvttToText(webvttTranscript);
	}, [webvttTranscript]);

	const handleCopy = () => {
		navigator.clipboard
			.writeText(transcript)
			.then(() => {
				showToast({
					type: "success",
					title: t("transcript_copied_title"),
					subtitle: t("transcript_copied_subtitle")
				});
			})
			.catch(() => {
				showToast({
					type: "error",
					title: t("transcript_copy_error_title"),
					subtitle: t("transcript_copy_error_subtitle")
				});
			});
	};

	return (
		<Dialog
			onClose={onClose}
			title={t("transcript_dialog_title")}
			style={{ width: "60vw", maxHeight: "80vh" }}
		>
			<Transcript transcript={transcript} />
			<div className="mt-4 flex place-content-between">
				<button onClick={handleCopy} className="btn btn-primary">
					{t("copy")}
				</button>
				<button onClick={onClose} className="btn bg-red-500 hover:bg-red-600 text-white">
					{t("close")}
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
