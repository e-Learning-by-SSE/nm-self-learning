import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export function SearchField(props: JSX.IntrinsicElements["input"]) {
	return (
		<span className="mb-4 flex items-center rounded-lg border border-c-border bg-c-surface-0 py-1 px-3">
			<MagnifyingGlassIcon className="h-6 text-c-text-muted" />
			<input
				className="w-full border-none focus-within:outline-none focus:ring-0"
				value={props.value ?? undefined}
				placeholder={props.placeholder}
				onChange={props.onChange}
			/>
		</span>
	);
}
