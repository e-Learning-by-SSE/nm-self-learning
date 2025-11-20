import React, { Fragment, useCallback, useRef } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { createCloze, Gap } from "./cloze-parser";
import ReactMarkdown from "react-markdown";
import { MarkdownListboxMenu, rehypePlugins, remarkPlugins } from "@self-learning/markdown";

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
						<ReactMarkdown
							remarkPlugins={remarkPlugins}
							rehypePlugins={rehypePlugins}
							components={{
								p(props: React.ComponentProps<"p">) {
									const { ...rest } = props;
									return <span {...rest} />;
								}
							}}
						>
							{segment ?? ""}
						</ReactMarkdown>
						{cloze.gaps[index] && (
							<span className="ml-1 inline-block align-middle">
								<RenderGapType
									gap={cloze.gaps[index]}
									index={index}
									setAnswer={onUpdateAnswer}
									value={answer.value[index] ?? ""}
									disabled={!!evaluation}
								/>
							</span>
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
	value,
	index,
	setAnswer,
	disabled
}: {
	gap: Gap;
	value: string;
	index: number;
	setAnswer: (index: number, value: string) => void;
	disabled: boolean;
}) {
	if (gap.type === "C") {
		return (
			<MarkdownListboxMenu
				onChange={option => setAnswer(index, option)}
				title={""}
				dropdownPosition={"bottom"}
				displayValue={value}
				options={gap.values.map(value => value.text)}
				customButtonStyle={
					"items-center justify-between px-3 py-2 border rounded space-x-2"
				}
			/>
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

	return <span className="text-c-danger">Unknown gap type: {gap.type}</span>;
}
