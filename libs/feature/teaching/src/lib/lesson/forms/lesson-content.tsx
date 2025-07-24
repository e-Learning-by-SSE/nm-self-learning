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
	SectionHeader,
	SectionCard,
	useIsFirstRender,
	XButton
} from "@self-learning/ui/common";
import { Form, LabeledField, MarkdownField } from "@self-learning/ui/forms";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { DraggableContentOutline, DraggableContentViewer } from "@self-learning/ui/layouts";

export type SetValueFn = <CType extends LessonContentType["type"]>(
	type: CType,
	value: ValueByContentType<CType> | undefined,
	index: number
) => void;

export function useLessonContentEditor(control: Control<{ content: LessonContent }>) {
	const {
		append,
		remove,
		swap,
		replace: setContent,
		fields: content
	} = useFieldArray<{ content: LessonContent }>({
		name: "content",
		control
	});

	const [contentTabIndex, setContentTabIndex] = useState<number | undefined>(undefined);

	// check content ids on mount (it will double trigger )
	const didContextInit = useRef(false);
	useEffect(() => {
		// prevent repetition
		if (didContextInit.current || content.length === 0) return;
		// do content indexing
		setContent(
			content.map((item, index) => ({
				...item,
				meta: {
					...item.meta,
					id: (index + 1).toString()
				}
			})) as LessonContent
		);
		//
		didContextInit.current = true;
		//
	}, [content, setContent]);

	useEffect(() => {
		if (content.length === 0) {
			setContentTabIndex(undefined);
		}

		if (contentTabIndex && contentTabIndex >= content.length) {
			setContentTabIndex(content.length > 0 ? 0 : undefined);
		}
	}, [contentTabIndex, content]);

	function addContent(type: LessonContentType["type"]) {
		const addActions: { [contentType in LessonContentType["type"]]: () => void } = {
			video: () =>
				append({
					type: "video",
					value: { url: "" },
					meta: { duration: 0 }
				}),
			article: () =>
				append({
					type: "article",
					value: { content: "" },
					meta: { estimatedDuration: 0 }
				}),
			pdf: () =>
				append({
					type: "pdf",
					value: { url: "" },
					meta: { estimatedDuration: 0 }
				}),
			iframe: () =>
				append({
					type: "iframe",
					value: { url: "" },
					meta: { estimatedDuration: 0 }
				})
		};

		const fn = addActions[type];

		if (!fn) {
			throw new Error(
				`Unknown content type: ${type} - There is no action defined to add this type.`
			);
		}

		fn();

		// Do not need it as scroll will automatically set current index
		// setContentTabIndex(content.length); // Select the newly created tab
	}

	function swapContent(indexSrc: number, indexDest: number) {
		swap(indexSrc, indexDest);
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

function LessonContentOutlineHeader({
	addContent
}: {
	addContent: (type: LessonContentType["type"]) => void;
}) {
	return (
		<section>
			<SectionHeader
				title="Inhalt"
				subtitle="Inhalt, der zur Wissensvermittlung genutzt werden soll. "
				button={
					<div className="flex gap-4 text-sm">
						<DropdownMenu
							title="Inhalt hinzufügen"
							button={
								<div className="btn-primary">
									<PlusIcon className="icon h-5" />
									<span className="font-semibold text-white">
										Inhalt hinzufügen
									</span>
								</div>
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
				}
			/>
		</section>
	);
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
						<XButton onClick={remove} title="Entfernen" className="flex items-center" />
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
			<div className="w-full overflow-hidden flex flex-col gap-8 mb-8">
				<LessonDescriptionForm />
				<LessonContentOutlineHeader addContent={addContent} />
				<DraggableContentViewer
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
			  lg:bg-white bg-gray-100 
				shadow-[0_-6px_6px_-4px_rgba(0,0,0,0.1)] lg:shadow-none"
			>
				<div
					className="sticky z-4 overflow-y-auto 
				bottom-0 lg:top-16 lg:max-h-none max-h-[35vh]
				lg:left-auto lg:h-auto pl-8 pr-4"
				>
					<h2
						className="flex gap-4 text-xl text-center w-max my-4 cursor-pointer"
						onClick={() => setIsOutlineOpen(prev => !prev)}
					>
						<ChevronDownIcon
							className={`w-5 h-5 transition-transform duration-200 ${isOutlineOpen ? "rotate-0" : "-rotate-90"} lg:hidden`}
						/>
						Inhalt
					</h2>
					<div className={`${isOutlineOpen ? "" : "hidden"} lg:block`}>
						<DraggableContentOutline
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
			<SectionHeader
				title="Beschreibung"
				subtitle="Ausführliche Beschreibung dieser Lerneinheit. Unterstützt Markdown."
			/>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<MarkdownField content={field.value as string} setValue={field.onChange} />
					)}
				/>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
