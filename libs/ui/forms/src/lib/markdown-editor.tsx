import { trpc } from "@self-learning/api-client";
import { MDXRemote } from "next-mdx-remote";
import { useEffect, useState } from "react";
import { EditorField } from "./editor";

export function MarkdownField({
	content,
	setValue,
	minHeight
}: {
	content: string | undefined;
	setValue: (v: string | undefined) => void;
	cacheKey: string[];
	minHeight?: string;
}) {
	const debounced = useDebounce(content, 500);

	const { data: preview, mutate, isLoading, isError } = trpc.useMutation(["mdx"]);

	useEffect(() => {
		// Triggers compilation of new `preview`
		mutate(debounced ?? "");
	}, [debounced, mutate]);

	const _minHeight = minHeight ?? "500px";
	const [height, setHeight] = useState(_minHeight);

	return (
		<div className="flex flex-col">
			<button
				type="button"
				onClick={() => setHeight(prev => (prev === _minHeight ? "75vh" : _minHeight))}
				className="self-start text-sm text-secondary"
			>
				{height === _minHeight ? "Ansicht vergrößern" : "Ansicht verkleinern"}
			</button>

			<div className="mt-4 grid grid-cols-2 items-start gap-8">
				<EditorField
					label="Inhalt"
					language="markdown"
					onChange={setValue}
					value={content}
					height={height}
				/>

				<div className="flex h-full w-full flex-col gap-2">
					<label className="text-sm font-semibold">Preview</label>
					<div
						className="relative flex w-full grow overflow-auto border border-light-border bg-white p-8"
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
						<div className="prose w-full">{preview && <MDXRemote {...preview} />}</div>
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
