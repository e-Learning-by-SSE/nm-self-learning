import { SubtitleSrc } from "@self-learning/types";

export async function ConvertTranscriptionToSubtitle(transcription: SubtitleSrc): Promise<string> {
    let vttString = "WEBVTT\n\n";
    transcription.segments.forEach((segment) => {
        vttString += `${convertSecondsToVttTime(segment.start)} --> ${convertSecondsToVttTime(segment.end)} \n ${segment.text}\n\n`;
    });
    return vttString;
}

function convertSecondsToVttTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);

    const twoDigitHourse = hours.toString().padStart(2, "0");
    const twoDigitMinutes = minutes.toString().padStart(2, "0");
    const twoDigitSeconds = remainingSeconds.toString().padStart(2, "0");
    const threeDigitMilliseconds = milliseconds.toString().padStart(3, "0");

    return `${twoDigitHourse}:${twoDigitMinutes}:${twoDigitSeconds}.${threeDigitMilliseconds}`;
}
