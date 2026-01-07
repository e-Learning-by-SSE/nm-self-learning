import { TransitionChild } from "@headlessui/react";
import { Fragment } from "react/jsx-runtime";

/**
 * A wrapper component that provides smooth fade in/out transitions for its children
 *
 * This component uses the TransitionChild from Headless UI to create a fade effect
 * when elements are mounted or unmounted.
 * Must be used within a parent Transition
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Content to be wrapped with the transition effect
 *
 * @example
 * // Basic usage with parent Transition component
 * import { Transition } from '@headlessui/react';
 *
 * function MyComponent({ isVisible }) {
 *   return (
 *     <Transition show={isVisible} as={Fragment}>
 *       <EaseInTransition>
 *         <div className="bg-gray-800 p-4">Content to fade in/out</div>
 *       </EaseInTransition>
 *     </Transition>
 *   );
 * }
 */
export function EaseInTransitionChild({ children }: { children: React.ReactNode }) {
	return (
		<TransitionChild
			as={Fragment}
			enter="ease-out duration-300"
			enterFrom="opacity-0"
			enterTo="opacity-100"
			leave="ease-in duration-200"
			leaveFrom="opacity-100"
			leaveTo="opacity-0"
		>
			{children}
		</TransitionChild>
	);
}
