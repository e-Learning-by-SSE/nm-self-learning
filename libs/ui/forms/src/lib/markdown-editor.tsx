"use client";
import { ChevronDownIcon, ItalicIcon, PencilIcon } from "@heroicons/react/24/solid";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Dialog, DialogActions, IconButton, OnDialogCloseFn } from "@self-learning/ui/common";
import ReactMarkdown from "react-markdown";
import { EditorField } from "./editor";
import { AssetPickerButton } from "./upload";
import { editor } from "monaco-editor";
import {
	ListBulletIcon,
	NumberedListIcon,
	PhotoIcon,
	BoldIcon,
	LinkIcon
} from "@heroicons/react/24/outline";
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
		<div>
			<div className="flex items-center gap-2">
				<div
					className="flex-1 cursor-pointer rounded-lg border border-light-border bg-white p-2 min-h-8"
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

			{!inline && (
				<div className="flex justify-end bottom-0 right-0 py-2">
					<IconButton
						icon={<PencilIcon className="h-5 w-5" />}
						variant="tertiary"
						text="Bearbeiten"
						onClick={() => setOpenEditor(true)}
						title="Beschreibung bearbeiten"
					/>
				</div>
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
			<div className="grid h-full grid-cols-2 items-start gap-8 overflow-hidden">
				<div className="flex h-full w-full flex-col gap-2">
					<label className="text-sm font-semibold">Markdown</label>
					{editorInstance && <EditorQuickActions editor={editorInstance} />}
					<EditorField
						language="markdown"
						onChange={value => setValue(value ?? "")}
						onMount={handleEditorDidMount}
						value={value}
						height={"100%"}
					/>
				</div>

				<div className="flex h-full w-full flex-col gap-2 overflow-auto">
					<span className="relative flex justify-between">
						<label className="text-sm font-semibold">Vorschau</label>
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
					Speichern
				</button>
			</DialogActions>
		</Dialog>
	);
}

type FORMAT_TYPES =
	| "BOLD"
	| "ITALIC"
	| "ORDERED_LIST"
	| "UNORDERED_LIST"
	| "HEADER"
	| "LANGUAGE"
	| "LINK"
	| "IMAGE";

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
	const selectedImageSize = useRef("300");
	const selectedImageHeight = useRef("");

	const applyMarkdownFormat = useCallback(
		(formatType: FORMAT_TYPES) => {
			if (!editor) return;
			const selection = editor.getSelection();
			const model = editor.getModel();
			if (!selection || !model) return;

			let newCursorPosition = null;
			const setCursorPos = (lineColumn: number) => {
				newCursorPosition = selection.getStartPosition().delta(0, lineColumn);
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
				case "LINK":
					if (!selectedText) {
						formattedText = `[your-description](your-link)`;
						setCursorPos(1);
					} else {
						formattedText = `[${selectedText}](url)`;
						const selectedTextLength = selectedText.length;
						setCursorPos(selectedTextLength + 3);
					}
					break;
				default:
					break;
			}

			editor.executeEdits("", [{ range, text: formattedText, forceMoveMarkers: true }]);
			if (newCursorPosition) {
				editor.setPosition(newCursorPosition);
			}
			editor.focus();
		},
		[editor]
	);

	const handleCloseUploadDialog = async () => {};

	const iconSize = "h-5";

	return (
		<div className="mb-2 rounded-xl bg-gray-200 p-2">
			<div className="flex flex-wrap gap-1">
				{[
					{ title: "Bold", format: "BOLD", content: <BoldIcon className={iconSize} /> },
					{
						title: "Italic",
						format: "ITALIC",
						content: <ItalicIcon className={iconSize} />
					},
					{
						title: "Unordered List",
						format: "UNORDERED_LIST",
						content: <ListBulletIcon className={iconSize} />
					},
					{
						title: "Ordered List",
						format: "ORDERED_LIST",
						content: <NumberedListIcon className={iconSize} />
					},
					{
						title: "Link",
						format: "LINK",
						content: <LinkIcon className={iconSize} />
					}
				].map(({ title, format, content }) => (
					<button
						key={format}
						title={title}
						type="button"
						className="btn-icon"
						onClick={() => applyMarkdownFormat(format as FORMAT_TYPES)}
					>
						{content}
					</button>
				))}

				<CombinedImageButton
					editor={editor}
					selectedImageSize={selectedImageSize}
					selectedImageHeight={selectedImageHeight}
					onCloseUploadDialog={handleCloseUploadDialog}
				/>

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
/*
	This component implements its own markdown formatting logic because it combines two distinct formatting pipelines:
	1. Standard markdown rendering using shared remarkPlugins/rehypePlugins from @self-learning/markdown
	2. Custom editor toolbar formatting (applyMarkdownFormat function) that handles standard markdown syntax insertion
	3. Specialized image formatting (CombinedImageButton) that handles extended syntax like image attributes {width=300 height=200}
*/
function CombinedImageButton({
	editor,
	selectedImageSize,
	selectedImageHeight,
	onCloseUploadDialog
}: {
	editor: editor.IStandaloneCodeEditor;
	selectedImageSize: React.MutableRefObject<string>;
	selectedImageHeight: React.MutableRefObject<string>;
	onCloseUploadDialog: () => Promise<void>;
}) {
	const imageSizes: Array<{
		key: string;
		label: string;
		description: string;
		width: number;
	}> = [
		{ key: "100", label: "XS", description: "100px", width: 2 },
		{ key: "150", label: "S", description: "150px", width: 3 },
		{ key: "200", label: "M", description: "200px", width: 4 },
		{ key: "300", label: "L", description: "300px", width: 6 },
		{ key: "400", label: "XL", description: "400px", width: 7 },
		{ key: "500", label: "XXL", description: "500px", width: 8 },
		{ key: "100%", label: "Full", description: "Volle Breite", width: 10 }
	];

	const [selectedSize, setSelectedSize] = useState("300");
	const [showImageOptions, setShowImageOptions] = useState(false);

	const selectedSizeData = imageSizes.find(size => size.key === selectedSize) || imageSizes[3];

	const handleSizeSelect = (key: string) => {
		setSelectedSize(key);
		selectedImageSize.current = key;
	};

	const handleHeightChange = (height: string) => {
		selectedImageHeight.current = height;
	};

	const insertImageMarkdown = () => {
		const selection = editor.getSelection();
		const model = editor.getModel();
		if (!selection || !model) return;

		const selectedText = model.getValueInRange(selection).trim();

		let attributes = `width=${selectedSize}`;
		if (selectedImageHeight.current) {
			attributes += ` height=${selectedImageHeight.current}`;
		}
		const imageMarkdown = selectedText
			? `![your-description {${attributes}}](${selectedText})`
			: `![your-description {${attributes}}](link-to-your-img)`;

		editor.executeEdits("", [
			{
				range: selection,
				text: imageMarkdown,
				forceMoveMarkers: true
			}
		]);

		const newPosition = selectedText
			? selection.getStartPosition().delta(0, selectedText.length + 3)
			: selection.getStartPosition().delta(0, 2);
		editor.setPosition(newPosition);
		editor.focus();
		setShowImageOptions(false);
	};

	const handleAssetPicker = (url: string | undefined) => {
		if (url) {
			let attributes = `width=${selectedSize}`;
			if (selectedImageHeight.current) {
				attributes += ` height=${selectedImageHeight.current}`;
			}

			const imageMarkdown = `![Image {${attributes}}](${url})`;
			const selection = editor.getSelection();
			const model = editor.getModel();
			if (selection && model) {
				editor.executeEdits("", [
					{
						range: selection,
						text: imageMarkdown,
						forceMoveMarkers: true
					}
				]);
				editor.focus();
			}
		}
		setShowImageOptions(false);
		onCloseUploadDialog();
	};

	return (
		<div className="relative inline-block">
			<button
				type="button"
				className="btn-icon"
				onClick={() => setShowImageOptions(!showImageOptions)}
				title="Bild einfügen"
			>
				<PhotoIcon className="h-5 w-5" />
			</button>

			{showImageOptions && (
				<div className="absolute z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
					<div className="p-3 border-b border-gray-100">
						<div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
							<PhotoIcon className="h-5 w-5 text-secondary" />
							Bild einfügen
						</div>
					</div>

					<div className="p-3 border-b border-gray-100">
						<div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
							Breite wählen
						</div>
						<div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
							{imageSizes.map(size => (
								<button
									key={size.key}
									className={`flex items-center justify-between p-2 text-left rounded-md transition-all duration-150 hover:bg-emerald-50 ${
										selectedSize === size.key
											? "bg-emerald-100 border border-emerald-200 shadow-sm"
											: "hover:shadow-sm border border-transparent"
									}`}
									onClick={() => handleSizeSelect(size.key)}
								>
									<div className="flex items-center space-x-2">
										<div>
											<div className="font-medium text-xs text-gray-900">
												{size.label}
											</div>
											<div className="text-xs text-gray-500">
												{size.description}
											</div>
										</div>
									</div>
									{selectedSize === size.key && (
										<div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
									)}
								</button>
							))}
						</div>
					</div>

					<div className="p-3 border-b border-gray-100">
						<div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
							Höhe (optional)
						</div>
						<div className="flex gap-2">
							<input
								type="text"
								placeholder="z.B. 200, 150px, 50%"
								defaultValue={selectedImageHeight.current}
								onChange={e => handleHeightChange(e.target.value)}
								className="flex-1 p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-transparent"
							/>
							{selectedImageHeight.current && (
								<button
									type="button"
									onClick={() => {
										handleHeightChange("");
										setShowImageOptions(false);
										setTimeout(() => setShowImageOptions(true), 0);
									}}
									className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
									title="Höhe zurücksetzen"
								>
									✕
								</button>
							)}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							Leer lassen für automatische Höhe
						</div>
					</div>

					<div className="p-3 space-y-2">
						<button
							type="button"
							className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 text-sm font-medium"
							onClick={insertImageMarkdown}
						>
							Markdown-Link einfügen
						</button>

						<div className="w-full">
							<AssetPickerButton copyToClipboard={true} onClose={handleAssetPicker} />
						</div>
					</div>

					<div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
						<div className="text-xs text-gray-500 text-center">
							Größe: {selectedSizeData.description}
							{selectedImageHeight.current && ` × ${selectedImageHeight.current}`}
						</div>
					</div>
				</div>
			)}

			{showImageOptions && (
				<div className="fixed inset-0 z-10" onClick={() => setShowImageOptions(false)} />
			)}
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
