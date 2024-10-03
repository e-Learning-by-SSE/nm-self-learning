import { ChevronDownIcon, PencilIcon } from "@heroicons/react/24/solid";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { EditorField } from "./editor";
import { AssetPickerButton } from "./upload";
import { editor } from "monaco-editor";
import { ListBulletIcon, NumberedListIcon } from "@heroicons/react/24/outline";

export function MarkdownField({
	content,
	setValue,
	label,
	inline,
	placeholder
}: {
	label?: string;
	content: string | undefined;
	setValue: (v: string | undefined) => void;
	inline?: boolean;
	placeholder?: string;
}) {
	const [openEditor, setOpenEditor] = useState(false);

	return (
		<div className={inline ? "flex flex-col gap-1" : ""}>
			{!inline && (
				<div className="flex items-end justify-between">
					<span className="text-sm font-semibold">{label ?? "Markdown"}</span>
					<button
						type="button"
						className="btn-stroked w-fit self-end"
						onClick={() => setOpenEditor(true)}
					>
						<PencilIcon className="icon" />
						<span>Bearbeiten</span>
					</button>
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
				<div className={"prose prose-emerald max-w-full" + (inline && " text-sm")}>
					{content !== "" ? (
						<ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
							{content ?? ""}
						</ReactMarkdown>
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

function EditorQuickActions({ editor }: { editor: editor.IStandaloneCodeEditor }) {
	const selectedHeader = useRef<string>("H1");
	const selectedLanguage = useRef<string>("javascript");

	const createList = (type: "ordered" | "unordered", selectedText: string) => {
		let formattedList = "";
		if (type === "ordered") {
			formattedList = selectedText
				?.split("\n")
				.map((line, i) => `${i + 1}. ${line}`)
				.join("\n");
		} else {
			formattedList = selectedText
				?.split("\n")
				.map(line => `- ${line}`)
				.join("\n");
		}
		return formattedList;
	};

	const applyMarkdownFormat = (
		formatType: "BOLD" | "ITALIC" | "ORDEREDLIST" | "UNORDEREDLIST" | "HEADER" | "LANGUAGE"
	) => {
		if (!editor) return;
		const selection = editor.getSelection();
		if (selection === null) return;
		const selectedText = editor.getModel()?.getValueInRange(selection);
		if (!selectedText) return;

		let formattedText = "";

		switch (formatType) {
			case "BOLD":
				formattedText = `**${selectedText?.trim()}**`;
				break;
			case "ITALIC":
				formattedText = `*${selectedText?.trim()}*`;
				break;
			case "UNORDEREDLIST":
				formattedText = createList("unordered", selectedText?.trim());
				break;
			case "ORDEREDLIST":
				formattedText = createList("ordered", selectedText?.trim());
				break;
			case "HEADER":
				formattedText = `${"#".repeat(
					parseInt(selectedHeader.current[1])
				)} ${selectedText?.trim()}`;
				break;
			case "LANGUAGE":
				formattedText = `\`\`\`${
					selectedLanguage.current
				}\n${selectedText?.trim()}\n\`\`\``;
				break;
			default:
				break;
		}

		editor.executeEdits("", [
			{
				range: selection,
				text: formattedText,
				forceMoveMarkers: true
			}
		]);
	};

	return (
		<div className="mb-2 flex flex-col rounded-xl bg-gray-200 p-2">
			<div className="flex flex-wrap gap-1">
				<button
					title="Bold"
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("BOLD")}
				>
					<strong>B</strong>
				</button>
				<button
					title="Italic"
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("ITALIC")}
				>
					<em>I</em>
				</button>
				<button
					title="Ungeordnete Liste"
					type="button"
					className="btn-stroked flex items-center justify-center"
					onClick={() => applyMarkdownFormat("UNORDEREDLIST")}
				>
					<ListBulletIcon className="icon h-5 w-5" />
				</button>
				<button
					title="Geordnete Liste"
					type="button"
					className="btn-stroked flex items-center justify-center"
					onClick={() => applyMarkdownFormat("ORDEREDLIST")}
				>
					<NumberedListIcon className="icon h-5 w-5" />
				</button>

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
		<ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
			{content ?? ""}
		</ReactMarkdown>
	);
}
