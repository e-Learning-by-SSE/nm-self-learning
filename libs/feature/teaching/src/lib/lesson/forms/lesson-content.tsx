import { PlusIcon } from "@heroicons/react/24/solid";
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
	useIsFirstRender
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
	item
}: {
	item?: FieldArrayWithId<{ content: LessonContent }, "content", "id">;
}) {
	return (
		<>
			{item && getContentTypeDisplayName(item.type)}
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

	return (
		// xl:grid-cols-[1fr_300px]
		<div className="grid w-full gap-8 lg:grid-cols-[1fr_300px]">
			{/* overflow is hidden so the draggable area can scroll */}
			<div className="w-full overflow-hidden flex flex-col gap-8 mb-8">
				<div className="">
					<LessonDescriptionForm />
				</div>
				<LessonContentOutlineHeader addContent={addContent} />
				<DraggableContentViewer
					content={content}
					targetIndex={targetTabIndex}
					resetTargetIndex={() => setTargetTabIndex(undefined)} // way to prevent scroll on update behavior (and more)
					setActiveIndex={setContentTabIndex}
					RenderContent={RenderContentType}
				/>
			</div>
			<div className="bg-gray-100 w-full h-full border-l">
				<div
					className="fixed z-4 overflow-y-auto 
				bottom-0 left-0 right-0 lg:top-28
				lg:left-auto lg:w-72 lg:max-h-none lg:h-auto "
				>
					<h2 className="text-xl text-center w-max ml-4 my-2">Inhalt</h2>
					<div className="ml-6">
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
