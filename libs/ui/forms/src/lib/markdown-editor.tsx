import { trpc } from "@self-learning/api-client";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { MDXRemote } from "next-mdx-remote";
import { useEffect, useState } from "react";
import { EditorField } from "./editor";
import { MarkdownContainer } from "@self-learning/ui/layouts";
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
	const debounced = useDebounce(content, 500);

	const { data: preview, mutate, isLoading, isError } = trpc.mdx.useMutation();

	useEffect(() => {
		// Triggers compilation of new `preview`
		mutate({ text: debounced });
	}, [debounced, mutate]);

	const _minHeight = minHeight ?? "500px";
	const [height, setHeight] = useState(_minHeight);

	return (
		<div className="flex flex-col">
			<div className="grid grid-cols-2 items-start gap-8">
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
					<span className="flex justify-between">
						<label className="text-sm font-semibold">Preview</label>
						<div className="flex gap-4">
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
						{isLoading && (
							<span className="absolute top-2 left-2 text-sm text-light">
								Compiling...
							</span>
						)}
						{isError && (
							<span className="absolute top-2 left-2 text-sm text-red-500 text-light">
								ERROR
							</span>
						)}
						{preview && (
							<MarkdownContainer>
								<MDXRemote {...preview} />
							</MarkdownContainer>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function useDebounce<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
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
	const [value, setValue] = useState<string | undefined>(initialValue);
	const debounced = useDebounce(value, 500);
	const { data: preview, mutate, isLoading, isError } = trpc.mdx.useMutation();

	useEffect(() => {
		// Triggers compilation of new `preview`
		mutate({ text: debounced });
	}, [debounced, mutate]);

	return (
		<Dialog
			style={{ height: "85vh", width: "85vw" }}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			title={title}
		>
			<div className="flex h-full flex-col justify-between overflow-hidden">
				<div className="grid max-h-[60vh] grid-cols-2 gap-8 overflow-hidden">
					<div className="flex h-full w-full flex-col gap-1">
						<label className="text-sm font-semibold">Inhalt</label>
						<EditorField
							language="markdown"
							onChange={setValue}
							value={value}
							height="100%"
						/>
					</div>

					<div className="flex h-full w-full flex-col gap-1 overflow-hidden">
						<label className="text-sm font-semibold">Preview</label>
						<div className="relative flex w-full grow overflow-auto border border-light-border bg-white p-8">
							{isLoading && (
								<span className="absolute top-2 left-2 text-sm text-light">
									Compiling...
								</span>
							)}
							{isError && (
								<span className="absolute top-2 left-2 text-sm text-red-500 text-light">
									ERROR
								</span>
							)}
							{preview && (
								<MarkdownContainer>
									<MDXRemote {...preview} />
								</MarkdownContainer>
							)}
						</div>
					</div>
				</div>

				<DialogActions onClose={onClose}>
					<button type="button" className="btn-primary" onClick={() => onClose(value)}>
						Übernehmen
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
