export function PdfViewer({ url }: { url: string }) {
	return <iframe src={url} title="pdf-viewer" width="100%" height="100%"></iframe>;
}
