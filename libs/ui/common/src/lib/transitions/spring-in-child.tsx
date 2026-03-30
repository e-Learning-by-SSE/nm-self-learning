import { TransitionChild } from "@headlessui/react";
import { Fragment } from "react/jsx-runtime";

/**
 * @example
 * <Transition appear show={isOpen}>
 *   <SpringTransitionChild>
 *     <div className="p-6 bg-white rounded-lg shadow-xl">
 *       Mein Inhalt
 *     </div>
 *   </SpringTransitionChild>
 * </Transition>
 */
export function SpringTransitionChild({ children }: { children: React.ReactNode }) {
	return (
		<TransitionChild
			as={Fragment}
			enter="duration-700 ease-[cubic-bezier(0.32,1.5,0.45,0.95)] transform-gpu"
			enterFrom="opacity-0 translate-y-8 scale-0"
			enterTo="opacity-100 translate-y-0 scale-100"
			leave="duration-500 ease-[cubic-bezier(0.68,-0.3,0.32,1.275)] transform-gpu"
			leaveFrom="opacity-100 translate-y-0 scale-100"
			leaveTo="opacity-0 translate-y-8 scale-50"
		>
			{children}
		</TransitionChild>
	);
}
