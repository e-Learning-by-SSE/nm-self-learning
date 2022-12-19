import { Fragment, useCallback, useRef } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { createCloze, Gap } from "./cloze-parser";
type SetAnswerFn = (index: number, answer: string) => void;

export default function ClozeAnswer() {
	const { question, answer, setAnswer, evaluation } = useQuestion("cloze");

	const cloze = useRef(createCloze(question.clozeText)).current;
	const onUpdateAnswer = useCallback(
		(index: number, ans: string) => {
			setAnswer(prev => ({
				type: "cloze",
				value: { ...prev.value, [index]: ans }
			}));
		},
		[setAnswer]
	);

	return (
		<>
			<pre className="prose max-w-[75ch] whitespace-pre-line font-sans">
				{cloze.segments.map((segment, index) => (
					<Fragment key={index}>
						<span>{segment}</span>
						{cloze.gaps[index] && (
							<RenderGapType
								gap={cloze.gaps[index]}
								index={index}
								setAnswer={onUpdateAnswer}
								value={answer.value[index] ?? ""}
								disabled={!!evaluation}
							/>
						)}
					</Fragment>
				))}
			</pre>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<ul className="flex flex-col gap-2">
						{evaluation.incorrectAnswers.map(ans => (
							<li key={ans.index} className="flex flex-col">
								<span className="font-medium">Lücke {ans.index + 1}:</span>
								<span className="pl-4">Antwort: {ans.studentAnswer}</span>
								<span className="pl-4">
									Erwartet: {ans.intendedAnswers.join(" | ")}
								</span>
							</li>
						))}
					</ul>
				</Feedback>
			)}
		</>
	);
}

export function RenderGapType({
	gap,
	setAnswer,
	index,
	value,
	disabled
}: {
	gap: Gap;
	value: string;
	index: number;
	setAnswer: SetAnswerFn;
	disabled: boolean;
}) {
	if (gap.type === "C") {
		return (
			<select
				className="select"
				value={value}
				onChange={e => setAnswer(index, e.target.value)}
				disabled={disabled}
			>
				<option value={""}>-</option>
				{gap.values.map(value => (
					<option key={value.text} value={value.text}>
						{value.text}
					</option>
				))}
			</select>
		);
	}

	if (gap.type === "T") {
		return (
			<input
				type="text"
				className="textfield mx-1"
				value={value}
				onChange={e => setAnswer(index, e.target.value)}
				disabled={disabled}
			/>
		);
	}

	return <span className="text-red-500">Unknown gap type: {gap.type}</span>;
}
