import Editor from "@monaco-editor/react";

export function EditorField({
	value,
	onChange,
	language,
	height
}: {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	language?: string;
	height?: string;
}) {
	return (
		<Editor
			onMount={editor => {
				setTimeout(() => {
					editor?.getAction("editor.action.formatDocument")?.run();
				}, 500);
			}}
			className="h-full border border-light-border"
			options={{
				minimap: { enabled: false },
				tabSize: 4,
				insertSpaces: false
			}}
			height={height ?? "500px"}
			defaultLanguage={language}
			value={value}
			onChange={onChange}
		/>
	);
}
