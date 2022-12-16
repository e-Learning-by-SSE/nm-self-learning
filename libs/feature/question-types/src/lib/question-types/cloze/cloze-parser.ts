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
const clozeRegex = /^(?<type>C|T): ?(?<values>\[.+\])$/;

const GAP_PLACEHOLDER = "{GAP}";

export function parseCloze(text: string): Gap[] {
	const gaps: Gap[] = [];
	let gap = parseNextGap(text);

	const maxIterations = 100;

	let i = 0;
	while (gap) {
		if (i++ > maxIterations) {
			throw new Error(`Still parsing cloze after max iterations (${maxIterations})!`);
		}

		gaps.push(gap);
		gap = parseNextGap(text, gap.endIndex + 1);
	}

	return gaps;
}

export function parseNextGap(text: string, searchIndex = 0): Gap | null {
	const startIndex = text.indexOf("{", searchIndex);
	const endIndex = text.indexOf("}", startIndex + 1);

	if (startIndex === -1 || endIndex === -1) return null;

	const gap = text.slice(startIndex + 1, endIndex);

	const match = gap.match(clozeRegex);

	if (!match || !match.groups) return null;

	const type = match.groups.type as Gap["type"];

	const values =
		match.groups?.values
			.slice(1, -1) // Remove brackets: [#a, b, c] -> #a, b, c
			.split(",") // Split by comma: #a, b, c -> ["#a", " b", " c"]
			.map(v => {
				let text = v.trim(); // Remove whitespace: " b" -> "b"
				let isCorrect = true;

				if (text.startsWith("#")) {
					isCorrect = false;
					text = text.slice(1); // Remove #: #a -> a
				}

				return { isCorrect, text };
			}) ?? [];

	return { type, values, startIndex, endIndex };
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
