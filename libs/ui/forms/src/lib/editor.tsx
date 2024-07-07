import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";

export function EditorField({
	value,
	onChange,
	language,
	height,
	onMount
}: {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	language?: string;
	height?: string;
	onMount?: (editor: editor.IStandaloneCodeEditor) => void;
}) {
	return (
		<Editor
			onMount={editor => {
				if (onMount) {
					onMount(editor);
				}
				onMount?.(editor);
				editor.focus();
				setTimeout(() => {
					editor?.getAction("editor.action.formatDocument")?.run();
				}, 250);
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
