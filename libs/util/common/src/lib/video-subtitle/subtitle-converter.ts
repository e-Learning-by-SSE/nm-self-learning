import { SubtitleSrc } from "@self-learning/types";
import { format } from "date-fns";

export async function ConvertTranscriptionToSubtitle(transcription: SubtitleSrc): Promise<string> {
	let vttString = "WEBVTT\n\n";
	transcription.segments.forEach(segment => {
		vttString += `${convertSecondsToVttTime(segment.start)} --> ${convertSecondsToVttTime(segment.end)} \n ${segment.text.trim()}\n\n`;
	});
	return vttString;
}

// Converts seconds to VTT time format (HH:MM:SS.mmm)
// Supports only up to 24 hours, which is sufficient for video subtitles
function convertSecondsToVttTime(seconds: number): string {
	const date = new Date(seconds * 1000);
	return format(date, "HH:mm:ss.SSS");
}
