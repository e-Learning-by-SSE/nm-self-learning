export function webvttToText(vtt: string): string {
  return vtt
    .split('\n')
    .filter((line) => !line.includes('WEBVTT') && !line.includes('-->'))
    .join(' ');
}