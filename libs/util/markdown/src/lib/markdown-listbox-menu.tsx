import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useRef } from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "./markdown";
import { MinorScaleFadeIn } from "@self-learning/ui/common";

/**
 * A dropdown listbox component using Headless UI with support for rendering Markdown.
 * Displays a list of selectable options with optional focus styling and a custom button style.
 *
 * @component
 *
 * @param {string} title - Tooltip text shown when hovering over the button.
 * @param {"top" | "bottom"} [dropdownPosition="bottom"] - Position of the dropdown relative to the button.
 * @param {(option: string) => void} onChange - Callback triggered when an option is selected.
 * @param {(focus: boolean) => string} [customFocusStyle] - Optional function to provide custom class names for focused items.
 * @param {string} [customButtonStyle] - Optional Tailwind class string for custom button styling
 * @param {string | null | undefined} displayValue - The currently selected option to display in the button.
 * @param {string[]} options - Array of options to display in the dropdown, each rendered as Markdown.
 *
 * @example
 * <MarkdownListboxMenu
 *   title="Select difficulty"
 *   displayValue={selectedLevel}
 *   options={["**Easy**", "**Medium**", "**Hard**"]}
 *   onChange={setSelectedLevel}
 *   customFocusStyle={(focus) => (focus ? "bg-blue-500 text-white" : "text-gray-800")}
 *   constomButtonStyle="w-full border px-4 py-2 text-left rounded"
 * />
 */
export function MarkdownListboxMenu({
	title,
	dropdownPosition = "bottom",
	customFocusStyle,
	customButtonStyle,
	displayValue,
	options,
	onChange
}: {
	title: string;
	dropdownPosition?: "top" | "bottom";
	onChange: (option: string) => void;
	customFocusStyle?: (focus: boolean) => string;
	customButtonStyle?: string;
	displayValue: string | null | undefined;
	options: string[];
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	const onChangeWrapper = (option: string | null) => {
		if (option) {
			onChange(option);
		}
	};

	return (
		<Listbox onChange={onChangeWrapper} value={displayValue}>
			<ListboxButton
				ref={buttonRef}
				as="button"
				title={title}
				className={
					customButtonStyle
						? customButtonStyle
						: "items-center justify-between px-3 py-2 border rounded space-x-2 w-full"
				}
			>
				{({ open }) => (
					<div className={"flex flex-row justify-between gap-1"}>
						<div className={"justify-start"}>
							<div className="prose prose-sm max-w-none">
								<ReactMarkdown
									remarkPlugins={remarkPlugins}
									rehypePlugins={rehypePlugins}
								>
									{displayValue === "" ? "Select an option" : displayValue}
								</ReactMarkdown>
							</div>
						</div>
						{open ? (
							<ChevronUpIcon className="h-5 w-5 justify-end" aria-hidden="true" />
						) : (
							<ChevronDownIcon className="h-5 w-5 justify-end" aria-hidden="true" />
						)}
					</div>
				)}
			</ListboxButton>

			<MinorScaleFadeIn>
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

									<div
										className={`prose prose-sm max-w-none ml-2 cursor-default ${
											customFocusStyle
												? customFocusStyle(focus)
												: focus
													? "text-white"
													: ""
										}`}
									>
										<ReactMarkdown
											remarkPlugins={remarkPlugins}
											rehypePlugins={rehypePlugins}
										>
											{option}
										</ReactMarkdown>
									</div>
								</div>
							)}
						</ListboxOption>
					))}
				</ListboxOptions>
			</MinorScaleFadeIn>
		</Listbox>
	);
}
