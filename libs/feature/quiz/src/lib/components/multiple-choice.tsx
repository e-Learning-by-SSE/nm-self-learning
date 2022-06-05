import { ReactElement, useState } from "react";

export function MultipleChoiceAnswer({ content }: { content: ReactElement }) {
	const [selected, setSelected] = useState(false);

	function toggleSelected() {
		setSelected(value => !value);
	}

	return (
		<button
			className={`flex w-full flex-col rounded-lg border px-4 py-1 text-left transition-colors ${
				selected
					? "border-indigo-200 bg-indigo-500 text-white prose-headings:text-white prose-a:text-white"
					: "border-slate-200 bg-white"
			}`}
			onClick={toggleSelected}
		>
			{content}
		</button>
	);
}
