export class PDFParse {
	constructor(_options: unknown) {}

	async getText(): Promise<{ text: string }> {
		return {
			text: "Mocked PDF text"
		};
	}

	async destroy(): Promise<void> {
		// noop
	}
}
