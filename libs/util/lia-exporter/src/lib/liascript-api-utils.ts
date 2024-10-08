import liascriptify from "@liascript/markdownify";
import { ExportOptions, MissedElement } from "./lia-exporter";

/**
 * Used to make absolute paths to media files on our storage server relative.
 */
export type MediaFileReplacement = {
	source: string;
	destination: string;
};

/**
 * Allowed indentation levels for LiaScript sections.
 */
const indentationLevels = [1, 2, 3, 4, 5, 6] as const; // dont export this
export const maxIndentationLevel = Math.max(...indentationLevels);
export type IndentationLevels = (typeof indentationLevels)[number];
export function parseIndent(indent: number) {
	return isSupportedIndentationLevel(indent)
		? (indent as IndentationLevels)
		: (maxIndentationLevel as IndentationLevels);
}
export function isSupportedIndentationLevel(value: number): value is IndentationLevels {
	return value >= 1 && value < maxIndentationLevel;
}

export type LiaScriptSection = {
	title: string;
	indent: IndentationLevels;
	body?: (string | object)[];
};

/**
 * Minimalistic specification regarding the expected input format of the LiaScript API.
 */
export type ExportFormat = {
	meta?: object;
	sections: LiaScriptSection[];
};

/**
 * Low-level function to export any course to a LiaScript course.
 * Requires a well-formed JSON object as specified by the LiaScript API.
 * @param json A course already in the LiaScript API format.
 * @returns A single page markdown string.
 */
export function liaScriptExport(json: ExportFormat) {
	return liascriptify(json) as Promise<string>;
}

export function toPlainText(markdown: string) {
	// This regular expression matches Markdown headers.
	// It captures the leading # symbols and header text separately.
	const headerRegex = /^(#+)(.*)$/gm;

	const escapedHeaders = markdown.replace(headerRegex, (match, hashes, text) => {
		// Remove leading and trailing whitespace from the header text and add a colon
		const headerText = text.trim() + ":";

		// Return the transformed header
		return headerText;
	});

	// Replace all newlines with spaces
	return escapedHeaders.replace(/(\r\n|\n|\r)+/g, " ");
}

export function removeStorageUrls(
	text: string,
	{
		storageUrls = undefined,
		storageDestination = ""
	}: {
		storageUrls?: string[];
		storageDestination?: string;
	}
) {
	const resources: MediaFileReplacement[] = [];
	for (const url of storageUrls ?? []) {
		const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${url}\\/([\\w|_-]*)\\)`, "g");
		text = text.replace(regex, (match, captureGroup1, captureGroup2) => {
			const dest = `${storageDestination}${captureGroup2}`;
			const mediaFile: MediaFileReplacement = {
				source: `${url}/${captureGroup2}`,
				destination: dest
			};

			resources.push(mediaFile);
			return `![${captureGroup1}](${dest})`;
		});
	}

	return { text, resources };
}

/**
 * Fixes markdown texts to be compatible with the LiaScript API:
 * - Wraps headers in section-tags to avoid page breaks
 * - Removes line numbers from code blocks, which are not supported by LiaScript
 * @param markdownText The markdown formatted text to convert.
 * @param htmlTag As specified by the LiaScript API, either "section" or "article".
 * @returns The converted markdown text.
 * @see https://liascript.github.io/course/?https://raw.githubusercontent.com/liaScript/docs/master/README.md#10
 */
export function markdownify(
	markdownText: string,
	onUnsupportedItem: (missedElement: MissedElement) => void,
	{
		htmlTag = "section",
		removeLineNumbers = true,
		storageUrls = undefined,
		storageDestination = ""
	}: {
		htmlTag?: "section" | "article" | "div";
		removeLineNumbers?: boolean;
		storageUrls?: string[];
		storageDestination?: string;
	}
) {
	/**
	 * Determines the level of a Markdown header.
	 * @param line A line of Markdown text, ideally a header starting with a least one #.
	 * @returns The level of the header, or 0 if the line is not a header.
	 */
	function sectionLevel(line: string) {
		const titleLevel = line.match(/^#+/);
		const level = titleLevel ? titleLevel[0].length : 0;

		return level;
	}

	const lines = markdownText.split("\n");
	const levels = [0];
	const errorCause: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.startsWith("#")) {
			const lastLevel = levels[levels.length - 1];
			const level = sectionLevel(line);

			if (level == lastLevel) {
				// A new header on the same level as the previous one
				// Close the previous header and open a new one

				lines.splice(i++, 0, `</${htmlTag}>\n`);
				lines.splice(i++, 0, `<${htmlTag}>\n`);
			} else if (level > lastLevel) {
				// A new header on a higher level than the previous one
				// Open a new header

				lines.splice(i++, 0, `<${htmlTag}>\n`);
				levels.push(level);
			} else if (level < lastLevel) {
				// A new header on a lower level than the previous one
				// Close all previous headers until we reach the same level and start a new one

				const nLevelsClosed = lastLevel - level;
				for (let j = 0; j <= nLevelsClosed; j++) {
					levels.pop();
					lines.splice(i++, 0, `</${htmlTag}>\n`);
				}
				lines.splice(i++, 0, `<${htmlTag}>\n`);
				levels.push(level);
			}
		} else if (removeLineNumbers && line.startsWith("```") && line.length > 3) {
			// Removes unsupported line numbers from code blocks
			// Actually, this removes everything after the first space (language spec)
			const index = line.indexOf(" ");
			if (index > 0) {
				if (line.includes("showLineNumbers")) {
					if (line.indexOf("{") > 0) {
						//get only the lines to highlight
						let highlightComment = '\n<!-- data-marker="';
						const numbers = line
							.slice(line.indexOf("{") + 1, line.indexOf("}"))
							.split(",");
						numbers.forEach(number => {
							//work with single or multiple lines
							if (number.includes("-")) {
								// highlight is y1, x1, y2, x2, color, type
								const range = number.split("-");
								highlightComment += `${+range[0] - 1} 0 ${
									+range[1] - 1
								} 80 yellow text;`;
							} else {
								highlightComment += `${+number - 1} 0 ${
									+number - 1
								} 80 yellow text;`;
							}
						});
						highlightComment += '" -->';
						lines.splice(i, 0, highlightComment);
						i++; // if we added something make fix the position of i
					}
				} else {
					errorCause.push("Unsupported Code Style");
				}
				lines[i] = line.slice(0, index);
			}
		}
	}
	// Close all remaining levels
	while (levels.length > 1) {
		levels.pop();
		lines.push(`</${htmlTag}>\n`);
	}

	const markdownStr = lines.join("\n").trim();

	if (storageUrls) {
		const { text, resources } = removeStorageUrls(markdownStr, {
			storageUrls,
			storageDestination
		});
		return { markdown: text, resources };
	}
	if (errorCause.length > 0) {
		onUnsupportedItem({
			type: "article",
			id: "id",
			cause: errorCause
		});
	}

	const resources: MediaFileReplacement[] = [];
	return { markdown: markdownStr, resources };
}

/**
 * Selects the narrator voice for the exported course.
 * @param options Options for the export, which include the narrator voice.
 * @see https://liascript.github.io/course/?https://raw.githubusercontent.com/liaScript/docs/master/README.md#189
 */
export function selectNarrator(options: NonNullable<ExportOptions>) {
	switch (options.language) {
		case "de":
			return options.narrator == "female" ? "Deutsch Female" : "Deutsch Male";
		case "en":
			return options.narrator == "female" ? "US English Female" : "US English Male";
		default:
			return "Deutsch Female";
	}
}
