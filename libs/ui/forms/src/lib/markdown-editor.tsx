import { PencilIcon } from "@heroicons/react/24/solid";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { EditorField } from "./editor";
import { AssetPickerButton } from "./upload";
import { editor } from "monaco-editor";

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
						<ReactMarkdown
							linkTarget="_blank"
							remarkPlugins={remarkPlugins}
							rehypePlugins={rehypePlugins}
						>
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
					{editorInstance && <EditorQuickActions
						editor={editorInstance}
					/>}
					<EditorField
						language="markdown"
						onChange={setValue as any}
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
								linkTarget="_blank"
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
	const [selectedHeader, setSelectedHeader] = useState("H1");
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");

	const applyMarkdownFormat = (
		formatType: "BOLD" | "ITALIC" | "ORDEREDLIST" | "UNORDEREDLIST" | "HEADER" | "LANGUAGE"
	) => {
		if(!editor) return;
		const selection = editor.getSelection();
		if (selection === null) return;
		const selectedText = editor.getModel()?.getValueInRange(selection);

		let formattedText = "";

		switch (formatType) {
			case "BOLD":
				formattedText = `**${selectedText?.trim()}**`;
				break;
			case "ITALIC":
				formattedText = `*${selectedText?.trim()}*`;
				break;
			case "UNORDEREDLIST":
				formattedText = `- ${selectedText?.trim()}`;
				break;
			case "ORDEREDLIST":
				formattedText = `1. ${selectedText?.trim()}`;
				break;
			case "HEADER":
				formattedText = `${"#".repeat(
					parseInt(selectedHeader[1])
				)} ${selectedText?.trim()}`;
				break;
			case "LANGUAGE":
				formattedText = `\`\`\`${selectedLanguage}\n${selectedText?.trim()}\n\`\`\``;
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
		<div className="mb-2 flex flex-col bg-gray-200 p-2 rounded-xl">
			<div className="flex gap-1">
				<button
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("BOLD")}
				>
					<strong>B</strong>
				</button>
				<button
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("ITALIC")}
				>
					<em>I</em>
				</button>
				<button
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("UNORDEREDLIST")}
				>
					UL
				</button>
				<button
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("ORDEREDLIST")}
				>
					OL
				</button>
				<select
					title="Header"
					className="btn-stroked"
					value={selectedHeader}
					onChange={e => setSelectedHeader(e.target.value)}
				>
					<option value="H1">H1</option>
					<option value="H2">H2</option>
					<option value="H3">H3</option>
					<option value="H4">H4</option>
					<option value="H5">H5</option>
				</select>
				<button
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("HEADER")}
				>
					Add Header
				</button>
			</div>
			<div className="mt-2 flex gap-2 p-0">
				<select
				title="Language"
					className="btn-stroked"
					value={selectedLanguage}
					onChange={e => setSelectedLanguage(e.target.value)}
				>
					<option value="javascript">JavaScript</option>
					<option value="python">Python</option>
					<option value="java">Java</option>
					<option value="csharp">C#</option>
					<option value="ruby">Ruby</option>
					<option value="go">Go</option>
					<option value="php">PHP</option>
				</select>
				<button
					type="button"
					className="btn-stroked"
					onClick={() => applyMarkdownFormat("LANGUAGE")}
				>
					Add Code Block
				</button>
			</div>
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
		<ReactMarkdown
			linkTarget="_blank"
			remarkPlugins={remarkPlugins}
			rehypePlugins={rehypePlugins}
		>
			{content ?? ""}
		</ReactMarkdown>
	);
}
