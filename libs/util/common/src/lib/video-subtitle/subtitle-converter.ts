import { SubtitleSrc } from "@self-learning/types";

export async function ConvertTranscriptionToSubtitle(transcription: SubtitleSrc): Promise<string> {
	let vttString = "WEBVTT\n\n";
	transcription.segments.forEach(segment => {
		vttString += `${convertSecondsToVttTime(segment.start)} --> ${convertSecondsToVttTime(segment.end)} \n ${segment.text.trim()}\n\n`;
	});
	return vttString;
}

/**
 * Converts seconds to VTT time format (HH:MM:SS.mmm).
 * @param seconds - The time in seconds including milliseconds as a decimal (e.g., 90.5 for 1 minute and 30.5 seconds).
 */
function convertSecondsToVttTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor(seconds / 60) % 60;
	const s = Math.floor(seconds) % 60;
	const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);

	return (
		[
			h.toString().padStart(2, "0"),
			m.toString().padStart(2, "0"),
			s.toString().padStart(2, "0")
		].join(":") + `.${ms.toString().padStart(3, "0")}`
	);
}
