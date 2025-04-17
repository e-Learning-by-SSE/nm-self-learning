import React, { Fragment, useCallback, useRef } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { createCloze, Gap } from "./cloze-parser";
import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

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
			<Menu as="span" className="relative inline-block align-baseline">
				<MenuButton
					className="inline-flex items-center px-2 py-1 text-sm border border-gray-300 bg-white rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1  disabled:opacity-50"
					disabled={disabled}
				>
					{value === "" ? (
						<div className={"flex"}>
							<ChevronDownIcon className={"w-5 h-5"} />
							<span className="text-gray-400">Auswahl...</span>
						</div>
					) : (
						<ReactMarkdown
							remarkPlugins={remarkPlugins}
							rehypePlugins={rehypePlugins}
							className="text-left prose prose-sm max-w-none"
							components={{
								p: ({ children }) => <span>{children}</span>
							}}
						>
							{value}
						</ReactMarkdown>
					)}
				</MenuButton>

				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<MenuItems className="absolute z-10 mt-1 w-max min-w-[8rem] max-w-xs rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
						<div className="py-1 max-h-48 overflow-auto text-sm">
							{gap.values.map((v, i) => (
								<MenuItem key={i}>
									{({ focus }) => (
										<button
											onClick={() => setAnswer(index, v.text)}
											className={`${
												focus
													? "bg-gray-100 text-gray-900"
													: "text-gray-700"
											} w-full text-left px-3 py-1`}
										>
											<ReactMarkdown
												remarkPlugins={remarkPlugins}
												rehypePlugins={rehypePlugins}
												className="prose prose-sm max-w-none"
											>
												{v.text ?? ""}
											</ReactMarkdown>
										</button>
									)}
								</MenuItem>
							))}
						</div>
					</MenuItems>
				</Transition>
			</Menu>
		);
	}

	if (gap.type === "T") {
		return (
			<input
				type="text"
				className="inline-block border border-gray-300 rounded px-2 py-1 text-sm mx-1 focus:ring-1 "
				value={value}
				onChange={e => setAnswer(index, e.target.value)}
				disabled={disabled}
			/>
		);
	}

	return <span className="text-red-500">Unknown gap type: {gap.type}</span>;
}
