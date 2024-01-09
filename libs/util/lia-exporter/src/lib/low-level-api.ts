import liascriptify from "@liascript/markdownify";

export type IndentationLevels = 1 | 2 | 3 | 4 | 5 | 6;

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

/**
 * Fixes markdown texts to be compatible with the LiaScript API:
 * - Wraps headers in section-tags to avoid page breaks
 * - Removes line numbers from code blocks, which are not supported by LiaScript
 * @param markdownText The markdown formatted text to convert.
 * @param htmlTag As specified by the LiaScript API, either "section" or "article".
 * @returns The converted markdown text.
 */
export function markdownify(
	markdownText: string,
	options: { htmlTag?: "section" | "article"; removeLineNumbers?: boolean } = {
		htmlTag: "section",
		removeLineNumbers: true
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

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.startsWith("#")) {
			const lastLevel = levels[levels.length - 1];
			const level = sectionLevel(line);

			if (level == lastLevel) {
				// A new header on the same level as the previous one
				// Close the previous header and open a new one

				lines.splice(i++, 0, `</${options.htmlTag}>\n`);
				lines.splice(i++, 0, `<${options.htmlTag}>\n`);
			} else if (level > lastLevel) {
				// A new header on a higher level than the previous one
				// Open a new header

				lines.splice(i++, 0, `<${options.htmlTag}>\n`);
				levels.push(level);
			} else if (level < lastLevel) {
				// A new header on a lower level than the previous one
				// Close all previous headers until we reach the same level and start a new one

				const nLevelsClosed = lastLevel - level;
				for (let j = 0; j <= nLevelsClosed; j++) {
					levels.pop();
					lines.splice(i++, 0, `</${options.htmlTag}>\n`);
				}
				lines.splice(i++, 0, `<${options.htmlTag}>\n`);
				levels.push(level);
			}
		} else if (options.removeLineNumbers && line.startsWith("```") && line.length > 3) {
			// Removes unsupported line numbers from code blocks
			// Actually, this removes everything after the first space (language spec)

			const index = line.indexOf(" ");
			lines[i] = line.slice(0, index);
		}
	}

	// Close all remaining levels
	while (levels.length > 1) {
		levels.pop();
		lines.push(`</${options.htmlTag}>\n`);
	}

	return lines.join("\n").trim();
}
