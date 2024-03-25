import { PencilIcon } from "@heroicons/react/24/solid";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { EditorField } from "./editor";
import { AssetPickerButton } from "./upload";

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

	return (
		<Dialog
			style={{ height: "85vh", width: "85vw" }}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			title={title}
		>
			<div className="grid h-full grid-cols-2 items-start gap-8 overflow-hidden pt-4">
				<div className="flex h-full w-full flex-col gap-2">
					<label className="text-sm font-semibold">Markdown</label>
					<EditorField
						language="markdown"
						onChange={setValue as any}
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
					<div className="relative flex h-full w-full grow overflow-auto border border-light-border bg-white p-4">
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
