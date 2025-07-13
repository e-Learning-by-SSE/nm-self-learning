import { PlusIcon } from "@heroicons/react/24/solid";
import { LessonFormModel } from "@self-learning/teaching";
import {
	getContentTypeDisplayName,
	LessonContent,
	LessonContentMediaType,
	LessonContentType,
	ValueByContentType
} from "@self-learning/types";
import {
	DropdownMenu,
	RemovableTab,
	SectionHeader,
	Tab,
	Tabs,
	useIsFirstRender,
	XButton
} from "@self-learning/ui/common";
import { Form, LabeledField, MarkdownField } from "@self-learning/ui/forms";
import { Reorder } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Control, Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ArticleInput } from "../content-types/article";
import { IFrameInput } from "../content-types/iframe";
import { PdfInput } from "../content-types/pdf";
import { VideoInput } from "../content-types/video";
import { Button } from "@headlessui/react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Bars3Icon } from "@heroicons/react/24/outline";

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
	const idCounter = useRef(content.length + 1);
	function getNextId(type: LessonContentType["type"]) {
		return (idCounter.current++).toString();
	}

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
					meta: { duration: 0, id: getNextId(type) }
				}),
			article: () =>
				append({
					type: "article",
					value: { content: "" },
					meta: { estimatedDuration: 0, id: getNextId(type) }
				}),
			pdf: () =>
				append({
					type: "pdf",
					value: { url: "" },
					meta: { estimatedDuration: 0, id: getNextId(type) }
				}),
			iframe: () =>
				append({
					type: "iframe",
					value: { url: "" },
					meta: { estimatedDuration: 0, id: getNextId(type) }
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

const contentTypes: LessonContentMediaType[] = ["video", "article", "pdf", "iframe"];

function LessonContentViewer({
	content,
	setActiveContentIndex,
	targetIndex, // separate from contentIndex to avoid circle dependency
	resetTargetIndex,
	emptyMessage
}: {
	content: LessonContent;
	setActiveContentIndex: (idx: number | undefined) => void;
	targetIndex: number | undefined;
	resetTargetIndex: () => void;
	emptyMessage: string;
}) {
	const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
	const visibleItemsRef = useRef<Set<number>>(new Set());
	// scroll into selected
	useEffect(() => {
		if (targetIndex !== undefined && content[targetIndex] && contentRefs.current[targetIndex]) {
			contentRefs.current[targetIndex].scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
			resetTargetIndex();
		}
	}, [targetIndex]); // Deliberately avoid update on content to avoid scroll on delete, on swap, .... Allow only on click
	// Detect active element
	const calculateMinVisibleIndex = () => {
		if (visibleItemsRef.current.size === 0) return undefined;
		let min: number | undefined;
		for (const idx of visibleItemsRef.current) {
			if (min === undefined || idx < min) min = idx;
		}
		return min;
	};
	useEffect(() => {
		console.log("Hello");
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					const indexStr = (entry.target as HTMLElement).dataset?.["contentIndex"];
					if (indexStr !== undefined) {
						const index = parseInt(indexStr, 10);
						if (entry.isIntersecting) {
							visibleItemsRef.current.add(index);
						} else {
							visibleItemsRef.current.delete(index);
						}
					}
				});
				const newActiveIndex = calculateMinVisibleIndex();
				setActiveContentIndex(newActiveIndex); // React ignores same index update
			},
			{
				root: null,
				rootMargin: "0px",
				threshold: 0.1
			}
		);

		contentRefs.current.forEach(ref => {
			if (ref) {
				observer.observe(ref);
			}
		});

		return () => {
			observer.disconnect();
		};
	}, [content, setActiveContentIndex]);

	if (!content || content.length === 0) {
		return (
			<section>
				<div className="rounded-lg border border-light-border bg-white py-80 text-center text-light">
					{emptyMessage}
				</div>
			</section>
		);
	}

	return (
		<section className="flex flex-col gap-4">
			{content.map((item, index) => (
				<div
					key={item.meta.id}
					ref={el => {
						contentRefs.current[index] = el;
					}}
					// Add a data attribute to easily retrieve the index in the Intersection Observer callback
					data-content-index={index}
					// Scroll positioning fix because of website header
					className="scroll-mt-16"
				>
					<RenderContentType index={index} content={item} />
				</div>
			))}
		</section>
	);
}

function ContentOutline({
	content,
	swapContent,
	removeContent,
	contentIndex,
	selectContent
}: {
	content: { id: string; value: string }[];
	swapContent: (src: number, dest: number) => void;
	removeContent?: (idx: number) => void;
	contentIndex: number | undefined;
	selectContent: (idx: number) => void; // separate from contentIndex to avoid circle dependency
}) {
	return (
		<DragDropContext
			onDragEnd={result => {
				if (result.reason !== "DROP" || !result.destination) return;
				swapContent(result.source.index, result.destination.index);
			}}
		>
			<Droppable droppableId="droppable" direction="vertical">
				{provided => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="overflow-y-auto"
					>
						<div className="flex flex-col flex-no-wrap gap-4 min-w-max">
							{content.map((item, index) => (
								<Draggable key={item.id} draggableId={item.id} index={index}>
									{provided => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											className={`flex gap-5 text-nowrap flex-nowrap items-center ${contentIndex === index ? "text-secondary" : "text-light"}`}
										>
											<Bars3Icon className="h-5 text-light" />
											<span onClick={() => selectContent(index)}>
												{item.value}
											</span>
											{removeContent && (
												<XButton
													onClick={() => removeContent(index)}
													title="Entfernen"
													className="flex items-center"
												/>
											)}
										</div>
									)}
								</Draggable>
							))}
						</div>
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

// horizontal
function LessonContentOutline({
	content,
	swapContent,
	removeContent,
	contentIndex,
	selectContentIndex
}: {
	content: { id: string; value: string }[];
	swapContent: (src: number, dest: number) => void;
	removeContent?: (idx: number) => void;
	contentIndex: number | undefined;
	selectContentIndex: (idx: number) => void;
}) {
	return (
		<DragDropContext
			onDragEnd={result => {
				if (result.reason !== "DROP" || !result.destination) return;
				swapContent(result.source.index, result.destination.index);
			}}
		>
			<Droppable droppableId="droppable" direction="horizontal">
				{provided => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="overflow-auto"
					>
						<Tabs selectedIndex={contentIndex} onChange={selectContentIndex}>
							<div className="flex flex-no-wrap gap-4 min-w-max">
								{content.map((item, index) => (
									<Draggable key={item.id} draggableId={item.id} index={index}>
										{provided => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
											>
												{removeContent && (
													<RemovableTab
														onRemove={() => removeContent(index)}
													>
														<div className="flex gap-5 items-center">
															<Bars3Icon className="h-5 text-light" />
															{item.value}
														</div>
													</RemovableTab>
												)}
												{!removeContent && (
													<Tab>
														<div className="flex gap-5 items-center">
															<Bars3Icon className="h-5 text-light" />
															{item.value}
														</div>
													</Tab>
												)}
											</div>
										)}
									</Draggable>
								))}
							</div>
						</Tabs>
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
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
							{contentTypes.map(contentType => (
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
			<div className="mb-8 mt-4"></div>
		</section>
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
		<div className="grid w-full gap-8">
			{/* overflow is hidden so the draggable area can scroll */}
			<div className="w-full overflow-hidden flex flex-col gap-8">
				<div className="">
					<LessonDescriptionForm />
				</div>
				<LessonContentOutlineHeader addContent={addContent} />
				<div className="max-w-full overflow-x-auto">
					<ContentOutline
						content={content.map(c => ({
							id: c.meta.id,
							value: getContentTypeDisplayName(c.type)
						}))}
						swapContent={swapContent}
						removeContent={removeContent}
						contentIndex={contentTabIndex}
						selectContent={setTargetTabIndex}
					/>
				</div>
				<LessonContentViewer
					content={content}
					targetIndex={targetTabIndex}
					resetTargetIndex={() => setTargetTabIndex(undefined)} // cheaky way to prevent scroll on update behavior (and more)
					setActiveContentIndex={setContentTabIndex}
					emptyMessage="Diese Lerneinheit hat noch keinen Inhalt."
				/>
			</div>
		</div>
	);
}

function RenderContentType({ index, content }: { index: number; content: LessonContentType }) {
	if (content.type === "video") {
		return <VideoInput index={index} />;
	}

	if (content.type === "article") {
		return <ArticleInput index={index} />;
	}

	if (content.type === "pdf") {
		return <PdfInput index={index} />;
	}

	if (content.type === "iframe") {
		return <IFrameInput index={index} />;
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
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
