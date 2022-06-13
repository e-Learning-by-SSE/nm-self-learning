import Editor from "@monaco-editor/react";

export function EditorField({
	label,
	value,
	onChange,
	language
}: {
	label: string;
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	language?: "json" | "markdown";
}) {
	return (
		<div className="flex w-full flex-col gap-2">
			<label className="text-sm font-semibold">{label}</label>
			<Editor
				className="border border-light-border"
				options={{
					minimap: { enabled: false },
					tabSize: 4,
					insertSpaces: false
				}}
				height="500px"
				defaultLanguage={language}
				value={value}
				onChange={onChange}
			/>
		</div>
	);
}
