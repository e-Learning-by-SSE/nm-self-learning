import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { OnDialogCloseFn } from "./dialog";

export function Dialog<TResult>({
	onClose,
	open,
	children
}: {
	open: boolean;
	onClose: OnDialogCloseFn<TResult>;
	children: React.ReactNode;
}) {
	return (
		<HeadlessDialog open={open} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full translate-y-1/4 justify-center">
					{/* The actual dialog panel  */}
					<HeadlessDialog.Panel
						className="mx-auto flex h-fit w-[90vw] flex-col overflow-hidden rounded-lg bg-white lg:w-[800px]"
						style={{ maxHeight: "624px" }}
					>
						{children}
					</HeadlessDialog.Panel>
				</div>
			</div>
		</HeadlessDialog>
	);
}

export function SearchInput({
	filter,
	setFilter,
	placeholder
}: {
	filter: string;
	setFilter: (filter: string) => void;
	placeholder: string;
}) {
	return (
		<span className="flex items-center border-b border-b-light-border py-1 px-4">
			<MagnifyingGlassIcon className="h-6 px-2 text-light" />
			<Combobox.Input
				className="w-full border-none focus:ring-0"
				placeholder={placeholder}
				value={filter}
				onChange={e => setFilter(e.target.value)}
				autoComplete="off"
			/>
		</span>
	);
}

export function Options({ children }: { children: React.ReactNode }) {
	return (
		<div className="playlist-scroll overflow-auto">
			<Combobox.Options static={true} className="flex flex-col divide-y divide-light-border">
				{children}
			</Combobox.Options>
		</div>
	);
}

export function PaginationContainer({ children }: { children: React.ReactNode }) {
	return <span className="border-b border-light-border px-4">{children}</span>;
}
