"use client";

import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Tab,
	TabGroup,
	TabList,
	TabPanel,
	TabPanels
} from "@headlessui/react";
import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "next-i18next";
import { Children, isValidElement, useState } from "react";
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

type MarkdownDivProps = ComponentPropsWithoutRef<"div"> & {
	"data-code-group"?: string;
	"data-code-title"?: string;
	// react-markdown supplies its HAST node, which must not become a DOM attribute.
	node?: unknown;
};

export function MarkdownDiv({ node: _node, ...props }: MarkdownDivProps) {
	if (props["data-code-group"] === "true") {
		return (
			<CodeGroupContainer>{props.children}</CodeGroupContainer>
		);
	}
	return <div {...props} />;
}

export function CodeGroupContainer({
	children
}: {
	children?: ReactNode;
}) {
	const { t } = useTranslation("common");
	const [open, setOpen] = useState(false);
	const snippets = Children.toArray(children).filter(
		(child): child is ReactElement<MarkdownDivProps> =>
			isValidElement<MarkdownDivProps>(child) && child.props["data-code-title"] !== undefined
	);
	if (!snippets.length) return <div>{children}</div>;

	return (
		<div
			className="not-prose my-6 min-w-0 overflow-hidden rounded-lg border border-c-border bg-c-surface-0 text-c-text"
			onClick={event => event.stopPropagation()}
		>
			<TabGroup>
				<div className="flex items-center gap-2 border-b border-c-border bg-c-surface-1 p-2">
					<TabList
						aria-label={t("Code_Group_Label")}
						className="flex min-w-0 flex-1 gap-1 overflow-x-auto"
					>
						{snippets.map((snippet, index) => (
							<Tab
								key={index}
								className="shrink-0 rounded px-3 py-2 text-sm font-medium hover:bg-c-neutral-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-c-primary data-[selected]:bg-c-primary data-[selected]:text-white"
							>
								{snippet.props["data-code-title"]}
							</Tab>
						))}
					</TabList>
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm hover:bg-c-neutral-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-c-primary"
						title={t("Code_Group_Compare")}
						aria-label={t("Code_Group_Compare")}
					>
						<ArrowsPointingOutIcon className="h-5 w-5" aria-hidden="true" />
						<span className="hidden sm:inline">{t("Code_Group_Compare")}</span>
					</button>
				</div>
				<TabPanels>
					{snippets.map((snippet, index) => (
						<TabPanel
							key={index}
							className="min-w-0 [&_pre]:m-0 [&_pre]:overflow-auto [&_pre]:rounded-none [&_pre]:bg-[#1e1e1e] [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white"
						>
							{snippet}
						</TabPanel>
					))}
				</TabPanels>
			</TabGroup>
			<Dialog
				open={open}
				onClose={setOpen}
				className="relative z-50"
				onClick={event => event.stopPropagation()}
			>
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />
				<div className="fixed inset-0">
					<DialogPanel className="not-prose flex h-full w-full flex-col bg-c-surface-0 text-c-text">
						<div className="flex items-center justify-between gap-4 border-b border-c-border p-4">
							<DialogTitle className="text-lg font-semibold">
								{t("Code_Group_Compare")}
							</DialogTitle>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label={t("Close")}
								className="rounded p-2 hover:bg-c-neutral-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-c-primary"
							>
								<XMarkIcon className="h-5 w-5" aria-hidden="true" />
							</button>
						</div>
						<div
							className="grid min-h-0 flex-1 gap-4 overflow-auto p-4"
							style={{
								gridTemplateColumns: `repeat(${snippets.length}, minmax(20rem, 1fr))`
							}}
						>
							{snippets.map((snippet, index) => (
								<section
									key={index}
									aria-label={snippet.props["data-code-title"]}
									className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded border border-c-border"
								>
									<h3 className="m-0 border-b border-c-border bg-c-surface-1 px-4 py-3 text-sm font-semibold">
										{snippet.props["data-code-title"]}
									</h3>
									<div className="min-h-0 flex-1 overflow-auto bg-[#1e1e1e] [&_pre]:m-0 [&_pre]:overflow-visible [&_pre]:rounded-none [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white">
										{snippet}
									</div>
								</section>
							))}
						</div>
					</DialogPanel>
				</div>
			</Dialog>
		</div>
	);
}

export const markdownComponents = { div: MarkdownDiv };
