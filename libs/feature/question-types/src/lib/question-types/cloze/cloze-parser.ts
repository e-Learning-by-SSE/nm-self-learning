export type Gap = {
	type: "C" | "T";
	values: {
		text: string;
		isCorrect: boolean;
	}[];
	startIndex: number;
	endIndex: number;
};

// {C: [#OptionWrong, OptionCorrect]}
// {T: [Text]}
// {T: [Text, Alternative]}

//Cloze regex catches all cloze gaps in the text
// eslint-disable-next-line no-useless-escape
const clozeRegex = /(?:{[TC]\: \[((?:#*(?:[A-Za-zÄÜÖäüö]+|(?:\$\$.+\$\$)),* *)+)\]})/gm;

//Latex regex detects if latex is used in the cloze gap
// eslint-disable-next-line no-useless-escape
const latexRegex = /\$\$[^\$]+\$\$/gm;
const GAP_PLACEHOLDER = "{GAP}";

export function parseCloze(text: string): Gap[] {
	const gaps: Gap[] = [];

	const lines = text.split("\n");
	const latexMap = new Map<string, string>();

	// checks line break style because they are different in windows and linux
	const lineBreakLength = text.includes("\r\n") ? 2 : 1;
	let lineIndex = 0;

	for (let i = 0; i < lines.length; i++) {
		//removes all line breaks
		lines[i] = lines[i].replace(/\r/g, "");
		lines[i] = lines[i].replace(/\n/g, "");

		const matches = [...lines[i].matchAll(clozeRegex)];
		if (matches && matches.length > 0) {
			for (const match of matches) {
				let valueString = match[1];
				const hasLatex = [...valueString.matchAll(latexRegex)];

				//replace latex with a random key to prevent the parser from parsing the latex
				for (let j = 0; j < hasLatex.length; j++) {
					const latex = hasLatex[j];
					const latexKey = "$" + j + "$";
					valueString = valueString.replace(latex[0], latexKey);
					latexMap.set(latexKey, latex[0]);
				}
				//gets the values of the gab
				const values: Gap["values"] = [];
				valueString.split(",").forEach(value => {
					const trimmedValue = value.trim();
					values.push({
						//remove the #
						text: replacePlaceholderWithLatex(
							trimmedValue.startsWith("#") ? trimmedValue.slice(1) : trimmedValue,
							latexMap
						),
						isCorrect: !trimmedValue.startsWith("#")
					});
				});

				//startindex for each line for the gap in the cloze text
				gaps.push({
					type: match[0].startsWith("{T") ? "T" : "C",
					values: values,
					startIndex: lineIndex + (match.index ?? 0),
					endIndex: lineIndex + (match.index ?? 0) + match[0].length - 1
				});
			}
		}
		// adds length of line breaks to index
		lineIndex += lines[i].length + lineBreakLength;
	}

	return gaps;
}

function replacePlaceholderWithLatex(text: string, latexMap: Map<string, string>) {
	return latexMap.get(text.trim()) ?? text;
}

export function insertPlaceholder(text: string, gaps: Gap[]): string {
	let index = 0;
	let result = "";

	for (const gap of gaps) {
		result += text.slice(index, gap.startIndex);
		result += GAP_PLACEHOLDER;
		index = gap.endIndex + 1;
	}

	result += text.slice(index);

	return result;
}

export function createCloze(text: string): { gaps: Gap[]; segments: string[] } {
	const gaps = parseCloze(text);
	const placeholderText = insertPlaceholder(text, gaps);
	return {
		gaps,
		segments: placeholderText.split(GAP_PLACEHOLDER)
	};
}
