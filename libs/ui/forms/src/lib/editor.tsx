import Editor from "@monaco-editor/react";
import "katex/dist/katex.css";
import { LabeledField } from "./labeled-field";

export function EditorField({
	label,
	value,
	onChange,
	language,
	height
}: {
	label: string;
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	language?: string;
	height?: string;
}) {
	return (
		<LabeledField label={label}>
			<Editor
				onMount={editor => {
					setTimeout(() => {
						editor?.getAction("editor.action.formatDocument")?.run();
					}, 500);
				}}
				className="border border-light-border"
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
		</LabeledField>
	);
}
