import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Dialog, DialogActions, PencilButton, OnDialogCloseFn } from "@self-learning/ui/common";
import ReactMarkdown from "react-markdown";
import { EditorField } from "./editor";
import { AssetPickerButton } from "./upload";
import { editor } from "monaco-editor";
import { ListBulletIcon, NumberedListIcon } from "@heroicons/react/24/outline";
import { useCallback, useRef, useState } from "react";

export function MarkdownField({
	content,
	setValue,
	inline,
	placeholder
}: {
	content: string | undefined;
	setValue: (v: string | undefined) => void;
	inline?: boolean;
	placeholder?: string;
}) {
	const [openEditor, setOpenEditor] = useState(false);

	return (
		<div className={inline ? "flex flex-col gap-1" : ""}>
			{!inline && (
				<div className="mb-2 flex items-end justify-end">
					<PencilButton
						buttonTitle="Bearbeiten"
						onClick={() => setOpenEditor(true)}
						title="Beschreibung bearbeiten"
					/>
				</div>
			)}

			<div
				className={
					"cursor-pointer rounded-lg border border-light-border bg-white " +
					(inline ? "p-2" : "flex p-4")
				}
				style={{ minHeight: 32 }}
				onClick={() => setOpenEditor(true)}
			>
				<div className={"max-w-full" + (inline && " text-sm")}>
					{content !== "" ? (
						<MarkdownViewer content={content ?? ""} />
					) : (
						<div className="text-gray-400">{placeholder}</div>
					)}
				</div>
			</div>

			{openEditor && (
				<MarkdownEditorDialog
					initialValue={content ?? ""}
					title="Bearbeiten"
					onClose={changes => {
						setOpenEditor(false);
						if (changes !== undefined) {
							setValue(changes);
						}
					}}
				/>
			)}
		</div>
	);
}

export function MarkdownEditorDialog({
	title,
	initialValue,
	onClose
}: {
	title: string;
	initialValue: string;
	onClose: OnDialogCloseFn<string>;
}) {
	const [value, setValue] = useState(initialValue);
	const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);

	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
		setEditorInstance(editor);
	};

	return (
		<Dialog
			style={{ height: "85vh", width: "85vw" }}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			title={title}
		>
			<div className="grid h-full grid-cols-2 items-start gap-8 overflow-hidden pt-4">
				<div className="flex h-full w-full flex-col gap-2">
					<label className="text-sm font-semibold">Markdown</label>
					{editorInstance && <EditorQuickActions editor={editorInstance} />}
					<EditorField
						language="markdown"
						onChange={value => value && setValue(value)}
						onMount={handleEditorDidMount}
						value={value}
						height={"100%"}
					/>
				</div>

				<div className="flex h-full w-full flex-col gap-2 overflow-auto">
					<span className="relative flex justify-between">
						<label className="text-sm font-semibold">Preview</label>
						<div className="absolute right-0 -top-4 flex gap-4">
							<AssetPickerButton
								copyToClipboard={true}
								onClose={() => {
									/** NOOP */
								}}
							/>
						</div>
					</span>
					<div className="relative flex w-full grow overflow-auto border border-light-border bg-white p-4">
						<div className="prose prose-emerald w-full">
							<ReactMarkdown
								remarkPlugins={remarkPlugins}
								rehypePlugins={rehypePlugins}
							>
								{value ?? ""}
							</ReactMarkdown>
						</div>
					</div>
				</div>
			</div>

			<DialogActions onClose={onClose}>
				<button type="button" className="btn-primary" onClick={() => onClose(value)}>
					Übernehmen
				</button>
			</DialogActions>
		</Dialog>
	);
}

type FORMAT_TYPES = "BOLD" | "ITALIC" | "ORDERED_LIST" | "UNORDERED_LIST" | "HEADER" | "LANGUAGE";

function createFormattedList(type: "ordered" | "unordered", text: string) {
	return text
		.split("\n")
		.map((line, i) => (type === "ordered" ? `${i + 1}. ${line}` : `- ${line}`))
		.join("\n");
}

const MD_LANG_BLOCK = "```";

function EditorQuickActions({ editor }: { editor: editor.IStandaloneCodeEditor }) {
	const selectedHeader = useRef("H1");
	const selectedLanguage = useRef("javascript");

	const applyMarkdownFormat = useCallback(
		(formatType: FORMAT_TYPES) => {
			if (!editor) return;
			const selection = editor.getSelection();
			const model = editor.getModel();
			if (!selection || !model) return;

			const setCursorPos = (lineColumn: number) => {
				const insertPosition = selection.getStartPosition().delta(0, lineColumn);
				editor.setPosition(insertPosition);
			};

			const selectedText = model.getValueInRange(selection).trim();
			const range = selection;
			let formattedText = "";
			switch (formatType) {
				case "BOLD":
					if (!selectedText) {
						formattedText = `****`;
						setCursorPos(2);
					} else {
						formattedText = `**${selectedText}**`;
					}
					break;
				case "ITALIC":
					if (!selectedText) {
						formattedText = `**`;
						setCursorPos(1);
					} else {
						formattedText = `*${selectedText}*`;
					}
					break;
				case "UNORDERED_LIST":
					if (!selectedText) {
						formattedText = `- `;
						setCursorPos(2);
					} else {
						formattedText = createFormattedList("unordered", selectedText);
					}
					break;
				case "ORDERED_LIST":
					if (!selectedText) {
						formattedText = `1. `;
						setCursorPos(3);
					} else {
						formattedText = createFormattedList("ordered", selectedText);
					}
					break;
				case "HEADER":
					if (!selectedText) {
						formattedText = `${"#".repeat(parseInt(selectedHeader.current[1]))} `;
						setCursorPos(formattedText.length);
					} else {
						formattedText = `${"#".repeat(parseInt(selectedHeader.current[1]))} ${selectedText}`;
					}
					break;
				case "LANGUAGE":
					if (!selectedText) {
						formattedText = `${MD_LANG_BLOCK}${selectedLanguage.current}\n\n${MD_LANG_BLOCK}`;
						setCursorPos(selectedLanguage.current.length + 6);
					} else {
						formattedText = `${MD_LANG_BLOCK}${selectedLanguage.current}\n${selectedText}\n${MD_LANG_BLOCK}`;
					}
					break;
				default:
					break;
			}

			editor.executeEdits("", [{ range, text: formattedText, forceMoveMarkers: true }]);
			editor.focus();
		},
		[editor]
	);
	return (
		<div className="mb-2 flex flex-col rounded-xl bg-gray-200 p-2">
			<div className="flex flex-wrap gap-1">
				{[
					{ title: "Bold", format: "BOLD", content: <strong>B</strong> },
					{ title: "Italic", format: "ITALIC", content: <em>I</em> },
					{
						title: "Unordered List",
						format: "UNORDERED_LIST",
						content: <ListBulletIcon className="icon h-5 w-5" />
					},
					{
						title: "Ordered List",
						format: "ORDERED_LIST",
						content: <NumberedListIcon className="icon h-5 w-5" />
					}
				].map(({ title, format, content }) => (
					<button
						key={format}
						title={title}
						type="button"
						className="btn-stroked"
						onClick={() => applyMarkdownFormat(format as FORMAT_TYPES)}
					>
						{content}
					</button>
				))}

				<EditorQuickActionsHeaderDropdown
					onChange={value => {
						selectedHeader.current = value;
						applyMarkdownFormat("HEADER");
					}}
				/>

				<EditorQuickActionsCodeDropdown
					onChange={value => {
						selectedLanguage.current = value;
						applyMarkdownFormat("LANGUAGE");
					}}
				/>
			</div>
		</div>
	);
}

function EditorQuickActionsHeaderDropdown({ onChange }: { onChange: (value: string) => void }) {
	const headers = ["H1", "H2", "H3", "H4", "H5"];
	const [selectedHeader, setSelectedHeader] = useState("H1");
	const [menuOpen, setMenuOpen] = useState(false);

	const handleMenuSelect = (header: string) => {
		setSelectedHeader(header);
		onChange(header);
		setMenuOpen(false);
	};

	return (
		<div className="relative inline-block">
			<button
				type="button"
				className="btn-stroked flex items-center space-x-1 px-3 py-2"
				onClick={() => setMenuOpen(!menuOpen)}
			>
				{selectedHeader}
				<div className="ml-2" />
				<ChevronDownIcon className="icon" />
			</button>
			{menuOpen && (
				<div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
					{headers.map(header => (
						<button
							key={header}
							className="block w-full p-2 text-left hover:bg-gray-100"
							onClick={() => handleMenuSelect(header)}
						>
							{header}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function EditorQuickActionsCodeDropdown({ onChange }: { onChange: (value: string) => void }) {
	const languages: Record<string, string> = {
		javascript: "JavaScript",
		python: "Python",
		java: "Java",
		csharp: "C#",
		ruby: "Ruby",
		go: "Go",
		php: "PHP"
	};
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");
	const [menuOpen, setMenuOpen] = useState(false);

	const handleMenuSelect = (key: string) => {
		setSelectedLanguage(key);
		onChange(key);
		setMenuOpen(false);
	};

	return (
		<div className="relative inline-block">
			<button
				type="button"
				className="btn-stroked flex items-center space-x-1 px-3 py-2"
				onClick={() => setMenuOpen(!menuOpen)}
			>
				{languages[selectedLanguage]}
				<div className="ml-2" />
				<ChevronDownIcon className="icon" />
			</button>
			{menuOpen && (
				<div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
					{Object.entries(languages).map(([key, value]) => (
						<button
							key={key}
							className="block w-full p-2 text-left hover:bg-gray-100"
							onClick={() => handleMenuSelect(key)}
						>
							{value}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Client-side Markdown renderer.
 *
 * If possible, prefer server-side rendering instead of using this component.
 */
export function MarkdownViewer({ content }: { content: string }) {
	return (
		<div className="prose prose-emerald">
			<ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
				{content ?? ""}
			</ReactMarkdown>
		</div>
	);
}
