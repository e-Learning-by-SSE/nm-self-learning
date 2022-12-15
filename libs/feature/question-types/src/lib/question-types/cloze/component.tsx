import { useQuestion } from "../../use-question-hook";

export default function ClozeAnswer() {
	const { question } = useQuestion("cloze");

	console.log(parseClozeText(question.clozeText));

	return (
		<div className="flex flex-col gap-8">
			<pre className="prose font-sans">{question.clozeText}</pre>
		</div>
	);
}

type Gap = {
	type: "MC" | "T";
	values: {
		text: string;
		isCorrect: boolean;
	}[];
	startIndex: number;
	endIndex: number;
};

// {MC: [#true, false]}
function parseClozeText(text: string): Gap | null {
	const startGap = text.indexOf("{");
	const endGap = text.indexOf("}", startGap + 1);
	const gap = text.substring(startGap + 1, endGap);

	const match = gap.match(/(?<type>MC|T): ?(?<values>\[?,?#?.+\])/);

	console.log({ match });
}
