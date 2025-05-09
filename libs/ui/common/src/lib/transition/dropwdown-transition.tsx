import { Fragment } from "react";
import { Transition } from "@headlessui/react";

export function DropwdownTransition({ children }: { children: React.ReactNode }) {
	return (
		<Transition
			as={Fragment}
			enter="transition ease-out duration-100"
			enterFrom="opacity-0 scale-95"
			enterTo="opacity-100 scale-100"
			leave="transition ease-in duration-75"
			leaveFrom="opacity-100 scale-100"
			leaveTo="opacity-0 scale-95"
		>
			{children}
		</Transition>
	);
}
