import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { EditorField } from "./editor";
import { AssetPickerButton } from "./upload";

export function MarkdownField({
	content,
	setValue,
	minHeight
}: {
	content: string | undefined;
	setValue: (v: string | undefined) => void;
	minHeight?: string;
}) {
	const _minHeight = minHeight ?? "500px";
	const [height, setHeight] = useState(_minHeight);

	return (
		<div className="flex flex-col">
			<div className="grid items-start gap-8 xl:grid-cols-2">
				<div className="flex h-full w-full flex-col gap-2">
					<label className="text-sm font-semibold">Markdown</label>
					<EditorField
						language="markdown"
						onChange={setValue}
						value={content}
						height={height}
					/>
				</div>

				<div className="flex h-full w-full flex-col gap-2">
					<span className="relative flex justify-between">
						<label className="text-sm font-semibold">Preview</label>
						<div className="absolute right-0 -top-4 flex gap-4">
							<button
								type="button"
								onClick={() =>
									setHeight(prev => (prev === _minHeight ? "75vh" : _minHeight))
								}
								className="text-xs text-secondary"
							>
								{height === _minHeight
									? "Ansicht vergrößern"
									: "Ansicht verkleinern"}
							</button>
							<AssetPickerButton
								copyToClipboard={true}
								onClose={() => {
									/** NOOP */
								}}
							/>
						</div>
					</span>
					<div
						className="relative flex w-full grow overflow-auto border border-light-border bg-white p-4"
						style={{ maxHeight: height }}
					>
						<div className="prose prose-emerald w-full">
							<ReactMarkdown
								remarkPlugins={remarkPlugins}
								rehypePlugins={rehypePlugins}
							>
								{content ?? ""}
							</ReactMarkdown>
						</div>
					</div>
				</div>
			</div>
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
		<ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
			{content ?? ""}
		</ReactMarkdown>
	);
}
