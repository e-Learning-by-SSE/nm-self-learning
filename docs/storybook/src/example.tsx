import "../.storybook/tailwind-imports.css";

export function Example({ text }: { text: string }) {
	return <button className="bg-purple-800 px-8 py-1 rounded text-white font-bold">{text}</button>;
}

export default Example;
