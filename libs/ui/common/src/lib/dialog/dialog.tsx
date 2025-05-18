"use client";
import {
	DialogPanel as HeadlessDialogPanel,
	DialogTitle as HeadlessDialogTitle,
	Dialog as HeadlessDialog,
	Transition
} from "@headlessui/react";
import { CSSProperties, Fragment, ReactNode } from "react";
import { GreyBoarderButton } from "../button/button";
import { EaseInTransitionChild } from "../transitions/ease-in-child";
import { SpringTransitionChild } from "../transitions/spring-in-child";
import { XMarkIcon } from "@heroicons/react/24/solid";
export type OnDialogCloseFn<T> = (result?: T) => void;

type RequiredSizeProps = {
	minWidth: string | number;
	maxHeight: string | number;
	maxWidth?: string | number;
} & Omit<CSSProperties, "maxWidth" | "maxHeight">;

const DEFAULT_DIALOG_STYLE_SIZE = {
	minWidth: 420,
	maxHeight: "80vh"
} satisfies RequiredSizeProps;

function Backdrop() {
	return (
		<EaseInTransitionChild>
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
		</EaseInTransitionChild>
	);
}

function DialogPanelTransition({ children }: { children: React.ReactNode }) {
	return (
		<Transition.Child
			as={Fragment}
			enter="ease-out duration-300"
			enterFrom="opacity-0 scale-95"
			enterTo="opacity-100 scale-100"
			leave="ease-in duration-200"
			leaveFrom="opacity-100 scale-100"
			leaveTo="opacity-0 scale-95"
		>
			{children}
		</Transition.Child>
	);
}

export function Dialog<TResult>({
	onClose,
	children,
	title,
	style,
	className,
	open = true
}: {
	title: string;
	onClose: OnDialogCloseFn<TResult>;
	children: React.ReactNode;
	style?: CSSProperties;
	className?: string;
	open?: boolean;
}) {
	return (
		<Transition appear show={open} as={Fragment}>
			<HeadlessDialog as="div" className="relative z-50" onClose={() => onClose(undefined)}>
				<Backdrop />
				<div className="fixed inset-0 flex items-center justify-center">
					{/* Dialog Panel with transition */}
					<DialogPanelTransition>
						<div className="absolute flex min-h-full items-center place-self-center">
							<HeadlessDialogPanel
								className={`relative mx-auto flex h-fit flex-col overflow-hidden rounded-lg bg-white p-8 ${
									className ?? ""
								}`}
								style={style ?? DEFAULT_DIALOG_STYLE_SIZE}
								data-testid="Dialog"
							>
								<HeadlessDialogTitle className="mb-8 text-2xl">
									{title}
								</HeadlessDialogTitle>
								{children}
							</HeadlessDialogPanel>
						</div>
					</DialogPanelTransition>
				</div>
			</HeadlessDialog>
		</Transition>
	);
}

type GameifyDialogProps = {
	title: string | React.ReactNode;
	open?: boolean;
	onClose: (result?: any) => void;
	children: React.ReactNode;
	responsive?: boolean;
	style?: RequiredSizeProps;
	className?: string;
	footer?: React.ReactNode;
};

/**
 * A Dialog component that uses Headless UI Dialog and Tailwind CSS for styling.
 * It provides a customizable dialog with a backdrop, title, and content area.
 * The dialog can be opened or closed programmatically, and it supports responsive design.
 * Should not be directly removed from the DOM, but rather hidden using the `open` prop, otherwise the animation will not work.
 */
export function GameifyDialog({
	open = true,
	onClose,
	children,
	title,
	responsive = true,
	style = DEFAULT_DIALOG_STYLE_SIZE,
	className,
	footer
}: GameifyDialogProps) {
	// Default responsive classes that can be overridden
	const responsiveClasses = responsive
		? {
				container: "p-4 sm:p-6",
				panel: "p-4 sm:p-6 md:p-8",
				title: "mb-4 sm:mb-6 md:mb-8 text-xl sm:text-2xl"
			}
		: {
				container: "p-4",
				panel: "p-8",
				title: "mb-8 text-2xl"
			};
	return (
		<Transition appear show={open} as={Fragment}>
			<HeadlessDialog as="div" className="relative z-50" onClose={() => onClose?.(undefined)}>
				<Backdrop />
				<div
					className={`fixed inset-0 flex items-center justify-center ${responsiveClasses.container}`}
				>
					{/* Dialog Panel with transition */}
					<SpringTransitionChild>
						<div className="flex w-full items-center justify-center">
							<HeadlessDialogPanel
								className={`relative mx-auto flex flex-col overflow-hidden rounded-lg bg-white ${responsiveClasses.panel} ${className ?? ""}`}
								style={style}
								data-testid="Dialog"
							>
								{/* Header with title and close button */}
								<div
									className={`font-medium ${responsiveClasses.title} flex-none flex justify-between items-center`}
								>
									<HeadlessDialogTitle>{title}</HeadlessDialogTitle>
									{onClose && (
										<button
											type="button"
											className="rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
											onClick={() => onClose(undefined)}
											aria-label="Close"
										>
											<XMarkIcon className="h-5 w-5" />
										</button>
									)}
								</div>
								{/* Content - scrollbar */}
								<div
									className="flex-1 overflow-y-auto pr-1"
									style={{ minHeight: "50px" }} // Minimale Höhe sicherstellen
								>
									{children}
								</div>
								{/* Footer - optional */}
								{footer && (
									<div className="flex-none mt-4 border-t pt-4">{footer}</div>
								)}
							</HeadlessDialogPanel>
						</div>
					</SpringTransitionChild>
				</div>
			</HeadlessDialog>
		</Transition>
	);
}

export function DialogWithReactNodeTitle<TResult>({
	onClose,
	children,
	title,
	style,
	className
}: {
	title: ReactNode;
	onClose: OnDialogCloseFn<TResult>;
	children: React.ReactNode;
	style?: CSSProperties;
	className?: string;
}) {
	return (
		<HeadlessDialog open={true} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full items-center place-self-center">
					{/* The actual dialog panel  */}
					<HeadlessDialogPanel
						className={`relative mx-auto flex h-fit flex-col overflow-hidden rounded-lg bg-white p-8 ${
							className ?? ""
						}`}
						style={style ?? { minWidth: 624, maxHeight: "80vh" }}
						data-testid="Dialog"
					>
						<HeadlessDialogTitle className="mb-8 text-2xl">{title}</HeadlessDialogTitle>
						{children}
					</HeadlessDialogPanel>
				</div>
			</div>
		</HeadlessDialog>
	);
}

export function DialogActions({
	onClose,
	children
}: {
	/** Function that will be called with `undefined` when the `Cancel` button is clicked. */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClose: OnDialogCloseFn<any>;
	/** Should include the call to action button.  */
	children?: React.ReactNode;
}) {
	return (
		<div className="pointer-events-auto mt-8 flex justify-end gap-2">
			<button onClick={() => onClose(undefined)} className="btn-stroked">
				<span className={"text-gray-600"}>Abbrechen</span>
			</button>
			{children}
		</div>
	);
}
