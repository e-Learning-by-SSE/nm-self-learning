import { Bars3Icon, ChevronDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { LessonFormModel } from "@self-learning/teaching";
import {
	CONTENT_TYPES,
	getContentTypeDisplayName,
	LessonContent,
	LessonContentType,
	ValueByContentType
} from "@self-learning/types";
import {
	DropdownMenu,
	IconOnlyButton,
	SectionCard,
	useIsFirstRender
} from "@self-learning/ui/common";
import { Form, LabeledField, MarkdownField } from "@self-learning/ui/forms";
import { useCallback, useEffect, useState } from "react";
import {
	Control,
	Controller,
	FieldArrayWithId,
	useFieldArray,
	useFormContext
} from "react-hook-form";
import { ArticleInput } from "../content-types/article";
import { IFrameInput } from "../content-types/iframe";
import { PdfInput } from "../content-types/pdf";
import { VideoInput } from "../content-types/video";
import { Button } from "@headlessui/react";
import { NavigableContentOutline, NavigableContentViewer } from "@self-learning/ui/layouts";
import { TrashIcon } from "@heroicons/react/24/outline";

export type SetValueFn = <CType extends LessonContentType["type"]>(
	type: CType,
	value: ValueByContentType<CType> | undefined,
	index: number
) => void;

export function useLessonContentEditor(control: Control<{ content: LessonContent }>) {
	const {
		append,
		remove,
		insert,
		replace: setContent,
		fields: content
	} = useFieldArray({
		name: "content",
		control
	});

	const [contentTabIndex, setContentTabIndex] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (content.length === 0) {
			setContentTabIndex(undefined);
		} else if (contentTabIndex !== undefined && contentTabIndex >= content.length) {
			// If the selected tab index is out of bounds, reset it to the first tab (0).
			setContentTabIndex(0);
		}
	}, [contentTabIndex, content.length]);

	function addContent(type: LessonContentType["type"]) {
		let newItem;
		switch (type) {
			case "video":
				newItem = {
					type: "video",
					value: { url: "" },
					meta: { duration: 0 }
				};
				break;
			case "article":
				newItem = {
					type: "article",
					value: { content: "" },
					meta: { estimatedDuration: 0 }
				};
				break;
			case "pdf":
				newItem = {
					type: "pdf",
					value: { url: "" },
					meta: { estimatedDuration: 0 }
				};
				break;
			case "iframe":
				newItem = {
					type: "iframe",
					value: { url: "" },
					meta: { estimatedDuration: 0 }
				};
				break;
			default:
				throw new Error(
					`Unknown content type: ${type} - No action defined to add this type.`
				);
		}
		append(newItem as LessonContentType);
	}

	function swapContent(indexSrc: number, indexDest: number) {
		const itemToMove = content[indexSrc];
		remove(indexSrc);
		insert(indexDest, itemToMove);
	}

	const removeContent = useCallback(
		(index: number) => {
			const confirmed = window.confirm("Inhalt entfernen ?");
			if (confirmed) {
				remove(index);
			}
		},
		[remove]
	);

	return {
		content,
		swapContent,
		addContent,
		removeContent,
		setContent,
		contentTabIndex,
		setContentTabIndex
	};
}

function ContentOutlineTab({
	item,
	swappable,
	remove,
	select,
	active
}: {
	item?: FieldArrayWithId<{ content: LessonContent }, "content", "id">;
	swappable?: boolean;
	remove?: () => void;
	select?: () => void;
	active?: boolean;
}) {
	return (
		<>
			{item && (
				<div className="flex gap-2 mb-2 text-nowrap flex-nowrap items-center rounded-lg border border-light-border bg-white text-sm p-2">
					{swappable && <Bars3Icon className="h-5 text-light" />}
					<span
						className={`w-full ${active ? "text-secondary" : "text-light"}`}
						onClick={select}
					>
						{getContentTypeDisplayName(item.type)}
					</span>
					{remove && (
						<IconOnlyButton
							icon={<TrashIcon className="h-5 w-5" />}
							variant="x-mark"
							onClick={remove}
							title="Entfernen"
						/>
					)}
				</div>
			)}
			{!item && "Kein Inhalt"}
		</>
	);
}

export function LessonContentEditor() {
	const { control } = useFormContext<{ content: LessonContent }>();
	const { content, addContent, removeContent, swapContent, contentTabIndex, setContentTabIndex } =
		useLessonContentEditor(control);

	// Helper to utilize scroll into view
	const [targetTabIndex, setTargetTabIndex] = useState<number | undefined>(undefined);
	const [isOutlineOpen, setIsOutlineOpen] = useState(false);

	return (
		<div className="w-full lg:grid lg:grid-cols-[1fr_300px] gap-8">
			<div className="w-full overflow-hidden flex flex-col gap-4 mb-8 mt-4">
				<LessonDescriptionForm />
				<h2 className="text-2xl mt-4">Inhalt</h2>
				<NavigableContentViewer
					content={content}
					targetIndex={targetTabIndex}
					resetTargetIndex={() => setTargetTabIndex(undefined)} // way to prevent scroll on update behavior (and more)
					setActiveIndex={setContentTabIndex}
					RenderContent={RenderContentType}
				/>
			</div>
			<div
				className="w-full sticky bottom-0
				max-h-[35vh] lg:max-h-none 
				border-t lg:border-t-0 lg:border-l border-l-0 
			  bg-gray-100 
				shadow-[0_-6px_6px_-4px_rgba(0,0,0,0.1)] lg:shadow-none"
			>
				<div
					className="sticky z-4 overflow-y-auto 
				bottom-0 lg:top-16 lg:max-h-none max-h-[35vh]
				lg:left-auto lg:h-auto pl-8 pr-4"
				>
					<div
						className="flex gap-4 w-full my-4 items-center justify-between"
						onClick={() => setIsOutlineOpen(prev => !prev)}
					>
						<ChevronDownIcon
							className={`w-5 h-5 transition-transform duration-200 ${isOutlineOpen ? "rotate-0" : "-rotate-90"} lg:hidden`}
						/>
						<h2 className="text-xl">Inhalt</h2>
						<DropdownMenu
							title="Inhalt hinzufügen"
							button={
								<IconOnlyButton
									icon={<PlusIcon className="h-5 w-5" />}
									variant="primary"
									title={"Inhalt hinzufügen"}
								/>
							}
						>
							{CONTENT_TYPES.map(contentType => (
								<Button
									key={contentType}
									type={"button"}
									title="Inhaltstyp Hinzufügen"
									className={"w-full text-left px-3 py-1"}
									onClick={() => addContent(contentType)}
								>
									{getContentTypeDisplayName(contentType)}
								</Button>
							))}
						</DropdownMenu>
					</div>
					<div className={`${isOutlineOpen ? "" : "hidden"} lg:block`}>
						<NavigableContentOutline
							content={content}
							swapContent={swapContent}
							removeContent={removeContent}
							activeIndex={contentTabIndex}
							setTargetIndex={setTargetTabIndex}
							RenderContent={ContentOutlineTab}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function RenderContentType({
	index,
	item
}: {
	index?: number;
	item?: FieldArrayWithId<{ content: LessonContent }, "content", "id">;
}) {
	if (!item || index === undefined || index === null) {
		return (
			<SectionCard>
				<span className="text-light">Diese Lerneinheit hat noch keinen Inhalt.</span>
			</SectionCard>
		);
	}

	if (item.type === "video") {
		return <VideoInput index={index} />;
	}

	if (item.type === "article") {
		return <ArticleInput index={index} />;
	}

	if (item.type === "pdf") {
		return <PdfInput index={index} />;
	}

	if (item.type === "iframe") {
		return <IFrameInput index={index} />;
	}
	// Must not happen!
	return <span className="text-red-500">Error: Unknown content type</span>;
}

export function LessonDescriptionForm() {
	const form = useFormContext<LessonFormModel>();
	const control = form.control;
	const currentLessonType = form.watch("lessonType");
	const suppressHighlight = useIsFirstRender();

	return (
		<section>
			{currentLessonType === "SELF_REGULATED" && (
				<div
					data-testid="aktivierungsfrage-element"
					className={`pt-4 rounded-md ${!suppressHighlight ? "animate-highlight" : ""}`}
				>
					<LabeledField label="Aktivierungsfrage" optional={false}>
						<Controller
							control={control}
							name="selfRegulatedQuestion"
							render={({ field }) => (
								<MarkdownField
									content={field.value as string}
									setValue={field.onChange}
								/>
							)}
						/>
					</LabeledField>
				</div>
			)}
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<MarkdownField
							content={field.value as string}
							setValue={field.onChange}
							compact={true}
							header={{ text: "Beschreibung", sz: "2xl" }}
						/>
					)}
				/>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
