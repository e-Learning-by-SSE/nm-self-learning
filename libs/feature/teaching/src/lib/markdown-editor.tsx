import { CompiledMarkdown } from "@self-learning/markdown";
import { EditorField } from "@self-learning/ui/forms";
import { MDXRemote } from "next-mdx-remote";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

export function MarkdownField({
	content,
	setValue,
	cacheKey
}: {
	content: string | undefined;
	setValue: (v: string | undefined) => void;
	cacheKey: string[];
}) {
	const debounced = useDebounce(content, 500);

	const {
		data: preview,
		isLoading,
		isRefetching,
		isError,
		refetch
	} = useQuery(cacheKey, () => fetchPreview(content));

	useEffect(() => {
		// Triggers compilation of new `preview`
		refetch();
	}, [debounced, cacheKey, refetch]);

	const [height, setHeight] = useState("500px");

	return (
		<div className="flex flex-col">
			<button
				onClick={() => setHeight(prev => (prev === "500px" ? "75vh" : "500px"))}
				className="self-start text-sm text-secondary"
			>
				{height === "500px" ? "Ansicht vergrößern" : "Ansicht verkleinern"}
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
						className="relative flex w-full grow overflow-auto border border-light-border p-8"
						style={{ maxHeight: height }}
					>
						{(isLoading || isRefetching) && (
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

async function fetchPreview(content: string | undefined) {
	if (!content || content === "") return null;

	const response = await fetch("/api/teachers/mdx", {
		method: "PUT",
		body: content
	});

	if (!response.ok) {
		// eslint-disable-next-line no-throw-literal
		throw { status: response.status, statusText: response.statusText };
	}

	return (await response.json()) as CompiledMarkdown;
}
