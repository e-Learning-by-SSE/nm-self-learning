import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import React, { useRef } from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "./markdown";
import { DropwdownTransition } from "@self-learning/ui/common";

export function MarkdownListboxMenu({
	title,
	dropdownPosition = "bottom",
	customFocusStyle,
	constomButtonStyle,
	displayValue,
	options,
	onChange
}: {
	title: string;
	dropdownPosition?: "top" | "bottom";
	onChange: (option: string) => void;
	customFocusStyle?: (focus: boolean) => string;
	constomButtonStyle?: string;
	displayValue: string | null | undefined;
	options: string[];
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	return (
		<Listbox onChange={onChange} value={displayValue}>
			<ListboxButton
				ref={buttonRef}
				as="button"
				title={title}
				className={
					constomButtonStyle
						? constomButtonStyle
						: "items-center justify-between px-3 py-2 border rounded space-x-2 w-full"
				}
			>
				{({ open }) => (
					<div className={"flex flex-row justify-between gap-1"}>
						<div className={"justify-start"}>
							<ReactMarkdown
								remarkPlugins={remarkPlugins}
								rehypePlugins={rehypePlugins}
								className="prose prose-sm max-w-none"
							>
								{displayValue === "" ? "Select an option" : displayValue}
							</ReactMarkdown>
						</div>
						{open ? (
							<ChevronUpIcon className="h-5 w-5 justify-end" aria-hidden="true" />
						) : (
							<ChevronDownIcon className="h-5 w-5 justify-end" aria-hidden="true" />
						)}
					</div>
				)}
			</ListboxButton>

			<DropwdownTransition>
				<ListboxOptions
					anchor={dropdownPosition}
					className={`z-10 w-max min-w-[8rem] max-w-xs ${
						dropdownPosition === "top" ? "rounded-t" : "rounded-b"
					} bg-white shadow-lg cursor-default`}
					style={{
						minWidth: buttonRef.current?.offsetWidth || "auto"
					}}
				>
					{options.map((option, i) => (
						<ListboxOption value={option} key={i}>
							{({ focus, selected }) => (
								<div
									className={`w-full text-left px-3 py-1 flex items-center cursor-default ${
										customFocusStyle
											? customFocusStyle(focus)
											: focus
												? "text-white bg-secondary"
												: "text-gray-700"
									}`}
								>
									{selected ? (
										<CheckIcon
											className="h-5 w-5 inline-block cursor-default"
											aria-hidden="true"
										/>
									) : (
										<span
											className="h-5 w-5 inline-block cursor-default"
											aria-hidden="true"
										/>
									)}

									<ReactMarkdown
										remarkPlugins={remarkPlugins}
										rehypePlugins={rehypePlugins}
										className={`prose prose-sm max-w-none ml-2 cursor-default ${
											customFocusStyle
												? customFocusStyle(focus)
												: focus
													? "text-white"
													: ""
										}`}
									>
										{option}
									</ReactMarkdown>
								</div>
							)}
						</ListboxOption>
					))}
				</ListboxOptions>
			</DropwdownTransition>
		</Listbox>
	);
}
