import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	Transition
} from "@headlessui/react";
import React, { Fragment, useRef } from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import ReactMarkdown from "react-markdown";

export function MarkdownListboxMenu({
	title,
	dropdownPosition = "bottom",
	customFocusStyle,
	value,
	options,
	onChange
}: {
	title: string;
	dropdownPosition: "top" | "bottom";
	onChange: (option: string) => void;
	customFocusStyle?: (focus: boolean) => string;
	value: string | null | undefined;
	options: string[];
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	return (
		<Listbox onChange={onChange} value={value}>
			<ListboxButton
				ref={buttonRef}
				as="button"
				title={title}
				className="items-center justify-between px-3 py-2 border rounded space-x-2"
			>
				{({ open }) => (
					<div className={"flex items-center gap-1"}>
						<ReactMarkdown
							remarkPlugins={remarkPlugins}
							rehypePlugins={rehypePlugins}
							className="prose prose-sm max-w-none"
						>
							{value === "" ? "Select an option" : value}
						</ReactMarkdown>
						{open ? (
							<ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
						) : (
							<ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
						)}
					</div>
				)}
			</ListboxButton>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="opacity-0 scale-95"
				enterTo="opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="opacity-100 scale-100"
				leaveTo="opacity-0 scale-95"
			>
				<ListboxOptions
					anchor={dropdownPosition}
					className="z-10 w-max min-w-[8rem] max-w-xs rounded-md bg-white shadow-lg cursor-default"
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
												? "text-secondary border border-secondary"
												: "border border-transparent text-gray-700"
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
													? "text-secondary"
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
			</Transition>
		</Listbox>
	);
}
